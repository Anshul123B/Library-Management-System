const mongoose = require('mongoose');

/**
 * Transaction Schema
 * Records all financial transactions (issues, returns, fines)
 */
const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      default: null,
    },
    type: {
      type: String,
      enum: ['issue', 'return', 'fine'],
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
