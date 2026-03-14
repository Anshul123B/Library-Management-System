const mongoose = require('mongoose');

/**
 * Membership Schema
 * Defines membership plans with validity period and borrowing limits
 * 
 * NOTE: 
 * - duration: validity period of membership (days) - default 180 days (6 months)
 * - Book borrowing is always 15 days from issue date, regardless of membership type
 * - Membership only controls whether user can issue books (active/expired check)
 */
const membershipSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Membership type is required'],
      unique: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'Duration (in days) is required'],
      min: [1, 'Duration must be at least 1 day'],
    },
    maxBooksAllowed: {
      type: Number,
      required: [true, 'Max books allowed is required'],
      min: [1, 'Must allow at least 1 book'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    finePerDay: {
      type: Number,
      required: [true, 'Fine per day is required'],
      min: [0, 'Fine cannot be negative'],
      default: 1,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Membership', membershipSchema);
