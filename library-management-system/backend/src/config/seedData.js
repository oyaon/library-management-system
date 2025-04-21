const bcrypt = require('bcryptjs');

const users = [
    {
        name: 'Admin User',
        email: 'admin@library.com',
        password: 'admin123',
        role: 'admin',
        status: 'active'
    },
    {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'user123',
        role: 'member',
        status: 'active'
    }
];

const books = [
    {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        ISBN: '9780743273565',
        category: 'Fiction',
        quantity: 5,
        availableCopies: 5,
        location: {
            shelf: 'A',
            row: '1'
        },
        status: 'available',
        description: 'A story of decadence and excess.',
        publishedYear: 1925
    },
    {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        ISBN: '9780446310789',
        category: 'Fiction',
        quantity: 3,
        availableCopies: 3,
        location: {
            shelf: 'A',
            row: '2'
        },
        status: 'available',
        description: 'A classic of modern American literature.',
        publishedYear: 1960
    },
    {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        ISBN: '9780132350884',
        category: 'Programming',
        quantity: 2,
        availableCopies: 2,
        location: {
            shelf: 'B',
            row: '1'
        },
        status: 'available',
        description: 'A handbook of agile software craftsmanship.',
        publishedYear: 2008
    }
];

module.exports = { users, books };
