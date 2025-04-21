const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    ISBN: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 1
    },
    availableCopies: {
        type: Number,
        min: 0,
        default: function() {
            return this.quantity;
        }
    },
    location: {
        shelf: {
            type: String,
            required: true
        },
        row: {
            type: String,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['available', 'unavailable'],
        default: 'available'
    },
    description: {
        type: String,
        trim: true
    },
    publishedYear: {
        type: Number
    },
    reservations: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['pending', 'fulfilled', 'cancelled'],
            default: 'pending'
        },
        validUntil: {
            type: Date,
            default: function() {
                const date = new Date();
                date.setDate(date.getDate() + 2); // Reservation valid for 2 days
                return date;
            }
        }
    }]
}, {
    timestamps: true
});

// Index for search functionality
bookSchema.index({ 
    title: 'text', 
    author: 'text', 
    ISBN: 'text', 
    category: 'text' 
});

// Method to check if book can be reserved
bookSchema.methods.canBeReserved = function() {
    const activeReservations = this.reservations.filter(r => r.status === 'pending').length;
    return this.availableCopies > 0 && activeReservations < this.quantity;
};

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
