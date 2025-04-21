const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    borrowDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        default: function() {
            const date = new Date();
            date.setDate(date.getDate() + 14); // 14 days borrowing period
            return date;
        }
    },
    returnDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'overdue'],
        default: 'active'
    },
    fine: {
        amount: {
            type: Number,
            default: 0
        },
        paid: {
            type: Boolean,
            default: false
        },
        daysOverdue: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Index for efficient queries
transactionSchema.index({ user: 1, book: 1, status: 1 });

// Calculate fine amount
transactionSchema.methods.calculateFine = function() {
    if (!this.returnDate) {
        return 0;
    }

    const dueDate = new Date(this.dueDate);
    const returnDate = new Date(this.returnDate);
    
    if (returnDate <= dueDate) {
        return 0;
    }

    // Calculate days overdue
    const daysOverdue = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24));
    
    // Fine calculation: $1 per day overdue
    const fineAmount = daysOverdue * 1;
    
    // Update fine details
    this.fine.amount = fineAmount;
    this.fine.daysOverdue = daysOverdue;
    
    return fineAmount;
};

// Update status based on due date
transactionSchema.methods.updateStatus = function() {
    const now = new Date();
    const dueDate = new Date(this.dueDate);

    if (this.returnDate) {
        this.status = 'completed';
    } else if (now > dueDate) {
        this.status = 'overdue';
    } else {
        this.status = 'active';
    }
};

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
