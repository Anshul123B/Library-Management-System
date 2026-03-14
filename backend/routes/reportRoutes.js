const express = require('express');
const router = express.Router();
const {
  getActiveIssues,
  getOverdueBooks,
  getTransactionHistory,
  getInventoryReport,
  getDashboardStats,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

// All report routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/active-issues', getActiveIssues);
router.get('/overdue', getOverdueBooks);
router.get('/transactions', getTransactionHistory);
router.get('/inventory', getInventoryReport);

module.exports = router;
