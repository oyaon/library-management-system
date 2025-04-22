const Book = require('../models/book.model');
const Transaction = require('../models/transaction.model');
const User = require('../models/user.model');
const paginate = require('../utils/pagination');

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
        const timeRange = req.query.range || '30';
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange, 10));
        const pipeline = [
            { $match: { createdAt: { $gte: startDate }, type: 'borrow' } },
            { $group: { _id: '$book', borrowCount: { $sum: 1 } } },
            { $sort: { borrowCount: -1 } },
            { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'bookDetails' } },
            { $unwind: '$bookDetails' },
            { $project: { title: '$bookDetails.title', author: '$bookDetails.author', ISBN: '$bookDetails.ISBN', category: '$bookDetails.category', borrowCount: 1 } }
        ];
        const allBooks = await Transaction.aggregate(pipeline);
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const start = (page - 1) * limit;
        const paginated = allBooks.slice(start, start + limit);
        const total = allBooks.length;
        res.json({ popularBooks: paginated, currentPage: page, totalPages: Math.ceil(total / limit), total });
    } catch (error) {
        res.status(500).json({ message: 'Error generating popular books report', error: error.message });
    }
};

// Get overdue books report
exports.getOverdueReport = async (req, res) => {
    try {
        const filter = { status: 'overdue' };
        const options = { populate: [
            { path: 'user', select: 'name email' },
            { path: 'book', select: 'title author ISBN' }
        ], sort: { dueDate: 1 } };
        const { docs: overdueTransactions, pagination } = await paginate(Transaction, filter, req.query, options);
        const report = overdueTransactions.map(trans => ({
            book: { title: trans.book.title, author: trans.book.author, ISBN: trans.book.ISBN },
            user: { name: trans.user.name, email: trans.user.email },
            borrowDate: trans.borrowDate, dueDate: trans.dueDate,
            daysOverdue: Math.ceil((new Date() - new Date(trans.dueDate)) / (1000 * 60 * 60 * 24)),
            fine: trans.calculateFine()
        }));
        res.json({ report, currentPage: pagination.page, totalPages: pagination.totalPages, total: pagination.total });
    } catch (error) {
        res.status(500).json({ message: 'Error generating overdue report', error: error.message });
    }
};

// Get category-wise book distribution
exports.getCategoryDistribution = async (req, res) => {
    try {
        const aggregation = [
            { $group: { _id: '$category', totalBooks: { $sum: '$quantity' }, availableBooks: { $sum: '$availableCopies' }, titles: { $sum: 1 } } },
            { $sort: { totalBooks: -1 } }
        ];
        const allDist = await Book.aggregate(aggregation);
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const start = (page - 1) * limit;
        const paginated = allDist.slice(start, start + limit);
        const total = allDist.length;
        res.json({ distribution: paginated, currentPage: page, totalPages: Math.ceil(total / limit), total });
    } catch (error) {
        res.status(500).json({ message: 'Error generating category distribution', error: error.message });
    }
};

// Get user activity report
exports.getUserActivityReport = async (req, res) => {
    try {
        const timeRange = req.query.range || '30';
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange, 10));
        const aggregation = [
            { $lookup: { from: 'transactions', localField: '_id', foreignField: 'user', as: 'transactions' } },
            { $project: { name: 1, email: 1, role: 1, membershipDate: 1,
                totalBorrows: { $size: { $filter: { input: '$transactions', as: 'trans', cond: { $and: [{ $eq: ['$$trans.type', 'borrow'] }, { $gte: ['$$trans.createdAt', startDate] }] } } } },
                overdueCount: { $size: { $filter: { input: '$transactions', as: 'trans', cond: { $eq: ['$$trans.status', 'overdue'] } } } }
            } },
            { $sort: { totalBorrows: -1 } }
        ];
        const allReport = await User.aggregate(aggregation);
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const start = (page - 1) * limit;
        const paginated = allReport.slice(start, start + limit);
        const total = allReport.length;
        res.json({ userActivity: paginated, currentPage: page, totalPages: Math.ceil(total / limit), total });
    } catch (error) {
        res.status(500).json({ message: 'Error generating user activity report', error: error.message });
    }
};
