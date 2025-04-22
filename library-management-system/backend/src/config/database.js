const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Determine MongoDB URI based on environment
        const uri = process.env.NODE_ENV === 'test'
            ? (process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/library-test')
            : (process.env.MONGODB_URI || 'mongodb://localhost:27017/library');
        const conn = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Handle errors after initial connection
        mongoose.connection.on('error', err => {
            console.error(`MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
