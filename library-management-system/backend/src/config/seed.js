require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { users, books } = require('./seedData');
const User = require('../models/user.model');
const Book = require('../models/book.model');

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Book.deleteMany({});
        console.log('Cleared existing data');

        // Hash passwords for users
        const hashedUsers = await Promise.all(
            users.map(async (user) => ({
                ...user,
                password: await bcrypt.hash(user.password, 8)
            }))
        );

        // Insert users
        await User.insertMany(hashedUsers);
        console.log('Users seeded successfully');

        // Insert books
        await Book.insertMany(books);
        console.log('Books seeded successfully');

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
