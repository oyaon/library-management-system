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

## Enterprise-Grade Data Management & Auditability

This backend is designed for organizations requiring robust, scalable, and secure management of library resources. It features:

- **Structured Data Models:** Mongoose models for users, books, categories, and more, ensuring data consistency and validation.
- **Modular Controllers & Routes:** Each entity (category, book, user) has its own controller and route files, supporting maintainability and scalability.
- **Comprehensive CRUD Operations:** Full support for creating, reading, updating, and deleting records for all major entities.
- **Advanced Validation & Security:** Middleware for input validation, authentication, and authorization; secure endpoints using JWT, Helmet, and CORS.
- **Audit Logging:** All critical actions (create, update, delete) on categories, books, and users are tracked in a dedicated audit log for traceability.
- **Audit APIs:** Endpoints for querying and reviewing audit logs, supporting transparency and compliance.
- **Reporting:** Built-in reporting features for administrators to review historical activity and changes.
- **Automated Testing:** Comprehensive Jest test suites ensure backend reliability.
- **Dockerized Workflow:** Easy deployment and scaling using Docker Compose for backend and database orchestration.
- **API Documentation:** Integrated Swagger UI for clear and interactive API documentation.

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

## Advanced API Usage Examples

Below are advanced real-world API usage scenarios, including filtering, sorting, pagination, and business workflows. You can use these as reference or copy-paste them for quick testing.

### 1. Get Books with Combined Filters, Sorting, and Pagination
```bash
curl -X GET "http://localhost:5000/api/books?category=Programming&available=true&sort=title:asc,author:desc&page=1&limit=10" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```
**Response:**
```json
{
  "page": 1,
  "limit": 10,
  "totalPages": 2,
  "totalBooks": 13,
  "books": [
    { "_id": "...", "title": "Agile Principles", ... },
    { "_id": "...", "title": "Clean Code", ... }
  ]
}
```

### 2. Audit Log: Track All Actions for a Book
#### 2.1. Create a Book
```bash
curl -X POST http://localhost:5000/api/books \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Refactoring", "author": "Martin Fowler", "isbn": "9780201485677", "category": "Programming" }'
```
#### 2.2. Update the Book
```bash
curl -X PATCH http://localhost:5000/api/books/<BOOK_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Refactoring: Improving the Design of Existing Code"}'
```
#### 2.3. Fetch Audit Trail for the Book
```bash
curl -X GET "http://localhost:5000/api/auditlog?entity=book&entityId=<BOOK_ID>&sort=timestamp:desc" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```
**Audit Log Response:**
```json
[
  {
    "entity": "book",
    "entityId": "<BOOK_ID>",
    "action": "update",
    "performedBy": "admin@example.com",
    "timestamp": "2025-04-26T03:10:00.000Z",
    "changes": {
      "title": { "old": "Refactoring", "new": "Refactoring: Improving the Design of Existing Code" }
    }
  },
  {
    "entity": "book",
    "entityId": "<BOOK_ID>",
    "action": "create",
    "performedBy": "admin@example.com",
    "timestamp": "2025-04-26T03:05:00.000Z",
    "changes": {
      "title": { "old": null, "new": "Refactoring" }
    }
  }
]
```

### 3. Borrowing Workflow with Audit Log
#### 3.1. Borrow a Book
```bash
curl -X POST http://localhost:5000/api/reservations/borrow \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "bookId": "<BOOK_ID>", "userId": "<USER_ID>" }'
```
#### 3.2. Fetch Audit Logs for Borrow Action
```bash
curl -X GET "http://localhost:5000/api/auditlog?entity=reservation&entityId=<RESERVATION_ID>" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 4. Sorting Users by Registration Date
```bash
curl -X GET "http://localhost:5000/api/users?sort=createdAt:desc&page=1&limit=5" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 5. Combined Filters: Get Overdue Reservations
```bash
curl -X GET "http://localhost:5000/api/reservations?status=overdue&sort=dueDate:asc&page=1&limit=10" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

These examples demonstrate how your API supports advanced business workflows, filtering, sorting, and full traceability. For more, see the Swagger UI at `/api-docs`.
