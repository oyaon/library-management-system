const request = require('supertest');
const mongoose = require('mongoose');
const { app, startServer, stopServer } = require('../server');
const Book = require('../models/book.model');

describe('Book Tests', () => {
    let server;
    let authToken;
    let testBook;

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
            await Book.deleteMany({});
            testBook = await Book.create({
                title: 'Test Book',
                author: 'Test Author',
                isbn: '1234567890',
                quantity: 5,
                category: 'Fiction',
                publishedYear: 2023,
                description: 'A test book description'
            });
            console.log('Created test book:', testBook._id);
        } catch (error) {
            console.error('beforeEach error:', error);
            throw error;
        }
    });

    afterEach(async () => {
        try {
            await Book.deleteMany({});
            console.log('Cleaned up test books');
        } catch (error) {
            console.error('afterEach error:', error);
            throw error;
        }
    });

    describe('Book Model Tests', () => {
        test('should create a book with valid fields', async () => {
            const validBook = new Book({
                title: 'New Book',
                author: 'New Author',
                isbn: '0987654321',
                quantity: 3,
                category: 'Non-Fiction',
                publishedYear: 2024,
                description: 'A new test book'
            });

            const savedBook = await validBook.save();
            expect(savedBook._id).toBeDefined();
            expect(savedBook.title).toBe('New Book');
            expect(savedBook.isbn).toBe('0987654321');
        });

        test('should fail to create a book without required fields', async () => {
            const invalidBook = new Book({
                author: 'Test Author',
                quantity: 1
            });

            try {
                await invalidBook.save();
                fail('Should have thrown validation error');
            } catch (error) {
                expect(error.errors.title).toBeDefined();
                expect(error.errors.isbn).toBeDefined();
            }
        });

        test('should fail to create a book with invalid ISBN', async () => {
            const invalidBook = new Book({
                title: 'Test Book',
                author: 'Test Author',
                isbn: '123', // Too short
                quantity: 1,
                category: 'Fiction'
            });

            try {
                await invalidBook.save();
                fail('Should have thrown validation error');
            } catch (error) {
                expect(error.errors.isbn).toBeDefined();
            }
        });
    });

    describe('Book API Tests', () => {
        test('should get all books', async () => {
            const response = await request(app)
                .get('/api/books')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0].title).toBe('Test Book');
        });

        test('should get a single book by id', async () => {
            const response = await request(app)
                .get(`/api/books/${testBook._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body._id).toBe(testBook._id.toString());
            expect(response.body.title).toBe('Test Book');
        });

        test('should create a new book', async () => {
            const newBook = {
                title: 'New Test Book',
                author: 'New Test Author',
                isbn: '9876543210',
                quantity: 3,
                category: 'Non-Fiction',
                publishedYear: 2024,
                description: 'A new test book description'
            };

            const response = await request(app)
                .post('/api/books')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newBook);

            expect(response.status).toBe(201);
            expect(response.body.title).toBe('New Test Book');
            expect(response.body.isbn).toBe('9876543210');
        });

        test('should update a book', async () => {
            const updateData = {
                title: 'Updated Book Title',
                quantity: 10
            };

            const response = await request(app)
                .put(`/api/books/${testBook._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.title).toBe('Updated Book Title');
            expect(response.body.quantity).toBe(10);
            expect(response.body.author).toBe('Test Author'); // Unchanged field
        });

        test('should delete a book', async () => {
            const response = await request(app)
                .delete(`/api/books/${testBook._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBeDefined();

            // Verify book is deleted
            const deletedBook = await Book.findById(testBook._id);
            expect(deletedBook).toBeNull();
        });

        test('should search books by title or author', async () => {
            // Create additional books for search test
            await Book.create([
                {
                    title: 'JavaScript Programming',
                    author: 'John Doe',
                    isbn: '1111111111',
                    quantity: 3,
                    category: 'Programming'
                },
                {
                    title: 'Python Basics',
                    author: 'John Doe',
                    isbn: '2222222222',
                    quantity: 2,
                    category: 'Programming'
                }
            ]);

            // Search by title
            const titleResponse = await request(app)
                .get('/api/books/search?query=JavaScript')
                .set('Authorization', `Bearer ${authToken}`);

            expect(titleResponse.status).toBe(200);
            expect(titleResponse.body.length).toBe(1);
            expect(titleResponse.body[0].title).toBe('JavaScript Programming');

            // Search by author
            const authorResponse = await request(app)
                .get('/api/books/search?query=John Doe')
                .set('Authorization', `Bearer ${authToken}`);

            expect(authorResponse.status).toBe(200);
            expect(authorResponse.body.length).toBe(2);
            expect(authorResponse.body[0].author).toBe('John Doe');
        });
    });
});
