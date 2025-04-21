const Book = require('../models/book.model');
const Transaction = require('../models/transaction.model');
const User = require('../models/user.model');

// Get library overview statistics
exports.getLibraryStats = async (req, res) => {
    try {
        const stats = {
            books: {
                total: await Book.countDocuments(),
                available: await Book.countDocuments({ status: 'available' }),
                borrowed: await Book.countDocuments({ availableCopies: 0 })
            },
            users: {
                total: await User.countDocuments(),
                active: await User.countDocuments({ status: 'active' }),
                suspended: await User.countDocuments({ status: 'suspended' })
            },
            transactions: {
                active: await Transaction.countDocuments({ status: 'active' }),
                overdue: await Transaction.countDocuments({ status: 'overdue' }),
                completed: await Transaction.countDocuments({ status: 'completed' })
            }
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error generating library statistics', error: error.message });
    }
};

// Get popular books report
exports.getPopularBooks = async (req, res) => {
    try {
        const timeRange = req.query.range || '30'; // days
        const limit = parseInt(req.query.limit) || 10;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange));

        const popularBooks = await Transaction.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    type: 'borrow'
                }
            },
            {
                $group: {
                    _id: '$book',
                    borrowCount: { $sum: 1 }
                }
            },
            {
                $sort: { borrowCount: -1 }
            },
            {
                $limit: limit
            },
            {
                $lookup: {
                    from: 'books',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'bookDetails'
                }
            },
            {
                $unwind: '$bookDetails'
            },
            {
                $project: {
                    title: '$bookDetails.title',
                    author: '$bookDetails.author',
                    ISBN: '$bookDetails.ISBN',
                    category: '$bookDetails.category',
                    borrowCount: 1
                }
            }
        ]);

        res.json(popularBooks);
    } catch (error) {
        res.status(500).json({ message: 'Error generating popular books report', error: error.message });
    }
};

// Get overdue books report
exports.getOverdueReport = async (req, res) => {
    try {
        const overdueTransactions = await Transaction.find({
            status: 'overdue'
        })
        .populate('user', 'name email')
        .populate('book', 'title author ISBN')
        .sort({ dueDate: 1 });

        const report = overdueTransactions.map(trans => ({
            book: {
                title: trans.book.title,
                author: trans.book.author,
                ISBN: trans.book.ISBN
            },
            user: {
                name: trans.user.name,
                email: trans.user.email
            },
            borrowDate: trans.borrowDate,
            dueDate: trans.dueDate,
            daysOverdue: Math.ceil((new Date() - new Date(trans.dueDate)) / (1000 * 60 * 60 * 24)),
            fine: trans.calculateFine()
        }));

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error generating overdue report', error: error.message });
    }
};

// Get category-wise book distribution
exports.getCategoryDistribution = async (req, res) => {
    try {
        const distribution = await Book.aggregate([
            {
                $group: {
                    _id: '$category',
                    totalBooks: { $sum: '$quantity' },
                    availableBooks: { $sum: '$availableCopies' },
                    titles: { $sum: 1 }
                }
            },
            {
                $sort: { totalBooks: -1 }
            }
        ]);

        res.json(distribution);
    } catch (error) {
        res.status(500).json({ message: 'Error generating category distribution', error: error.message });
    }
};

// Get user activity report
exports.getUserActivityReport = async (req, res) => {
    try {
        const timeRange = req.query.range || '30'; // days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange));

        const userActivity = await User.aggregate([
            {
                $lookup: {
                    from: 'transactions',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'transactions'
                }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    role: 1,
                    membershipDate: 1,
                    totalBorrows: {
                        $size: {
                            $filter: {
                                input: '$transactions',
                                as: 'trans',
                                cond: { 
                                    $and: [
                                        { $eq: ['$$trans.type', 'borrow'] },
                                        { $gte: ['$$trans.createdAt', startDate] }
                                    ]
                                }
                            }
                        }
                    },
                    overdueCount: {
                        $size: {
                            $filter: {
                                input: '$transactions',
                                as: 'trans',
                                cond: { $eq: ['$$trans.status', 'overdue'] }
                            }
                        }
                    }
                }
            },
            {
                $sort: { totalBorrows: -1 }
            }
        ]);

        res.json(userActivity);
    } catch (error) {
        res.status(500).json({ message: 'Error generating user activity report', error: error.message });
    }
};
