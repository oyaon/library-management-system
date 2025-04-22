const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const bookRoutes = require('./routes/book.routes');
const userRoutes = require('./routes/user.routes');
const transactionRoutes = require('./routes/transaction.routes');
const reservationRoutes = require('./routes/reservation.routes');
const paymentRoutes = require('./routes/payment.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure mongoose
mongoose.set('strictQuery', false);

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter); // Only apply to API routes

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Library Management System API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Handle mongoose validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation Error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }
    
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'Invalid token'
        });
    }
    
    // Handle other errors
    res.status(err.status || 500).json({ 
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

let server;

const startServer = async (port = process.env.PORT || 3000) => {
    try {
        console.log('Environment:', process.env.NODE_ENV);

        // Connect to MongoDB
        await connectDB();

        // Start the server
        server = app.listen(port, () => {
            const actualPort = server.address().port;
            console.log(`Server is running on port ${actualPort}`);
        });

        // Handle server shutdown gracefully
        process.on('SIGTERM', () => {
            console.log('SIGTERM signal received. Shutting down gracefully...');
            stopServer();
        });

        process.on('SIGINT', () => {
            console.log('SIGINT signal received. Shutting down gracefully...');
            stopServer();
        });

        return server;
    } catch (error) {
        console.error('Server startup error:', error);
        throw error;
    }
};

const stopServer = async () => {
    try {
        if (server) {
            // Close database connection
            if (mongoose.connection.readyState) {
                await mongoose.disconnect();
                console.log('MongoDB disconnected');
            }

            // Close server
            await new Promise((resolve, reject) => {
                server.close(err => {
                    if (err) {
                        console.error('Error closing server:', err);
                        reject(err);
                    } else {
                        console.log('Server closed');
                        resolve();
                    }
                });
            });
        }
    } catch (error) {
        console.error('Error stopping server:', error);
        throw error;
    }
};

// Only start the server if this file is run directly
if (require.main === module) {
    startServer().catch(error => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });
}

module.exports = { app, startServer, stopServer };
