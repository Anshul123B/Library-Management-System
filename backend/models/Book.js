const mongoose = require('mongoose');

/**
 * Book Schema
 * Tracks library book inventory with availability and location
 */
const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 1,
    },
    availableCopies: {
      type: Number,
      min: [0, 'Available copies cannot be negative'],
      default: 1,
    },
    location: {
      type: String,
      trim: true,
      default: 'General Section',
    },
    procurementDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['available', 'unavailable', 'maintenance'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

bookSchema.index({ title: 'text', author: 'text', category: 'text', isbn: 'text' });

module.exports = mongoose.model('Book', bookSchema);
