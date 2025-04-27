const Book = require('../models/book.model');
const paginate = require('../utils/pagination');
const { logBookCreate, logBookEdit, logBookDelete } = require('./auditlog.controller');

// Create a new book
exports.createBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    await logBookCreate(req, book);
    res.status(201).json({ message: 'Book created', book });
  } catch (error) {
    res.status(500).json({ message: 'Error creating book', error: error.message });
  }
};

// Edit a book (with old/new value logging)
exports.editBook = async (req, res) => {
  try {
    const { id } = req.params;
    const oldBook = await Book.findById(id);
    if (!oldBook || oldBook.isDeleted) return res.status(404).json({ message: 'Book not found' });
    const book = await Book.findByIdAndUpdate(id, req.body, { new: true });
    await logBookEdit(req, book, { old: oldBook, updated: book });
    res.json({ message: 'Book updated', book });
  } catch (error) {
    res.status(500).json({ message: 'Error updating book', error: error.message });
  }
};

// Soft delete a book
exports.softDeleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    await logBookDelete(req, book, { softDeleted: true });
    res.json({ message: 'Book soft-deleted', book });
  } catch (error) {
    res.status(500).json({ message: 'Error soft deleting book', error: error.message });
  }
};

// Restore a book
exports.restoreBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByIdAndUpdate(id, { isDeleted: false, deletedAt: null }, { new: true });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    await logBookEdit(req, book, { restored: true });
    res.json({ message: 'Book restored', book });
  } catch (error) {
    res.status(500).json({ message: 'Error restoring book', error: error.message });
  }
};

// Bulk import books
exports.bulkImportBooks = async (req, res) => {
  try {
    const books = await Book.insertMany(req.body.books);
    res.json({ message: 'Books imported', books });
  } catch (error) {
    res.status(500).json({ message: 'Error importing books', error: error.message });
  }
};

// Export all non-deleted books
exports.exportBooks = async (req, res) => {
  try {
    const books = await Book.find({ isDeleted: false });
    res.json({ books });
  } catch (error) {
    res.status(500).json({ message: 'Error exporting books', error: error.message });
  }
};

// Advanced filter for books
exports.advancedBookFilter = async (req, res) => {
  try {
    const { title, author, from, to, isDeleted } = req.query;
    let filter = {};
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (author) filter.author = { $regex: author, $options: 'i' };
    if (isDeleted !== undefined) filter.isDeleted = isDeleted === 'true';
    if (from || to) filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
    const books = await Book.find(filter);
    res.json({ books });
  } catch (error) {
    res.status(500).json({ message: 'Error filtering books', error: error.message });
  }
};

// Get all non-deleted books with pagination and filters
exports.getBooks = async (req, res) => {
  try {
    // Build filter based on query params
    const filter = { isDeleted: false };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) filter.$text = { $search: req.query.search };

    const { docs: books, pagination } = await paginate(Book, filter, req.query);
    res.json({
      books,
      currentPage: pagination.page,
      totalPages: pagination.totalPages,
      total: pagination.total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books', error: error.message });
  }
};

// Get a single book (non-deleted)
exports.getBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findOne({ _id: id, isDeleted: false });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ book });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching book', error: error.message });
  }
};

// Search books
exports.searchBooks = async (req, res) => {
  try {
    const searchQuery = req.query.q;
    if (!searchQuery) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const filter = { isDeleted: false, $text: { $search: searchQuery } };
    const options = {
      sort: { score: { $meta: 'textScore' } },
      select: { score: { $meta: 'textScore' } }
    };
    const { docs: books, pagination } = await paginate(Book, filter, req.query, options);
    res.json({
      books,
      currentPage: pagination.page,
      totalPages: pagination.totalPages,
      total: pagination.total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error searching books', error: error.message });
  }
};
