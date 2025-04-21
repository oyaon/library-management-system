const mongoose = require('mongoose');
const { startServer, stopServer } = require('../server');
require('dotenv').config();

describe('Fine Calculation Tests', () => {
    let transaction;
    let Transaction;
    let server;

    beforeAll(async () => {
        try {
            // Start server with dynamic port
            server = await startServer(0);
            console.log('Test server started on port:', server.address().port);

            try {
                Transaction = mongoose.model('Transaction');
            } catch {
                const transactionSchema = new mongoose.Schema({
                    user: mongoose.Schema.Types.ObjectId,
                    book: mongoose.Schema.Types.ObjectId,
                    borrowDate: Date,
                    dueDate: Date,
                    returnDate: Date,
                    status: {
                        type: String,
                        enum: ['active', 'completed', 'overdue'],
                        default: 'active'
                    },
                    fine: {
                        amount: { type: Number, default: 0 },
                        paid: { type: Boolean, default: false },
                        daysOverdue: { type: Number, default: 0 }
                    }
                });

                transactionSchema.methods.calculateFine = function() {
                    if (!this.returnDate) {
                        return 0;
                    }

                    const dueDate = new Date(this.dueDate);
                    const returnDate = new Date(this.returnDate);
                    
                    if (returnDate <= dueDate) {
                        return 0;
                    }

                    const daysOverdue = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24));
                    const fineAmount = daysOverdue * 1;
                    
                    this.fine.amount = fineAmount;
                    this.fine.daysOverdue = daysOverdue;
                    
                    return fineAmount;
                };

                transactionSchema.methods.updateStatus = function() {
                    const now = new Date();
                    const dueDate = new Date(this.dueDate);

                    if (this.returnDate) {
                        this.status = 'completed';
                    } else if (now > dueDate) {
                        this.status = 'overdue';
                    } else {
                        this.status = 'active';
                    }
                };

                Transaction = mongoose.model('Transaction', transactionSchema);
            }
        } catch (error) {
            console.error('Setup error:', error);
            throw error;
        }
    });

    afterAll(async () => {
        await stopServer();
        console.log('Test server stopped');
    });

    beforeEach(async () => {
        try {
            await Transaction.deleteMany({});
            transaction = new Transaction({
                user: new mongoose.Types.ObjectId(),
                book: new mongoose.Types.ObjectId(),
                borrowDate: new Date('2025-04-01'),
                dueDate: new Date('2025-04-15'), // 14 days loan period
            });
            console.log('Created test transaction');
        } catch (error) {
            console.error('beforeEach error:', error);
            throw error;
        }
    });

    afterEach(async () => {
        try {
            await Transaction.deleteMany({});
            console.log('Cleaned up test transactions');
        } catch (error) {
            console.error('afterEach error:', error);
            throw error;
        }
    });

    test('No fine for return before due date', () => {
        transaction.returnDate = new Date('2025-04-14');
        const fine = transaction.calculateFine();
        expect(fine).toBe(0);
    });

    test('No fine for return on due date', () => {
        transaction.returnDate = new Date('2025-04-15');
        const fine = transaction.calculateFine();
        expect(fine).toBe(0);
    });

    test('Fine for 1 day overdue', () => {
        transaction.returnDate = new Date('2025-04-16');
        const fine = transaction.calculateFine();
        expect(fine).toBe(1); // $1 per day
    });

    test('Fine for 5 days overdue', () => {
        transaction.returnDate = new Date('2025-04-20');
        const fine = transaction.calculateFine();
        expect(fine).toBe(5); // $5 for 5 days
    });

    test('No fine when return date is not set', () => {
        const fine = transaction.calculateFine();
        expect(fine).toBe(0);
    });

    test('Status updates correctly', () => {
        // Test active status
        transaction.dueDate = new Date('2025-04-30'); // Set due date in the future
        transaction.updateStatus();
        expect(transaction.status).toBe('active');

        // Test overdue status
        transaction.dueDate = new Date('2025-04-01');
        transaction.updateStatus();
        expect(transaction.status).toBe('overdue');

        // Test completed status
        transaction.returnDate = new Date();
        transaction.updateStatus();
        expect(transaction.status).toBe('completed');
    });
});

describe('Fine Payment Integration Tests', () => {
    let transaction;
    let Transaction;
    let server;

    beforeAll(async () => {
        try {
            // Start server with dynamic port
            server = await startServer(0);
            console.log('Test server started on port:', server.address().port);
            Transaction = mongoose.model('Transaction');
        } catch (error) {
            console.error('Setup error:', error);
            throw error;
        }
    });

    afterAll(async () => {
        await stopServer();
        console.log('Test server stopped');
    });

    beforeEach(async () => {
        try {
            await Transaction.deleteMany({});
            transaction = await Transaction.create({
                user: new mongoose.Types.ObjectId(),
                book: new mongoose.Types.ObjectId(),
                borrowDate: new Date('2025-04-01'),
                dueDate: new Date('2025-04-15'),
                returnDate: new Date('2025-04-20'), // 5 days overdue
            });
            console.log('Created test transaction for fine payment');
        } catch (error) {
            console.error('beforeEach error:', error);
            throw error;
        }
    });

    afterEach(async () => {
        try {
            await Transaction.deleteMany({});
            console.log('Cleaned up test transactions');
        } catch (error) {
            console.error('afterEach error:', error);
            throw error;
        }
    });

    test('Fine is calculated correctly after return', async () => {
        const fine = transaction.calculateFine();
        expect(fine).toBe(5);
        expect(transaction.fine.amount).toBe(5);
        expect(transaction.fine.daysOverdue).toBe(5);
    });

    test('Fine details are updated and persisted', async () => {
        transaction.calculateFine();
        await transaction.save();

        const savedTransaction = await Transaction.findById(transaction._id);
        expect(savedTransaction.fine).toEqual({
            amount: 5,
            daysOverdue: 5,
            paid: false
        });
    });
});
