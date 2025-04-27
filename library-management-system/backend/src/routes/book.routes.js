const express = require('express');
const router = express.Router();
const { 
    createBook, 
    getBooks, 
    getBook, 
    editBook, 
    deleteBook,
    searchBooks,
    softDeleteBook,
    restoreBook,
    bulkImportBooks,
    exportBooks,
    advancedBookFilter
} = require('../controllers/book.controller');
const { auth, adminAuth } = require('../middleware/auth.middleware');
const { bookValidation } = require('../middleware/validation.middleware');

// Public routes
router.get('/', getBooks);
router.get('/search', searchBooks);
router.get('/:id', getBook);

// Protected routes (admin only)
router.post('/', adminAuth, bookValidation, createBook);
router.put('/:id', adminAuth, bookValidation, editBook);
router.delete('/:id', adminAuth, deleteBook);
router.patch('/:id/soft-delete', adminAuth, softDeleteBook);
router.patch('/:id/restore', adminAuth, restoreBook);
router.post('/bulk-import', adminAuth, bulkImportBooks);
router.get('/export', adminAuth, exportBooks);
router.get('/advanced-filter', adminAuth, advancedBookFilter);

module.exports = router;
