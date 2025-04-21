const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Auth validation rules
const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Must be a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    validate
];

const loginValidation = [
    body('email').isEmail().withMessage('Must be a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
];

// Book validation rules
const bookValidation = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('author').trim().notEmpty().withMessage('Author is required'),
    body('ISBN').trim().notEmpty().withMessage('ISBN is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative number'),
    body('location.shelf').trim().notEmpty().withMessage('Shelf location is required'),
    body('location.row').trim().notEmpty().withMessage('Row location is required'),
    validate
];

// Transaction validation rules
const borrowValidation = [
    body('bookId').notEmpty().withMessage('Book ID is required'),
    validate
];

const returnValidation = [
    body('transactionId').notEmpty().withMessage('Transaction ID is required'),
    validate
];

// Payment validation rules
const paymentValidation = [
    body('transactionId').notEmpty().withMessage('Transaction ID is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('paymentMethod')
        .isIn(['cash', 'card', 'mobile_banking'])
        .withMessage('Invalid payment method'),
    validate
];

// Reservation validation rules
const reservationValidation = [
    body('bookId').notEmpty().withMessage('Book ID is required'),
    validate
];

// User validation rules
const updateUserValidation = [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Must be a valid email'),
    body('role').optional().isIn(['admin', 'member']).withMessage('Invalid role'),
    body('status').optional().isIn(['active', 'suspended']).withMessage('Invalid status'),
    validate
];

const changePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long'),
    validate
];

module.exports = {
    registerValidation,
    loginValidation,
    bookValidation,
    borrowValidation,
    returnValidation,
    paymentValidation,
    reservationValidation,
    updateUserValidation,
    changePasswordValidation
};
