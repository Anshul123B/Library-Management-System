const Issue = require('../models/Issue');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

/**
 * @desc    Get active issued books report
 * @route   GET /api/reports/active-issues
 * @access  Admin
 */
const getActiveIssues = async (req, res, next) => {
  try {
    const activeIssues = await Issue.find({ status: 'issued' })
      .populate('userId', 'name email status membershipId membershipStartDate membershipEndDate')
      .populate('bookId', 'title author isbn category availableCopies')
      .sort({ issueDate: -1 });

    res.status(200).json({
      success: true,
      count: activeIssues.length,
      data: activeIssues,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get overdue books report
 * @route   GET /api/reports/overdue
 * @access  Admin
 */
const getOverdueBooks = async (req, res, next) => {
  try {
    const now = new Date();

    const overdueIssues = await Issue.find({
      status: 'issued',
      dueDate: { $lt: now },
    })
      .populate('userId', 'name email status membershipId membershipStartDate membershipEndDate')
      .populate('bookId', 'title author isbn category availableCopies')
      .sort({ dueDate: 1 });

    // Calculate overdue days for each issue
    const overdueData = overdueIssues.map((issue) => {
      const overdueDays = Math.ceil((now - issue.dueDate) / (1000 * 60 * 60 * 24));
      const issueObj = issue.toObject();
      return {
        ...issueObj,
        overdueDays,
      };
    });

    res.status(200).json({
      success: true,
      count: overdueData.length,
      data: overdueData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get transaction history
 * @route   GET /api/reports/transactions
 * @access  Admin
 */
const getTransactionHistory = async (req, res, next) => {
  try {
    const { type, userId, startDate, endDate } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (userId) filter.userId = userId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .populate('userId', 'name email status')
      .populate('bookId', 'title author isbn')
      .sort({ date: -1 });

    // Calculate summary
    const totalFines = transactions
      .filter((t) => t.type === 'fine')
      .reduce((sum, t) => sum + t.amount, 0);

    res.status(200).json({
      success: true,
      count: transactions.length,
      totalFines,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get books inventory report
 * @route   GET /api/reports/inventory
 * @access  Admin
 */
const getInventoryReport = async (req, res, next) => {
  try {
    const books = await Book.find().sort({ title: 1 });

    const totalBooks = books.reduce((sum, b) => sum + b.quantity, 0);
    const totalAvailable = books.reduce((sum, b) => sum + b.availableCopies, 0);
    const totalIssued = totalBooks - totalAvailable;

    // Category-wise breakdown
    const categoryBreakdown = {};
    books.forEach((book) => {
      if (!categoryBreakdown[book.category]) {
        categoryBreakdown[book.category] = { total: 0, available: 0, issued: 0, titles: 0 };
      }
      categoryBreakdown[book.category].titles += 1;
      categoryBreakdown[book.category].total += book.quantity;
      categoryBreakdown[book.category].available += book.availableCopies;
      categoryBreakdown[book.category].issued += book.quantity - book.availableCopies;
    });

    res.status(200).json({
      success: true,
      summary: {
        totalTitles: books.length,
        totalBooks,
        totalAvailable,
        totalIssued,
      },
      categoryBreakdown,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard stats
 * @route   GET /api/reports/dashboard
 * @access  Admin
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeIssues = await Issue.countDocuments({ status: 'issued' });
    const overdueIssues = await Issue.countDocuments({
      status: 'issued',
      dueDate: { $lt: new Date() },
    });

    const totalFines = await Transaction.aggregate([
      { $match: { type: 'fine' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);


    const recentTransactions = await Transaction.find()
      .populate('userId', 'name email')
      .populate('bookId', 'title author')
      .sort({ date: -1 })
      .limit(10);

    console.log('Recent transactions before response:', JSON.stringify(recentTransactions, null, 2));

    res.status(200).json({
      success: true,
      data: {
        totalBooks,
        totalUsers,
        activeIssues,
        overdueIssues,
        totalFinesCollected: totalFines.length > 0 ? totalFines[0].total : 0,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    next(error);
  }
};

module.exports = {
  getActiveIssues,
  getOverdueBooks,
  getTransactionHistory,
  getInventoryReport,
  getDashboardStats,
};
