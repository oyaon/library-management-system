# Library Management System

A full-stack Library Management System with Node.js backend and modern frontend (to be implemented).

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

### Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the backend directory with:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/library_management
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

(To be added)

## License

ISC
