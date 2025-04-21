const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    changePassword
} = require('../controllers/user.controller');
const { auth, adminAuth } = require('../middleware/auth.middleware');
const { 
    updateUserValidation, 
    changePasswordValidation 
} = require('../middleware/validation.middleware');

// Protected routes (admin only)
router.get('/', adminAuth, getUsers);
router.get('/:id', adminAuth, getUser);
router.delete('/:id', adminAuth, deleteUser);

// Protected routes (admin or self)
router.put('/:id', auth, updateUserValidation, updateUser);
router.post('/change-password', auth, changePasswordValidation, changePassword);

module.exports = router;
