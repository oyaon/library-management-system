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
