const express = require('express');
const router = express.Router();
const {
    createReservation,
    cancelReservation,
    getUserReservations,
    getAllReservations
} = require('../controllers/reservation.controller');
const { auth, adminAuth } = require('../middleware/auth.middleware');

// Protected routes (authenticated users)
router.post('/', auth, createReservation);
router.delete('/:bookId/:reservationId', auth, cancelReservation);
router.get('/my-reservations', auth, getUserReservations);

// Protected routes (admin only)
router.get('/', adminAuth, getAllReservations);

module.exports = router;
