const request = require('supertest');
const mongoose = require('mongoose');
const { app, startServer, stopServer } = require('../server');
const Payment = require('../models/payment.model');
const Transaction = require('../models/transaction.model');
const User = require('../models/user.model');

describe('Payment Tests', () => {
    let server;
    let authToken;
    let testUser;
    let testTransaction;
    let testPayment;

    beforeAll(async () => {
        try {
            // Start server with dynamic port
            server = await startServer(0);
            console.log('Test server started on port:', server.address().port);

            // Create admin user and get token
            const adminResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@library.com',
                    password: 'admin123'
                });

            authToken = adminResponse.body.token;
            console.log('Admin login successful');
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
            // Clear test data
            await Payment.deleteMany({});
            await Transaction.deleteMany({});
            await User.deleteMany({ email: { $ne: 'admin@library.com' } });

            // Create test user
            testUser = await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: 'test123',
                role: 'member',
                status: 'active'
            });

            // Create test transaction with fine
            testTransaction = await Transaction.create({
                user: testUser._id,
                book: new mongoose.Types.ObjectId(),
                borrowDate: new Date('2025-04-01'),
                dueDate: new Date('2025-04-15'),
                returnDate: new Date('2025-04-20'),
                fine: {
                    amount: 5,
                    paid: false,
                    daysOverdue: 5
                }
            });

            // Create test payment
            testPayment = await Payment.create({
                user: testUser._id,
                transaction: testTransaction._id,
                amount: 5,
                paymentMethod: 'cash',
                status: 'pending'
            });

            console.log('Test data created successfully');
        } catch (error) {
            console.error('beforeEach error:', error);
            throw error;
        }
    });

    afterEach(async () => {
        try {
            await Payment.deleteMany({});
            await Transaction.deleteMany({});
            await User.deleteMany({ email: { $ne: 'admin@library.com' } });
            console.log('Test data cleaned up');
        } catch (error) {
            console.error('afterEach error:', error);
            throw error;
        }
    });

    describe('Payment Model Tests', () => {
        test('should create a payment with valid data', async () => {
            const newPayment = new Payment({
                user: testUser._id,
                transaction: testTransaction._id,
                amount: 10,
                paymentMethod: 'card',
                status: 'pending'
            });

            const savedPayment = await newPayment.save();
            expect(savedPayment._id).toBeDefined();
            expect(savedPayment.amount).toBe(10);
            expect(savedPayment.status).toBe('pending');
        });

        test('should fail to create payment without required fields', async () => {
            const invalidPayment = new Payment({
                amount: 5
            });

            try {
                await invalidPayment.save();
                fail('Should have thrown validation error');
            } catch (error) {
                expect(error.errors.user).toBeDefined();
                expect(error.errors.transaction).toBeDefined();
                expect(error.errors.paymentMethod).toBeDefined();
            }
        });

        test('should update payment status correctly', async () => {
            testPayment.status = 'completed';
            await testPayment.save();
            expect(testPayment.status).toBe('completed');

            testPayment.status = 'failed';
            await testPayment.save();
            expect(testPayment.status).toBe('failed');
        });
    });

    describe('Payment API Tests', () => {
        test('should create a new payment', async () => {
            const response = await request(app)
                .post('/api/payments')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    transactionId: testTransaction._id,
                    amount: 5,
                    paymentMethod: 'cash'
                });

            expect(response.status).toBe(201);
            expect(response.body.amount).toBe(5);
            expect(response.body.status).toBe('pending');
        });

        test('should get all payments', async () => {
            const response = await request(app)
                .get('/api/payments')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        test('should get user payments', async () => {
            const response = await request(app)
                .get('/api/payments/user')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        test('should process payment', async () => {
            const response = await request(app)
                .put(`/api/payments/${testPayment._id}/process`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('completed');

            // Verify transaction fine is marked as paid
            const updatedTransaction = await Transaction.findById(testTransaction._id);
            expect(updatedTransaction.fine.paid).toBe(true);
        });

        test('should fail payment', async () => {
            const response = await request(app)
                .put(`/api/payments/${testPayment._id}/fail`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ reason: 'Insufficient funds' });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('failed');
            expect(response.body.notes).toBe('Insufficient funds');

            // Verify transaction fine is still unpaid
            const updatedTransaction = await Transaction.findById(testTransaction._id);
            expect(updatedTransaction.fine.paid).toBe(false);
        });
    });
});
