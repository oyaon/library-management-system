const request = require('supertest');
const mongoose = require('mongoose');
const { app, startServer, stopServer } = require('../server');
const Reservation = require('../models/reservation.model');
const Book = require('../models/book.model');
const User = require('../models/user.model');

describe('Reservation Tests', () => {
    let server;
    let authToken;
    let testBook;
    let testUser;
    let testReservation;

    beforeAll(async () => {
        try {
            // Start server with dynamic port
            server = await startServer(0);
            console.log('Test server started on port:', server.address().port);

            // Create test user and get token
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@library.com',
                    password: 'admin123'
                });

            authToken = loginResponse.body.token;
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
            await Reservation.deleteMany({});
            await Book.deleteMany({});
            await User.deleteMany({});

            // Create test user
            testUser = await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: 'test123',
                role: 'member',
                status: 'active'
            });

            // Create test book
            testBook = await Book.create({
                title: 'Test Book',
                author: 'Test Author',
                isbn: '1234567890',
                quantity: 5,
                category: 'Fiction'
            });

            // Create test reservation
            testReservation = await Reservation.create({
                user: testUser._id,
                book: testBook._id,
                status: 'pending',
                expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            });

            console.log('Test data created successfully');
        } catch (error) {
            console.error('beforeEach error:', error);
            throw error;
        }
    });

    afterEach(async () => {
        try {
            await Reservation.deleteMany({});
            await Book.deleteMany({});
            await User.deleteMany({});
            console.log('Test data cleaned up');
        } catch (error) {
            console.error('afterEach error:', error);
            throw error;
        }
    });

    describe('Reservation Model Tests', () => {
        test('should create a reservation with valid data', async () => {
            const newReservation = new Reservation({
                user: testUser._id,
                book: testBook._id,
                status: 'pending',
                expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            });

            const savedReservation = await newReservation.save();
            expect(savedReservation._id).toBeDefined();
            expect(savedReservation.status).toBe('pending');
        });

        test('should fail to create reservation without required fields', async () => {
            const invalidReservation = new Reservation({
                status: 'pending'
            });

            try {
                await invalidReservation.save();
                fail('Should have thrown validation error');
            } catch (error) {
                expect(error.errors.user).toBeDefined();
                expect(error.errors.book).toBeDefined();
            }
        });

        test('should update reservation status correctly', async () => {
            await testReservation.approve();
            expect(testReservation.status).toBe('approved');

            await testReservation.reject('Not available');
            expect(testReservation.status).toBe('rejected');
            expect(testReservation.notes).toBe('Not available');

            await testReservation.cancel();
            expect(testReservation.status).toBe('cancelled');

            await testReservation.complete();
            expect(testReservation.status).toBe('completed');
        });
    });

    describe('Reservation API Tests', () => {
        test('should create a new reservation', async () => {
            const response = await request(app)
                .post('/api/reservations')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    bookId: testBook._id
                });

            expect(response.status).toBe(201);
            expect(response.body.book).toBe(testBook._id.toString());
            expect(response.body.status).toBe('pending');
        });

        test('should get all reservations', async () => {
            const response = await request(app)
                .get('/api/reservations')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        test('should get user reservations', async () => {
            const response = await request(app)
                .get('/api/reservations/user')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        test('should approve reservation', async () => {
            const response = await request(app)
                .put(`/api/reservations/${testReservation._id}/approve`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('approved');
        });

        test('should reject reservation', async () => {
            const response = await request(app)
                .put(`/api/reservations/${testReservation._id}/reject`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ notes: 'Book not available' });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('rejected');
            expect(response.body.notes).toBe('Book not available');
        });

        test('should cancel reservation', async () => {
            const response = await request(app)
                .put(`/api/reservations/${testReservation._id}/cancel`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('cancelled');
        });
    });
});
