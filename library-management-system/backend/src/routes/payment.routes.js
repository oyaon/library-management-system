const express = require('express');
const router = express.Router();
const {
    createPayment,
    getUserPayments,
    getAllPayments,
    getPaymentStats
} = require('../controllers/payment.controller');
const { auth, adminAuth } = require('../middleware/auth.middleware');

// Protected routes (authenticated users)
router.post('/', auth, createPayment);
router.get('/my-payments', auth, getUserPayments);

// Protected routes (admin only)
router.get('/', adminAuth, getAllPayments);
router.get('/stats', adminAuth, getPaymentStats);

module.exports = router;
