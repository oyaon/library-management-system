const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditlog.controller');
const { adminAuth } = require('../middleware/auth.middleware');

// GET /api/audit-logs
router.get('/', adminAuth, getAuditLogs);

module.exports = router;
