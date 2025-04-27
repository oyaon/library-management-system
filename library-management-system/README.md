# Library Management System

A full-stack Library Management System with Node.js backend and modern frontend (to be implemented).

## Enterprise-Grade Data Management & Auditability

### Key Highlights

- **Structured Data Models:** Robust Mongoose models for all core entities (users, books, categories, etc.), ensuring data integrity and validation.
- **Modular Architecture:** Separate controllers and routes for each domain, supporting scalability and maintainability.
- **Comprehensive CRUD Operations:** Full support for creating, reading, updating, and deleting records for users, books, and categories.
- **Advanced Validation & Security:** Middleware for input validation, authentication, and authorization; secure API endpoints with JWT, Helmet, and CORS.
- **Audit Logging:** Every critical action (create, update, delete) on categories, books, and users is tracked in a dedicated audit log for full traceability.
- **Audit APIs:** Endpoints for querying and reviewing audit logs, supporting transparency and compliance.
- **Reporting:** Built-in reporting features for administrators to review historical activity and changes.
- **Automated Testing:** Extensive backend (Jest) and frontend (Vitest) test suites to ensure reliability.
- **Dockerized Workflow:** Easy deployment and scaling using Docker Compose for backend and database orchestration.
- **API Documentation:** Integrated Swagger UI for clear and interactive API documentation.
- **Modern Frontend:** React + TypeScript frontend for a seamless user experience.

## Project Structure

```
library-management-system/
├── backend/           # Backend Node.js application
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Route controllers
│   │   ├── middleware/  # Custom middleware
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── utils/       # Utility functions
│   │   └── server.js    # Entry point
│   ├── package.json
│   └── .env
└── frontend/          # Frontend application (to be implemented)
```

## Backend Features

- Book Management (CRUD operations)
- User Management (Admin/Member roles)
- Borrowing System
- Authentication & Authorization
- Rate Limiting
- Secure API endpoints

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Express Validator for validation
- Helmet for security
- CORS enabled

### Frontend
- To be implemented

## Setup

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` and update it:
   ```bash
   cp .env.example .env   # or 'copy .env.example .env' on Windows
   ```
4. (Optional) Seed the database:
   ```bash
   npm run seed
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (If required) Copy or create frontend `.env` from `.env.example`:
   ```bash
   cp .env.example .env   # adjust vars as needed
   ```
4. Start the frontend in development mode:
   ```bash
   npm run dev   # or npm start
   ```

## API Documentation

(To be added)

## License

ISC
