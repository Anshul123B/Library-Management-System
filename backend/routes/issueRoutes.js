const express = require('express');
const router = express.Router();
const {
  issueBook,
  returnBook,
  getIssues,
  getIssue,
  checkAvailability,
} = require('../controllers/issueController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Check availability (any authenticated user)
router.get('/availability/:bookId', checkAvailability);

// Get issues (admin sees all, user sees own)
router.get('/', getIssues);
router.get('/:id', getIssue);

// Issue a book (admin or user)
router.post('/', issueBook);

// Return a book (admin or user)
router.put('/:id/return', returnBook);

module.exports = router;
