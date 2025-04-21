const Transaction = require('../models/transaction.model');
const Book = require('../models/book.model');

// Borrow a book
exports.borrowBook = async (req, res) => {
    try {
        const { bookId } = req.body;
        const userId = req.user.id;

        // Check if book exists and is available
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.availableCopies < 1) {
            return res.status(400).json({ message: 'Book is not available' });
        }

        // Check if user already has an active borrow for this book
        const existingTransaction = await Transaction.findOne({
            user: userId,
            book: bookId,
            status: 'active'
        });

        if (existingTransaction) {
            return res.status(400).json({ message: 'You already have this book borrowed' });
        }

        // Create transaction
        const transaction = new Transaction({
            user: userId,
            book: bookId
        });

        // Update book availability
        book.availableCopies -= 1;
        if (book.availableCopies === 0) {
            book.status = 'unavailable';
        }

        // Save both documents
        await Promise.all([
            transaction.save(),
            book.save()
        ]);

        res.status(201).json({
            message: 'Book borrowed successfully',
            transaction
        });
    } catch (error) {
        res.status(500).json({ message: 'Error borrowing book', error: error.message });
    }
};

// Return a book
exports.returnBook = async (req, res) => {
    try {
        const { transactionId } = req.body;

        // Find transaction
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Check if book is already returned
        if (transaction.returnDate) {
            return res.status(400).json({ message: 'Book is already returned' });
        }

        // Set return date and calculate fine
        transaction.returnDate = new Date();
        const fineAmount = transaction.calculateFine();
        transaction.updateStatus();

        // Update book availability
        const book = await Book.findById(transaction.book);
        book.availableCopies += 1;
        if (book.availableCopies > 0) {
            book.status = 'available';
        }

        // Save both documents
        await Promise.all([
            transaction.save(),
            book.save()
        ]);

        res.json({
            message: 'Book returned successfully',
            transaction,
            fine: fineAmount
        });
    } catch (error) {
        res.status(500).json({ message: 'Error returning book', error: error.message });
    }
};

// Get user's transactions
exports.getUserTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id })
            .populate('book', 'title author ISBN')
            .sort({ createdAt: -1 });

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
};

// Get all transactions (admin only)
exports.getAllTransactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.status) query.status = req.query.status;
        if (req.query.userId) query.user = req.query.userId;

        const transactions = await Transaction.find(query)
            .populate('user', 'name email')
            .populate('book', 'title author ISBN')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Transaction.countDocuments(query);

        res.json({
            transactions,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
};
