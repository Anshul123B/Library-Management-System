const Issue = require('../models/Issue');
const Book = require('../models/Book');
const User = require('../models/User');
const Membership = require('../models/Membership');
const Transaction = require('../models/Transaction');

/**
 * @desc    Issue a book to a user
 * @route   POST /api/issues
 * @access  Admin / User
 *
 * Business Logic:
 * 1. Check if user account is active
 * 2. If user has membership, check if membership is not expired
 * 3. Check if book is available
 * 4. Reduce availableCopies by 1
 * 5. Create issue record with dueDate = issueDate + 15 days (FIXED)
 * 6. Membership duration controls ONLY validity, NOT book due date
 */
const issueBook = async (req, res, next) => {
  try {
    const { userId, bookId } = req.body;

    const user = await User.findById(userId).populate('membershipId');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.status !== 'active') {
      return res.status(400).json({ success: false, message: 'User account is not active.' });
    }

    let maxBooksLimit = 10;
    if (user.membershipId) {
      const today = new Date();
      
      if (user.membershipEndDate && new Date(user.membershipEndDate) < today) {
        return res.status(400).json({
          success: false,
          message: 'Membership expired. Please renew membership.',
        });
      }
      
      maxBooksLimit = user.membershipId.maxBooksAllowed;
    }

    const activeIssues = await Issue.countDocuments({ userId, status: 'issued' });
    if (activeIssues >= maxBooksLimit) {
      return res.status(400).json({
        success: false,
        message: `User has reached the maximum limit of ${maxBooksLimit} books.`,
      });
    }

    const existingIssue = await Issue.findOne({ userId, bookId, status: 'issued' });
    if (existingIssue) {
      return res.status(400).json({
        success: false,
        message: 'This book is already issued to this user.',
      });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No copies available for this book.',
      });
    }

    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 15);

    const issue = await Issue.create({
      userId,
      bookId,
      issueDate,
      dueDate,
      status: 'issued',
    });

    book.availableCopies -= 1;
    if (book.availableCopies === 0) {
      book.status = 'unavailable';
    }
    await book.save();

    await Transaction.create({
      userId,
      bookId,
      type: 'issue',
      amount: 0,
      date: issueDate,
    });

    const populatedIssue = await Issue.findById(issue._id)
      .populate('userId', 'name email membershipStartDate membershipEndDate')
      .populate('bookId', 'title author isbn');

    res.status(201).json({
      success: true,
      message: 'Book issued successfully.',
      data: populatedIssue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Return a book
 * @route   PUT /api/issues/:id/return
 * @access  Admin / User
 *
 * Business Logic:
 * 1. Set returnDate = current date
 * 2. Increase availableCopies
 * 3. Calculate overdue days = returnDate - dueDate
 * 4. If overdue: fine = overdueDays × membership.finePerDay
 * 5. Store fine in issue record
 * 6. Create transaction entries for return and fine (if applicable)
 */
const returnBook = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('userId')
      .populate('bookId');

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue record not found.' });
    }

    if (issue.status === 'returned') {
      return res.status(400).json({ success: false, message: 'Book has already been returned.' });
    }

    // Get user's membership for fine calculation
    const user = await User.findById(issue.userId._id).populate('membershipId');
    const membership = user.membershipId;

    // Calculate return details
    const returnDate = new Date();
    let fineAmount = 0;
    let overdueDays = 0;

    if (returnDate > issue.dueDate) {
      overdueDays = Math.ceil(
        (returnDate - issue.dueDate) / (1000 * 60 * 60 * 24)
      );
      const finePerDay = membership ? membership.finePerDay : 1;
      fineAmount = overdueDays * finePerDay;
    }

    issue.returnDate = returnDate;
    issue.status = 'returned';
    issue.fineAmount = fineAmount;
    await issue.save();

    const book = await Book.findById(issue.bookId._id);
    book.availableCopies += 1;
    if (book.availableCopies > 0) {
      book.status = 'available';
    }
    await book.save();

    await Transaction.create({
      userId: issue.userId._id,
      bookId: issue.bookId._id,
      type: 'return',
      amount: 0,
      date: returnDate,
    });

    if (fineAmount > 0) {
      await Transaction.create({
        userId: issue.userId._id,
        bookId: issue.bookId._id,
        type: 'fine',
        amount: fineAmount,
        date: returnDate,
      });
    }

    const updatedIssue = await Issue.findById(issue._id)
      .populate('userId', 'name email')
      .populate('bookId', 'title author isbn');

    res.status(200).json({
      success: true,
      message: fineAmount > 0
        ? `Book returned with a fine of ₹${fineAmount} (${overdueDays} overdue days).`
        : 'Book returned successfully. No fine.',
      data: updatedIssue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all issues (with filters)
 * @route   GET /api/issues
 * @access  Admin / User
 */
const getIssues = async (req, res, next) => {
  try {
    const { status, userId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }

    const issues = await Issue.find(filter)
      .populate('userId', 'name email')
      .populate('bookId', 'title author isbn')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single issue
 * @route   GET /api/issues/:id
 * @access  Admin / User
 */
const getIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('bookId', 'title author isbn');

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found.' });
    }

    if (req.user.role !== 'admin' && issue.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    res.status(200).json({ success: true, data: issue });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check book availability
 * @route   GET /api/issues/availability/:bookId
 * @access  Public
 */
const checkAvailability = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.bookId);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    res.status(200).json({
      success: true,
      data: {
        title: book.title,
        totalCopies: book.quantity,
        availableCopies: book.availableCopies,
        isAvailable: book.availableCopies > 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { issueBook, returnBook, getIssues, getIssue, checkAvailability };
