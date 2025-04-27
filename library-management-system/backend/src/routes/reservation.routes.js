const express = require('express');
const router = express.Router();
const {
    createReservation,
    cancelReservation,
    approveReservation,
    rejectReservation,
    completeReservation,
    getUserReservations,
    getAllReservations,
    softDeleteReservation,
    restoreReservation,
    bulkImportReservations,
    exportReservations,
    advancedReservationFilter
} = require('../controllers/reservation.controller');
const { auth, adminAuth } = require('../middleware/auth.middleware');

// Protected routes (authenticated users)
router.post('/', auth, createReservation);
router.delete('/:bookId/:reservationId', auth, cancelReservation);
router.patch('/approve/:bookId/:reservationId', adminAuth, approveReservation);
router.patch('/reject/:bookId/:reservationId', adminAuth, rejectReservation);
router.patch('/complete/:bookId/:reservationId', adminAuth, completeReservation);
router.get('/my-reservations', auth, getUserReservations);

// Protected routes (admin only)
router.get('/', adminAuth, getAllReservations);
router.patch('/:id/soft-delete', adminAuth, softDeleteReservation);
router.patch('/:id/restore', adminAuth, restoreReservation);
router.post('/bulk-import', adminAuth, bulkImportReservations);
router.get('/export', adminAuth, exportReservations);
router.get('/advanced-filter', adminAuth, advancedReservationFilter);

module.exports = router;
