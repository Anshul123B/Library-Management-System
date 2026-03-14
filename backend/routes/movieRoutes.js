const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovie,
  addMovie,
  updateMovie,
  deleteMovie,
} = require('../controllers/movieController');
const { protect, authorize } = require('../middleware/auth');

// Public route
router.get('/', getMovies);
router.get('/:id', getMovie);

// Admin-only routes
router.post('/', protect, authorize('admin'), addMovie);
router.put('/:id', protect, authorize('admin'), updateMovie);
router.delete('/:id', protect, authorize('admin'), deleteMovie);

module.exports = router;
