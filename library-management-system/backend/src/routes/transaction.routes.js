const express = require('express');
const router = express.Router();
const {
    borrowBook,
    returnBook,
    getUserTransactions,
    getAllTransactions
} = require('../controllers/transaction.controller');
const { auth, adminAuth } = require('../middleware/auth.middleware');
const { borrowValidation, returnValidation } = require('../middleware/validation.middleware');

// Protected routes (authenticated users)
router.post('/borrow', auth, borrowValidation, borrowBook);
router.post('/return', auth, returnValidation, returnBook);
router.get('/my-transactions', auth, getUserTransactions);

// Protected routes (admin only)
router.get('/', adminAuth, getAllTransactions);

module.exports = router;
