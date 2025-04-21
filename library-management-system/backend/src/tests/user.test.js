const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { app, startServer, stopServer } = require('../server');
const User = require('../models/user.model');

describe('User Tests', () => {
    let server;
    let authToken;
    let testUser;

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
            await User.deleteMany({ email: { $ne: 'admin@library.com' } });
            
            // Create test user
            const hashedPassword = await bcrypt.hash('test123', 10);
            testUser = await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: hashedPassword,
                role: 'member',
                status: 'active'
            });
            console.log('Test user created:', testUser._id);
        } catch (error) {
            console.error('beforeEach error:', error);
            throw error;
        }
    });

    afterEach(async () => {
        try {
            await User.deleteMany({ email: { $ne: 'admin@library.com' } });
            console.log('Test users cleaned up');
        } catch (error) {
            console.error('afterEach error:', error);
            throw error;
        }
    });

    describe('User Model Tests', () => {
        test('should create a user with valid data', async () => {
            const newUser = new User({
                name: 'New User',
                email: 'new@example.com',
                password: 'password123',
                role: 'member'
            });

            const savedUser = await newUser.save();
            expect(savedUser._id).toBeDefined();
            expect(savedUser.email).toBe('new@example.com');
            expect(savedUser.role).toBe('member');
            expect(savedUser.status).toBe('active');
        });

        test('should fail to create user without required fields', async () => {
            const invalidUser = new User({
                name: 'Invalid User'
            });

            try {
                await invalidUser.save();
                fail('Should have thrown validation error');
            } catch (error) {
                expect(error.errors.email).toBeDefined();
                expect(error.errors.password).toBeDefined();
            }
        });

        test('should fail to create user with invalid email', async () => {
            const invalidUser = new User({
                name: 'Invalid User',
                email: 'invalid-email',
                password: 'password123',
                role: 'member'
            });

            try {
                await invalidUser.save();
                fail('Should have thrown validation error');
            } catch (error) {
                expect(error.errors.email).toBeDefined();
            }
        });

        test('should hash password before saving', async () => {
            const user = new User({
                name: 'Password Test User',
                email: 'password@test.com',
                password: 'password123',
                role: 'member'
            });

            await user.save();
            expect(user.password).not.toBe('password123');
            expect(user.password.length).toBeGreaterThan(20);
        });
    });

    describe('User API Tests', () => {
        test('should get all users', async () => {
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        test('should get user by id', async () => {
            const response = await request(app)
                .get(`/api/users/${testUser._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body._id).toBe(testUser._id.toString());
            expect(response.body.email).toBe(testUser.email);
        });

        test('should update user', async () => {
            const updateData = {
                name: 'Updated Name',
                status: 'inactive'
            };

            const response = await request(app)
                .put(`/api/users/${testUser._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.name).toBe('Updated Name');
            expect(response.body.status).toBe('inactive');
        });

        test('should change user password', async () => {
            const response = await request(app)
                .put(`/api/users/${testUser._id}/password`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    currentPassword: 'test123',
                    newPassword: 'newpassword123'
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBeDefined();

            // Verify new password works
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'newpassword123'
                });

            expect(loginResponse.status).toBe(200);
            expect(loginResponse.body.token).toBeDefined();
        });

        test('should get user profile', async () => {
            // Login as test user
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'test123'
                });

            const userToken = loginResponse.body.token;

            const response = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body.email).toBe(testUser.email);
            expect(response.body.role).toBe('member');
        });
    });
});
