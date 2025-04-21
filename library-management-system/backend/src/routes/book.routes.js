const express = require('express');
const router = express.Router();
const { 
    createBook, 
    getBooks, 
    getBook, 
    updateBook, 
    deleteBook,
    searchBooks 
} = require('../controllers/book.controller');
const { auth, adminAuth } = require('../middleware/auth.middleware');
const { bookValidation } = require('../middleware/validation.middleware');

// Public routes
router.get('/', getBooks);
router.get('/search', searchBooks);
router.get('/:id', getBook);

// Protected routes (admin only)
router.post('/', adminAuth, bookValidation, createBook);
router.put('/:id', adminAuth, bookValidation, updateBook);
router.delete('/:id', adminAuth, deleteBook);

module.exports = router;
