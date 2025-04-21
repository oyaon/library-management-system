const Book = require('../models/book.model');

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
        book.reservations.push({
            user: userId,
            status: 'pending'
        });
        await book.save();

        res.status(201).json({
            message: 'Reservation created successfully',
            reservation: book.reservations[book.reservations.length - 1]
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

        res.json({ message: 'Reservation cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling reservation', error: error.message });
    }
};

// Get user's reservations
exports.getUserReservations = async (req, res) => {
    try {
        const books = await Book.find({
            'reservations.user': req.user.id,
            'reservations.status': 'pending'
        }).select('title author reservations');

        const reservations = books.map(book => ({
            book: {
                id: book._id,
                title: book.title,
                author: book.author
            },
            reservation: book.reservations.find(r => 
                r.user.toString() === req.user.id && r.status === 'pending'
            )
        }));

        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reservations', error: error.message });
    }
};

// Get all reservations (admin only)
exports.getAllReservations = async (req, res) => {
    try {
        const books = await Book.find({
            'reservations.0': { $exists: true }
        })
        .select('title author reservations')
        .populate('reservations.user', 'name email');

        const reservations = books.flatMap(book => 
            book.reservations.map(reservation => ({
                book: {
                    id: book._id,
                    title: book.title,
                    author: book.author
                },
                reservation
            }))
        );

        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all reservations', error: error.message });
    }
};
