const Book = require('../models/book.model');
const paginate = require('../utils/pagination');
const { createAuditLog } = require('./auditlog.controller');
const Reservation = require('../models/reservation.model');

// Create a reservation
exports.createReservation = async (req, res) => {
    try {
        const { bookId } = req.body;
        const userId = req.user.id;

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Check if user already has a pending reservation for this book
        const existingReservation = book.reservations.find(
            r => r.user.toString() === userId && r.status === 'pending'
        );
        if (existingReservation) {
            return res.status(400).json({ message: 'You already have a pending reservation for this book' });
        }

        // Check if book can be reserved
        if (!book.canBeReserved()) {
            return res.status(400).json({ message: 'Book cannot be reserved at this time' });
        }

        // Add reservation
        const reservation = await book.reservations.create({
            user: userId,
            status: 'pending'
        });
        await book.save();
        createAuditLog('Create Reservation', req.user._id, 'Reservation', reservation._id, { book: bookId });

        res.status(201).json({
            message: 'Reservation created successfully',
            reservation
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating reservation', error: error.message });
    }
};

// Cancel a reservation
exports.cancelReservation = async (req, res) => {
    try {
        const { bookId, reservationId } = req.params;
        const userId = req.user.id;

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const reservation = book.reservations.id(reservationId);
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Check if the reservation belongs to the user or if user is admin
        if (reservation.user.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
        }

        reservation.status = 'cancelled';
        await book.save();
        await reservation.save();
        createAuditLog('Cancel Reservation', req.user._id, 'Reservation', reservation._id, { book: bookId });

        res.json({ message: 'Reservation cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling reservation', error: error.message });
    }
};

// Approve reservation
exports.approveReservation = async (req, res) => {
    try {
        const { bookId, reservationId } = req.params;
        const book = await Book.findById(bookId);
        const reservation = book.reservations.id(reservationId);
        reservation.status = 'approved';
        await book.save();
        createAuditLog('Approve Reservation', req.user._id, 'Reservation', reservation._id, { book: bookId });
        res.json({ message: 'Reservation approved' });
    } catch (error) {
        res.status(500).json({ message: 'Error approving reservation', error: error.message });
    }
};

// Reject reservation
exports.rejectReservation = async (req, res) => {
    try {
        const { bookId, reservationId } = req.params;
        const book = await Book.findById(bookId);
        const reservation = book.reservations.id(reservationId);
        reservation.status = 'rejected';
        await book.save();
        createAuditLog('Reject Reservation', req.user._id, 'Reservation', reservation._id, { book: bookId });
        res.json({ message: 'Reservation rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting reservation', error: error.message });
    }
};

// Complete reservation
exports.completeReservation = async (req, res) => {
    try {
        const { bookId, reservationId } = req.params;
        const book = await Book.findById(bookId);
        const reservation = book.reservations.id(reservationId);
        reservation.status = 'completed';
        await book.save();
        createAuditLog('Complete Reservation', req.user._id, 'Reservation', reservation._id, { book: bookId });
        res.json({ message: 'Reservation completed' });
    } catch (error) {
        res.status(500).json({ message: 'Error completing reservation', error: error.message });
    }
};

// Get user's reservations
exports.getUserReservations = async (req, res) => {
    try {
        const filter = { 'reservations.user': req.user.id, 'reservations.status': 'pending' };
        const options = { select: 'title author reservations' };
        const { docs: books, pagination } = await paginate(Book, filter, req.query, options);
        const reservations = books.map(book => ({
            book: { id: book._id, title: book.title, author: book.author },
            reservation: book.reservations.find(r => 
                r.user.toString() === req.user.id && r.status === 'pending'
            )
        }));
        res.json({
            reservations,
            currentPage: pagination.page,
            totalPages: pagination.totalPages,
            total: pagination.total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reservations', error: error.message });
    }
};

// Get all reservations (admin only)
exports.getAllReservations = async (req, res) => {
    try {
        const filter = { 'reservations.0': { $exists: true } };
        const options = { 
            select: 'title author reservations',
            populate: { path: 'reservations.user', select: 'name email' }
        };
        const { docs: books, pagination } = await paginate(Book, filter, req.query, options);
        const reservations = books.flatMap(book => 
            book.reservations.map(reservation => ({
                book: { id: book._id, title: book.title, author: book.author },
                reservation
            }))
        );
        res.json({
            reservations,
            currentPage: pagination.page,
            totalPages: pagination.totalPages,
            total: pagination.total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all reservations', error: error.message });
    }
};

// Soft delete a reservation
exports.softDeleteReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const reservation = await Reservation.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        createAuditLog('Soft Delete Reservation', req.user._id, 'Reservation', reservation._id, { softDeleted: true });
        res.json({ message: 'Reservation soft-deleted', reservation });
    } catch (error) {
        res.status(500).json({ message: 'Error soft deleting reservation', error: error.message });
    }
};

// Restore a reservation
exports.restoreReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const reservation = await Reservation.findByIdAndUpdate(id, { isDeleted: false, deletedAt: null }, { new: true });
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        createAuditLog('Restore Reservation', req.user._id, 'Reservation', reservation._id, { restored: true });
        res.json({ message: 'Reservation restored', reservation });
    } catch (error) {
        res.status(500).json({ message: 'Error restoring reservation', error: error.message });
    }
};

// Bulk import reservations
exports.bulkImportReservations = async (req, res) => {
    try {
        const reservations = await Reservation.insertMany(req.body.reservations);
        createAuditLog('Bulk Import Reservations', req.user._id, 'Reservation', null, { count: reservations.length });
        res.json({ message: 'Reservations imported', reservations });
    } catch (error) {
        res.status(500).json({ message: 'Error importing reservations', error: error.message });
    }
};

// Export all non-deleted reservations
exports.exportReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ isDeleted: false })
            .populate('user', 'name email')
            .populate('book', 'title author');
        res.json({ reservations });
    } catch (error) {
        res.status(500).json({ message: 'Error exporting reservations', error: error.message });
    }
};

// Advanced filter for reservations
exports.advancedReservationFilter = async (req, res) => {
    try {
        const { userId, bookId, status, from, to, isDeleted } = req.query;
        let filter = {};
        if (userId) filter.user = userId;
        if (bookId) filter.book = bookId;
        if (status) filter.status = status;
        if (isDeleted !== undefined) filter.isDeleted = isDeleted === 'true';
        if (from || to) filter.reservationDate = {};
        if (from) filter.reservationDate.$gte = new Date(from);
        if (to) filter.reservationDate.$lte = new Date(to);
        const reservations = await Reservation.find(filter)
            .populate('user', 'name email')
            .populate('book', 'title author');
        res.json({ reservations });
    } catch (error) {
        res.status(500).json({ message: 'Error filtering reservations', error: error.message });
    }
};
