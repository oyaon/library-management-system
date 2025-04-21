const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { app, startServer, stopServer } = require('../server');

describe('API Integration Tests', () => {
    let server;
    let authToken;

    beforeAll(async () => {
        // Start server with port 0 for dynamic port allocation
        server = await startServer(0);
        console.log('Test server started on port:', server.address().port);
    });

    afterAll(async () => {
        await stopServer();
        console.log('Test server stopped');
    });

    beforeEach(async () => {
        try {
            // Clear test data
            const collections = await mongoose.connection.db.collections();
            for (let collection of collections) {
                await collection.deleteMany({});
            }
            console.log('Test collections cleared');

            // Create test admin user
            const User = mongoose.model('User');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            const adminUser = await User.create({
                name: 'Admin User',
                email: 'admin@library.com',
                password: hashedPassword,
                role: 'admin',
                status: 'active'
            });
            console.log('Test admin user created:', adminUser._id);
        } catch (error) {
            console.error('Setup error:', error);
            throw error;
        }
    });

    describe('Authentication', () => {
        test('Login Flow', async () => {
            try {
                console.log('\n1. Testing Login...');
                const response = await request(app)
                    .post('/api/auth/login')
                    .send({
                        email: 'admin@library.com',
                        password: 'admin123'
                    });

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('token');
                authToken = response.body.token;
                console.log('Login successful, token received');
            } catch (error) {
                console.error('Login error:', error);
                throw error;
            }
        });
    });

    describe('Book Management', () => {
        test('Create and Get Books', async () => {
            try {
                // First login to get token
                const loginResponse = await request(app)
                    .post('/api/auth/login')
                    .send({
                        email: 'admin@library.com',
                        password: 'admin123'
                    });
                authToken = loginResponse.body.token;
                console.log('Login successful for book test');

                // Create a book
                console.log('\n2. Testing Create Book...');
                const newBook = {
                    title: 'Test Book',
                    author: 'Test Author',
                    isbn: '1234567890',
                    quantity: 5
                };

                const createResponse = await request(app)
                    .post('/api/books')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(newBook);

                expect(createResponse.status).toBe(201);
                expect(createResponse.body).toHaveProperty('_id');
                console.log('Book created:', createResponse.body._id);

                // Get books
                console.log('\n3. Testing Get Books...');
                const getBooksResponse = await request(app)
                    .get('/api/books')
                    .set('Authorization', `Bearer ${authToken}`);

                expect(getBooksResponse.status).toBe(200);
                expect(Array.isArray(getBooksResponse.body)).toBe(true);
                expect(getBooksResponse.body.length).toBeGreaterThan(0);
                console.log('Retrieved books count:', getBooksResponse.body.length);
            } catch (error) {
                console.error('Book operation error:', error);
                throw error;
            }
        });
    });

    describe('Reservations', () => {
        test('Book Reservation Flow', async () => {
            try {
                // First login to get token
                const loginResponse = await request(app)
                    .post('/api/auth/login')
                    .send({
                        email: 'admin@library.com',
                        password: 'admin123'
                    });
                authToken = loginResponse.body.token;
                console.log('Login successful for reservation test');

                // Create a book to reserve
                const newBook = {
                    title: 'Test Book for Reservation',
                    author: 'Test Author',
                    isbn: '1234567891',
                    quantity: 5
                };

                const createResponse = await request(app)
                    .post('/api/books')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(newBook);

                const bookId = createResponse.body._id;
                console.log('Book created for reservation:', bookId);

                // Reserve the book
                console.log('\n4. Testing Book Reservation...');
                const reserveResponse = await request(app)
                    .post('/api/reservations')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ bookId });

                expect(reserveResponse.status).toBe(201);
                console.log('Book reserved successfully');

                // Check user's reservations
                const userReservations = await request(app)
                    .get('/api/reservations/user')
                    .set('Authorization', `Bearer ${authToken}`);

                expect(userReservations.status).toBe(200);
                expect(Array.isArray(userReservations.body)).toBe(true);
                expect(userReservations.body.length).toBeGreaterThan(0);
                console.log('User reservations count:', userReservations.body.length);
            } catch (error) {
                console.error('Reservation error:', error);
                throw error;
            }
        });
    });

    describe('Transactions', () => {
        test('Borrow and Return Flow', async () => {
            try {
                // First login to get token
                const loginResponse = await request(app)
                    .post('/api/auth/login')
                    .send({
                        email: 'admin@library.com',
                        password: 'admin123'
                    });
                authToken = loginResponse.body.token;
                console.log('Login successful for transaction test');

                // Create a book to borrow
                const newBook = {
                    title: 'Test Book for Borrowing',
                    author: 'Test Author',
                    isbn: '1234567892',
                    quantity: 5
                };

                const createResponse = await request(app)
                    .post('/api/books')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(newBook);

                const bookId = createResponse.body._id;
                console.log('Book created for borrowing:', bookId);

                // Borrow the book
                console.log('\n5. Testing Borrow Book...');
                const borrowResponse = await request(app)
                    .post('/api/transactions/borrow')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ bookId });

                expect(borrowResponse.status).toBe(201);
                expect(borrowResponse.body).toHaveProperty('_id');
                console.log('Book borrowed successfully');

                // Return the book
                const transactionId = borrowResponse.body._id;
                const returnResponse = await request(app)
                    .post(`/api/transactions/${transactionId}/return`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({});

                expect(returnResponse.status).toBe(200);
                console.log('Book returned successfully');
            } catch (error) {
                console.error('Transaction error:', error);
                throw error;
            }
        });
    });
});
