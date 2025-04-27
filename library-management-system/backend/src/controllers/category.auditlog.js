// Category audit logging hooks for manual integration
const { createAuditLog } = require('./auditlog.controller');

exports.logCategoryCreate = async (req, category) => {
  await createAuditLog('Create Category', req.user._id, 'Category', category._id, { name: category.name });
};

exports.logCategoryEdit = async (req, category, changes) => {
  await createAuditLog('Edit Category', req.user._id, 'Category', category._id, { changes });
};

exports.logCategoryDelete = async (req, category) => {
  await createAuditLog('Delete Category', req.user._id, 'Category', category._id, { name: category.name });
};
