const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
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
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
        default: 'pending'
    },
    reservationDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        required: true
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Index for efficient queries
reservationSchema.index({ user: 1, book: 1, status: 1 });
reservationSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Methods
reservationSchema.methods.approve = function() {
    this.status = 'approved';
    return this.save();
};

reservationSchema.methods.reject = function(notes) {
    this.status = 'rejected';
    if (notes) {
        this.notes = notes;
    }
    return this.save();
};

reservationSchema.methods.cancel = function() {
    this.status = 'cancelled';
    return this.save();
};

reservationSchema.methods.complete = function() {
    this.status = 'completed';
    return this.save();
};

// Statics
reservationSchema.statics.findActiveReservations = function(userId) {
    return this.find({
        user: userId,
        status: { $in: ['pending', 'approved'] }
    }).populate('book');
};

reservationSchema.statics.findPendingReservations = function() {
    return this.find({
        status: 'pending'
    }).populate('user book');
};

// Pre-save hook to set expiry date if not set
reservationSchema.pre('save', function(next) {
    if (!this.expiryDate) {
        // Default expiry is 3 days from reservation
        this.expiryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    }
    next();
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
