# Library Management System

A robust backend system for managing library operations built with Node.js, Express, and MongoDB.

## Features

### Core Features
- **Book Management**
  - Add, update, delete books
  - Search books by title, author, or ISBN
  - Track book availability and location
  - Manage multiple copies of the same book

- **User Management**
  - Role-based access control (Admin/Member)
  - User registration and authentication
  - Profile management
  - Member status tracking

- **Borrowing System**
  - Book checkout and return
  - Due date tracking
  - Fine calculation for late returns
  - Borrowing history

- **Reservation System**
  - Book reservation
  - Waitlist management
  - Reservation status tracking
  - Auto-expiry of reservations

- **Payment System**
  - Fine payment processing
  - Payment history
  - Multiple payment methods
  - Receipt generation

- **Reporting**
  - Book circulation statistics
  - Fine collection reports
  - Popular books tracking
  - Member activity reports

### Additional Features
- JWT-based Authentication
- Role-based Authorization
- Rate Limiting
- API Documentation with Swagger
- Input Validation
- Error Handling
- Secure Headers with Helmet
- CORS Support
- Database Seeding

## Tech Stack

- **Backend Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: Express Validator
- **Security**: 
  - Helmet for secure headers
  - bcryptjs for password hashing
  - CORS for cross-origin resource sharing
  - Rate limiting for API protection
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest with Supertest

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/library-management-system.git
   cd library-management-system/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update the variables as needed:
     ```
     # Server Configuration
     PORT=3000
     NODE_ENV=development

     # MongoDB Configuration
     MONGODB_URI=mongodb://localhost:27017/library
     MONGODB_URI_TEST=mongodb://localhost:27017/library-test

     # JWT Configuration
     JWT_SECRET=your-secret-key
     JWT_EXPIRATION=24h

     # Rate Limiting
     RATE_LIMIT_WINDOW_MS=900000
     RATE_LIMIT_MAX_REQUESTS=100

     # Admin Configuration
     ADMIN_EMAIL=admin@library.com
     ADMIN_PASSWORD=admin123
     ADMIN_NAME=Admin User
     ```

4. **Database Setup**
   - Install MongoDB locally or use MongoDB Atlas
   - Run the database seed:
     ```bash
     npm run seed
     ```

5. **Start the Server**
   - Development mode:
     ```bash
     npm run dev
     ```
   - Production mode:
     ```bash
     npm start
     ```

## API Documentation

The API documentation is available at `/api-docs` when the server is running. It provides detailed information about:
- Available endpoints
- Request/Response formats
- Authentication requirements
- Example requests

## Testing

The project includes comprehensive tests for all major features:

1. **Run all tests**
   ```bash
   npm test
   ```

2. **Run tests with coverage**
   ```bash
   npm run test:coverage
   ```

3. **Run tests in watch mode**
   ```bash
   npm run test:watch
   ```

Test suites include:
- API Integration Tests
- User Authentication Tests
- Book Management Tests
- Reservation System Tests
- Fine Calculation Tests
- Payment Processing Tests

## Project Structure

```
src/
├── config/           # Configuration files
│   ├── database.js   # Database configuration
│   ├── seed.js      # Database seeding
│   └── swagger.js   # API documentation config
├── controllers/      # Route controllers
│   ├── auth.controller.js
│   ├── book.controller.js
│   ├── user.controller.js
│   ├── transaction.controller.js
│   ├── reservation.controller.js
│   ├── payment.controller.js
│   └── report.controller.js
├── middleware/       # Custom middleware
│   ├── auth.middleware.js
│   └── validation.middleware.js
├── models/          # Database models
│   ├── book.model.js
│   ├── user.model.js
│   ├── transaction.model.js
│   ├── reservation.model.js
│   └── payment.model.js
├── routes/          # API routes
│   ├── auth.routes.js
│   ├── book.routes.js
│   ├── user.routes.js
│   ├── transaction.routes.js
│   ├── reservation.routes.js
│   ├── payment.routes.js
│   └── report.routes.js
├── tests/           # Test files
│   ├── setup.js
│   ├── api.test.js
│   ├── book.test.js
│   ├── user.test.js
│   ├── fine.test.js
│   ├── reservation.test.js
│   └── payment.test.js
└── server.js        # Entry point
```

## Error Handling

The system includes comprehensive error handling:
- Validation errors
- Authentication errors
- Database errors
- Business logic errors
- Rate limiting errors

## Security Measures

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control
   - Password hashing with bcrypt

2. **API Security**
   - Rate limiting
   - CORS configuration
   - Secure headers with Helmet
   - Input validation
   - SQL injection protection

3. **Data Security**
   - Sensitive data encryption
   - Password hashing
   - Secure environment variables

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC
