const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            console.log('No Authorization header');
            throw new Error('No Authorization header');
        }

        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            console.log('No token in Authorization header');
            throw new Error('No token provided');
        }

        console.log('Verifying token with secret:', process.env.JWT_SECRET);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        const user = await User.findOne({ 
            _id: decoded.id, 
            status: 'active' 
        });
        console.log('Found user:', user ? user._id : 'No user found');

        if (!user) {
            console.log('No active user found with id:', decoded.id);
            throw new Error('User not found or inactive');
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        res.status(401).json({ 
            message: 'Please authenticate.',
            error: error.message 
        });
    }
};

const adminAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {
            console.log('User role:', req.user.role);
            if (req.user.role !== 'admin') {
                console.log('User is not admin');
                throw new Error('Not an admin');
            }
            next();
        });
    } catch (error) {
        console.error('Admin auth error:', error.message);
        res.status(403).json({ 
            message: 'Access denied. Admin privileges required.',
            error: error.message 
        });
    }
};

module.exports = {
    auth,
    adminAuth
};
