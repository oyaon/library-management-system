import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Set test environment variables if not already set
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/library-test';

let connection;

beforeAll(async () => {
    try {
        console.log('Connecting to MongoDB at:', process.env.MONGODB_URI);
        
        // Configure Mongoose
        mongoose.set('strictQuery', false);
        
        // Connect with retry logic
        for (let i = 0; i < 3; i++) {
            try {
                connection = await mongoose.connect(process.env.MONGODB_URI, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
                });
                console.log('Connected to MongoDB successfully');
                break;
            } catch (error) {
                if (i === 2) throw error;
                console.log('Retrying MongoDB connection...');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Clear all collections before starting tests
        const collections = await mongoose.connection.db.collections();
        for (let collection of collections) {
            await collection.deleteMany({});
        }
        console.log('All collections cleared before tests');
    } catch (error) {
        console.error('Setup error:', error);
        throw error;
    }
});

beforeEach(async () => {
    try {
        if (!mongoose.connection.readyState) {
            throw new Error('MongoDB not connected');
        }
        
        // Clear all collections before each test
        console.log('Clearing test database...');
        const collections = await mongoose.connection.db.collections();
        const clearPromises = collections.map(collection => collection.deleteMany({}));
        await Promise.all(clearPromises);
        console.log('Test database cleared successfully');
    } catch (error) {
        console.error('Error clearing test database:', error);
        throw error;
    }
});

afterEach(async () => {
    // Ensure all models are properly cleaned up
    for (const model of Object.values(mongoose.models)) {
        await model.deleteMany({});
    }
});

afterAll(async () => {
    try {
        // Clear all collections after tests
        if (mongoose.connection.readyState) {
            const collections = await mongoose.connection.db.collections();
            const clearPromises = collections.map(collection => collection.deleteMany({}));
            await Promise.all(clearPromises);
            console.log('All collections cleared after tests');
        }

        // Close MongoDB connection
        console.log('Closing MongoDB connection...');
        await mongoose.disconnect();
        // Add a small delay to ensure all connections are properly closed
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('MongoDB connection closed successfully');
    } catch (error) {
        console.error('Cleanup error:', error);
        throw error;
    }
});
