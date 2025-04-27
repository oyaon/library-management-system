const User = require('../models/user.model');
const paginate = require('../utils/pagination');
const { createAuditLog, logUserCreate, logUserEdit, logUserDelete } = require('./auditlog.controller');

// Get all users (admin only)
exports.getUsers = async (req, res) => {
    try {
        const filter = { isDeleted: false };
        if (req.query.role) filter.role = req.query.role;
        if (req.query.status) filter.status = req.query.status;
        const options = { select: '-password' };
        const { docs: users, pagination } = await paginate(User, filter, req.query, options);
        res.json({
            users,
            currentPage: pagination.page,
            totalPages: pagination.totalPages,
            total: pagination.total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// Get single user (admin only)
exports.getUser = async (req, res) => {
    try {
        const filter = { _id: req.params.id, isDeleted: false };
        const user = await User.findOne(filter).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};

// Update user (admin or self)
exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Only allow admin to update role and status
        if (req.user.role !== 'admin') {
            delete req.body.role;
            delete req.body.status;
            
            // Users can only update their own profile
            if (req.user.id !== userId) {
                return res.status(403).json({ message: 'Not authorized to update this user' });
            }
        }

        // Never update password through this route
        delete req.body.password;

        const user = await User.findByIdAndUpdate(
            userId,
            req.body,
            { new: true, runValidators: true }
        ).select('-password');

        if (user) {
            if (req.body.role === 'admin') {
                createAuditLog('Promote to Admin', req.user._id, 'User', userId, { newRole: 'admin' });
            }
            if (req.body.status === 'suspended' || req.body.status === 'active') {
                createAuditLog('Change User Status', req.user._id, 'User', userId, { newStatus: req.body.status });
            }
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await logUserEdit(req, user, { old: await User.findById(userId), updated: user });
        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

// Soft delete a user
exports.softDeleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        await logUserDelete(req, user, { softDeleted: true });
        res.json({ message: 'User soft-deleted', user });
    } catch (error) {
        res.status(500).json({ message: 'Error soft deleting user', error: error.message });
    }
};

// Restore a user
exports.restoreUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(id, { isDeleted: false, deletedAt: null }, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        await logUserEdit(req, user, { restored: true });
        res.json({ message: 'User restored', user });
    } catch (error) {
        res.status(500).json({ message: 'Error restoring user', error: error.message });
    }
};

// Bulk import users
exports.bulkImportUsers = async (req, res) => {
    try {
        const users = await User.insertMany(req.body.users);
        res.json({ message: 'Users imported', users });
    } catch (error) {
        res.status(500).json({ message: 'Error importing users', error: error.message });
    }
};

// Export all non-deleted users
exports.exportUsers = async (req, res) => {
    try {
        const users = await User.find({ isDeleted: false });
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Error exporting users', error: error.message });
    }
};

// Advanced filter for users
exports.advancedUserFilter = async (req, res) => {
    try {
        const { name, email, from, to, isDeleted } = req.query;
        let filter = { isDeleted: false };
        if (name) filter.name = { $regex: name, $options: 'i' };
        if (email) filter.email = { $regex: email, $options: 'i' };
        if (isDeleted !== undefined) filter.isDeleted = isDeleted === 'true';
        if (from || to) filter.createdAt = {};
        if (from) filter.createdAt.$gte = new Date(from);
        if (to) filter.createdAt.$lte = new Date(to);
        const users = await User.find(filter);
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Error filtering users', error: error.message });
    }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (user) {
            createAuditLog('Delete User', req.user._id, 'User', req.params.id, { email: user.email });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error changing password', error: error.message });
    }
};
