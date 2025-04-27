const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth.middleware');
const {
  createCategory,
  editCategory,
  deleteCategory,
  getCategories,
  getCategory,
  searchCategories,
  softDeleteCategory,
  restoreCategory,
  bulkImportCategories,
  exportCategories,
  advancedCategoryFilter
} = require('../controllers/category.controller');

// Admin-only category management
router.post('/', adminAuth, createCategory);
router.put('/:id', adminAuth, editCategory);
router.delete('/:id', adminAuth, deleteCategory);
router.patch('/:id/soft-delete', adminAuth, softDeleteCategory);
router.patch('/:id/restore', adminAuth, restoreCategory);
router.post('/bulk-import', adminAuth, bulkImportCategories);
router.get('/export', adminAuth, exportCategories);
router.get('/advanced-filter', adminAuth, advancedCategoryFilter);

// Public or authenticated routes
router.get('/', getCategories);
router.get('/search', searchCategories);
router.get('/:id', getCategory);

module.exports = router;
