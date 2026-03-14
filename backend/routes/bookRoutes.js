const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBook,
  addBook,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/auth');

// Public route - anyone can view books
router.get('/', getBooks);
router.get('/:id', getBook);

// Admin-only routes
router.post('/', protect, authorize('admin'), addBook);
router.put('/:id', protect, authorize('admin'), updateBook);
router.delete('/:id', protect, authorize('admin'), deleteBook);

module.exports = router;
