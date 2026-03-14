const Book = require('../models/Book');

/**
 * @desc    Get all books (with search & filter)
 * @route   GET /api/books
 * @access  Public
 */
const getBooks = async (req, res, next) => {
  try {
    const { search, category, status, author } = req.query;
    const filter = {};

    if (category) filter.category = { $regex: category, $options: 'i' };
    if (status) filter.status = status;
    if (author) filter.author = { $regex: author, $options: 'i' };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const books = await Book.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single book
 * @route   GET /api/books/:id
 * @access  Public
 */
const getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a new book
 * @route   POST /api/books
 * @access  Admin
 */
const addBook = async (req, res, next) => {
  try {
    const { title, author, category, isbn, price, quantity, location, procurementDate } = req.body;

    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: 'A book with this ISBN already exists.',
      });
    }

    const book = await Book.create({
      title,
      author,
      category,
      isbn,
      price,
      quantity: quantity || 1,
      availableCopies: quantity || 1,
      location: location || 'General Section',
      procurementDate: procurementDate || Date.now(),
    });

    res.status(201).json({
      success: true,
      message: 'Book added successfully.',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update book
 * @route   PUT /api/books/:id
 * @access  Admin
 */
const updateBook = async (req, res, next) => {
  try {
    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

    if (req.body.quantity !== undefined) {
      const issuedCopies = book.quantity - book.availableCopies;
      req.body.availableCopies = Math.max(0, req.body.quantity - issuedCopies);
    }

    book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Book updated successfully.',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete book
 * @route   DELETE /api/books/:id
 * @access  Admin
 */
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBooks, getBook, addBook, updateBook, deleteBook };
