const Payment = require('../models/payment.model');
const Transaction = require('../models/transaction.model');
const paginate = require('../utils/pagination');

// Create a new payment
exports.createPayment = async (req, res) => {
    try {
        const { transactionId, amount, paymentMethod } = req.body;
        const userId = req.user.id;

        // Find the transaction
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Verify the transaction belongs to the user
        if (transaction.user.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to pay for this transaction' });
        }

        // Verify the fine amount
        const calculatedFine = transaction.calculateFine();
        if (amount !== calculatedFine) {
            return res.status(400).json({ 
                message: 'Invalid payment amount',
                expectedAmount: calculatedFine
            });
        }

        // Create payment
        const payment = await Payment.create({
            user: userId,
            transaction: transactionId,
            amount,
            paymentMethod,
            status: 'completed'
        });

        // Update transaction fine status
        transaction.fine.paid = true;
        await transaction.save();

        res.status(201).json({
            message: 'Payment processed successfully',
            payment
        });
    } catch (error) {
        res.status(500).json({ message: 'Error processing payment', error: error.message });
    }
};

// Get user's payment history
exports.getUserPayments = async (req, res) => {
    try {
        const filter = { user: req.user.id };
        const options = { populate: [{ path: 'transaction', select: 'borrowDate returnDate' }] };
        const { docs: payments, pagination } = await paginate(Payment, filter, req.query, options);
        res.json({
            payments,
            currentPage: pagination.page,
            totalPages: pagination.totalPages,
            total: pagination.total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments', error: error.message });
    }
};

// Get all payments (admin only)
exports.getAllPayments = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
        const options = {
            populate: [
                { path: 'user', select: 'name email' },
                { path: 'transaction', select: 'borrowDate returnDate' }
            ]
        };
        const { docs: payments, pagination } = await paginate(Payment, filter, req.query, options);
        res.json({
            payments,
            currentPage: pagination.page,
            totalPages: pagination.totalPages,
            total: pagination.total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments', error: error.message });
    }
};

// Get payment statistics (admin only)
exports.getPaymentStats = async (req, res) => {
    try {
        const stats = await Payment.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: {
                        $gte: new Date(new Date().setDate(new Date().getDate() - 30))
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const paymentMethods = await Payment.aggregate([
            {
                $match: { status: 'completed' }
            },
            {
                $group: {
                    _id: "$paymentMethod",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            dailyStats: stats,
            paymentMethods
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment statistics', error: error.message });
    }
};
