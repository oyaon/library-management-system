const AuditLog = require('../models/auditlog.model');

exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const logs = await AuditLog.find()
      .populate('performedBy', 'name email')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await AuditLog.countDocuments();
    res.json({ logs, total });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
};

exports.createAuditLog = async (action, performedBy, targetType, targetId, details = {}) => {
  try {
    await AuditLog.create({ action, performedBy, targetType, targetId, details });
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
};
