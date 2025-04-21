const express = require('express');
const router = express.Router();
const {
    getLibraryStats,
    getPopularBooks,
    getOverdueReport,
    getCategoryDistribution,
    getUserActivityReport
} = require('../controllers/report.controller');
const { adminAuth } = require('../middleware/auth.middleware');

// All routes are admin-only
router.get('/library-stats', adminAuth, getLibraryStats);
router.get('/popular-books', adminAuth, getPopularBooks);
router.get('/overdue', adminAuth, getOverdueReport);
router.get('/category-distribution', adminAuth, getCategoryDistribution);
router.get('/user-activity', adminAuth, getUserActivityReport);

module.exports = router;
