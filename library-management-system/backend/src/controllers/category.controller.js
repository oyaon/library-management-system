const Category = require('../models/category.model');
const Book = require('../models/book.model');
const { logCategoryCreate, logCategoryEdit, logCategoryDelete } = require('./category.auditlog');

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create({ name: req.body.name });
    await logCategoryCreate(req, category);
    res.status(201).json({ message: 'Category created', category });
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

// Edit an existing category with old/new value logging
exports.editCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const oldCategory = await Category.findById(id);
    if (!oldCategory || oldCategory.isDeleted) return res.status(404).json({ message: 'Category not found' });
    const category = await Category.findByIdAndUpdate(id, { name: req.body.name }, { new: true });
    await logCategoryEdit(req, category, {
      old: { name: oldCategory.name },
      updated: { name: category.name }
    });
    res.json({ message: 'Category updated', category });
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

// Soft delete a category and log affected books
exports.softDeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    const books = await Book.find({ category: category.name });
    await logCategoryDelete(req, category, { affectedBooks: books.map(b => ({ id: b._id, title: b.title })) });
    res.json({ message: 'Category soft-deleted', category });
  } catch (error) {
    res.status(500).json({ message: 'Error soft deleting category', error: error.message });
  }
};

// Restore a soft-deleted category
exports.restoreCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, { isDeleted: false, deletedAt: null }, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    await logCategoryEdit(req, category, { restored: true });
    res.json({ message: 'Category restored', category });
  } catch (error) {
    res.status(500).json({ message: 'Error restoring category', error: error.message });
  }
};

// Bulk import categories
exports.bulkImportCategories = async (req, res) => {
  try {
    const categories = await Category.insertMany(req.body.categories);
    res.json({ message: 'Categories imported', categories });
  } catch (error) {
    res.status(500).json({ message: 'Error importing categories', error: error.message });
  }
};

// Export all non-deleted categories
exports.exportCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: false });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Error exporting categories', error: error.message });
  }
};

// Advanced filter for categories
exports.advancedCategoryFilter = async (req, res) => {
  try {
    const { name, from, to, isDeleted } = req.query;
    let filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (isDeleted !== undefined) filter.isDeleted = isDeleted === 'true';
    if (from || to) filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
    const categories = await Category.find(filter);
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Error filtering categories', error: error.message });
  }
};

// Get all non-deleted categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: false });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Get a single category (non-deleted)
exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({ _id: id, isDeleted: false });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ category });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
};

// Search categories by name (partial match, non-deleted)
exports.searchCategories = async (req, res) => {
  try {
    const { q } = req.query;
    const categories = await Category.find({ name: { $regex: q, $options: 'i' }, isDeleted: false });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Error searching categories', error: error.message });
  }
};

// Delete a category and log affected books
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    const books = await Book.find({ category: category.name });
    await logCategoryDelete(req, category, { affectedBooks: books.map(b => ({ id: b._id, title: b.title })) });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};
