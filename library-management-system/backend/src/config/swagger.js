const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Library Management System API',
            version: '1.0.0',
            description: 'API documentation for the Library Management System. This system provides endpoints for managing books, users, transactions, reservations, and payments in a library setting.',
            contact: {
                name: 'API Support',
                email: 'support@library.com'
            },
            license: {
                name: 'ISC',
                url: 'https://opensource.org/licenses/ISC'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Development server'
            },
            {
                url: 'https://library-api.example.com/api',
                description: 'Production server'
            }
        ],
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Users', description: 'User management endpoints' },
            { name: 'Books', description: 'Book management endpoints' },
            { name: 'Transactions', description: 'Book borrowing and return endpoints' },
            { name: 'Reservations', description: 'Book reservation endpoints' },
            { name: 'Payments', description: 'Fine payment endpoints' },
            { name: 'Reports', description: 'Reporting and analytics endpoints' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token in the format: Bearer <token>'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        role: { type: 'string', enum: ['admin', 'member'] },
                        status: { type: 'string', enum: ['active', 'inactive'] },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Book: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        author: { type: 'string' },
                        ISBN: { type: 'string' },
                        category: { type: 'string' },
                        quantity: { type: 'integer', minimum: 0 },
                        availableCopies: { type: 'integer', minimum: 0 },
                        location: {
                            type: 'object',
                            properties: {
                                shelf: { type: 'string' },
                                row: { type: 'string' }
                            }
                        },
                        status: { type: 'string', enum: ['available', 'unavailable'] },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Transaction: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', format: 'uuid' },
                        user: { type: 'string', format: 'uuid' },
                        book: { type: 'string', format: 'uuid' },
                        borrowDate: { type: 'string', format: 'date-time' },
                        dueDate: { type: 'string', format: 'date-time' },
                        returnDate: { type: 'string', format: 'date-time' },
                        status: { type: 'string', enum: ['active', 'completed', 'overdue'] },
                        fine: {
                            type: 'object',
                            properties: {
                                amount: { type: 'number' },
                                paid: { type: 'boolean' },
                                daysOverdue: { type: 'integer' }
                            }
                        }
                    }
                },
                Reservation: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', format: 'uuid' },
                        user: { type: 'string', format: 'uuid' },
                        book: { type: 'string', format: 'uuid' },
                        status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'] },
                        reservationDate: { type: 'string', format: 'date-time' },
                        expiryDate: { type: 'string', format: 'date-time' }
                    }
                },
                Payment: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', format: 'uuid' },
                        user: { type: 'string', format: 'uuid' },
                        transaction: { type: 'string', format: 'uuid' },
                        amount: { type: 'number' },
                        paymentMethod: { type: 'string', enum: ['cash', 'card'] },
                        status: { type: 'string', enum: ['pending', 'completed', 'failed'] },
                        notes: { type: 'string' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        code: { type: 'integer' }
                    }
                }
            },
            responses: {
                UnauthorizedError: {
                    description: 'Access token is missing or invalid',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                ValidationError: {
                    description: 'Invalid input data',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                NotFoundError: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                }
            },
            parameters: {
                idParam: {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                        format: 'uuid'
                    },
                    description: 'Resource identifier'
                },
                limitParam: {
                    name: 'limit',
                    in: 'query',
                    schema: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 100,
                        default: 10
                    },
                    description: 'Number of items to return'
                },
                pageParam: {
                    name: 'page',
                    in: 'query',
                    schema: {
                        type: 'integer',
                        minimum: 1,
                        default: 1
                    },
                    description: 'Page number'
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./src/routes/*.js'] // Path to the API routes
};

const specs = swaggerJsdoc(options);
module.exports = specs;
