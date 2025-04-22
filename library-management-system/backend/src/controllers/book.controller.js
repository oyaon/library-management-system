const Book = require('../models/book.model');
const paginate = require('../utils/pagination');

// Create new book
exports.createBook = async (req, res) => {
    try {
        const book = await Book.create(req.body);
        res.status(201).json({ message: 'Book created successfully', book });
    } catch (error) {
        res.status(500).json({ message: 'Error creating book', error: error.message });
    }
};

// Get all books with pagination and filters
exports.getBooks = async (req, res) => {
    try {
        // Build filter based on query params
        const filter = {};
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

// Get single book
exports.getBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching book', error: error.message });
    }
};

// Update book
exports.updateBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json({ message: 'Book updated successfully', book });
    } catch (error) {
        res.status(500).json({ message: 'Error updating book', error: error.message });
    }
};

// Delete book
exports.deleteBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting book', error: error.message });
    }
};

// Search books
exports.searchBooks = async (req, res) => {
    try {
        const searchQuery = req.query.q;
        if (!searchQuery) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const filter = { $text: { $search: searchQuery } };
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
