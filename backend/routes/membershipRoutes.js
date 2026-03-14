const express = require('express');
const router = express.Router();
const {
  getMemberships,
  getMembership,
  createMembership,
  updateMembership,
  deleteMembership,
} = require('../controllers/membershipController');
const { protect, authorize } = require('../middleware/auth');

// Public route
router.get('/', getMemberships);
router.get('/:id', getMembership);

// Admin-only routes
router.post('/', protect, authorize('admin'), createMembership);
router.put('/:id', protect, authorize('admin'), updateMembership);
router.delete('/:id', protect, authorize('admin'), deleteMembership);

module.exports = router;
