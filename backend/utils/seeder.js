/**
 * Database Seeder
 * Creates default admin user and sample memberships
 * Run: node utils/seeder.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Membership = require('../models/Membership');
const Book = require('../models/Book');
const Issue = require('../models/Issue');
const Transaction = require('../models/Transaction');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await Membership.deleteMany();
    await Book.deleteMany();
    await Issue.deleteMany();
    await Transaction.deleteMany();
    console.log('🗑️  Cleared existing data');

    // Create memberships
    const memberships = await Membership.create([
      {
        type: '6 Months',
        duration: 180,
        maxBooksAllowed: 5,
        price: 499,
        finePerDay: 5,
        status: 'active',
      },
      {
        type: '1 Year',
        duration: 365,
        maxBooksAllowed: 10,
        price: 899,
        finePerDay: 5,
        status: 'active',
      },
      {
        type: '2 Years',
        duration: 730,
        maxBooksAllowed: 15,
        price: 1599,
        finePerDay: 5,
        status: 'active',
      },
    ]);
    console.log('📋 Memberships created');

    // Create admin user
    const admin = await User.create({
      name: 'Library Admin',
      email: 'admin@library.com',
      password: 'admin123',
      role: 'admin',
      status: 'active',
    });
    console.log('👤 Admin created: admin@library.com / admin123');

    // Create sample user with 6-month membership
    const membershipStartDate = new Date();
    const membershipEndDate = new Date(membershipStartDate);
    membershipEndDate.setMonth(membershipEndDate.getMonth() + 6); // 6 months validity
    
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'user123',
      role: 'user',
      membershipId: memberships[0]._id, // 6 Months plan
      membershipStartDate: membershipStartDate,
      membershipEndDate: membershipEndDate,
      status: 'active',
    });
    console.log('👤 User created: john@example.com / user123 (6-month membership)');

    // Create another user without membership (to test optional membership)
    const userNoMembership = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'user123',
      role: 'user',
      status: 'active',
    });
    console.log('👤 User created: jane@example.com / user123 (No membership)');

    // Create sample books
    await Book.create([
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        category: 'Fiction',
        isbn: '978-0743273565',
        price: 299,
        quantity: 5,
        availableCopies: 5,
        location: 'Shelf A-1',
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        category: 'Fiction',
        isbn: '978-0061120084',
        price: 349,
        quantity: 3,
        availableCopies: 3,
        location: 'Shelf A-2',
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        category: 'Technology',
        isbn: '978-0132350884',
        price: 599,
        quantity: 4,
        availableCopies: 4,
        location: 'Shelf B-1',
      },
      {
        title: 'Design Patterns',
        author: 'Gang of Four',
        category: 'Technology',
        isbn: '978-0201633610',
        price: 799,
        quantity: 2,
        availableCopies: 2,
        location: 'Shelf B-2',
      },
      {
        title: 'Sapiens',
        author: 'Yuval Noah Harari',
        category: 'Non-Fiction',
        isbn: '978-0062316097',
        price: 449,
        quantity: 6,
        availableCopies: 6,
        location: 'Shelf C-1',
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        category: 'Self-Help',
        isbn: '978-0735211292',
        price: 399,
        quantity: 8,
        availableCopies: 8,
        location: 'Shelf C-2',
      },
    ]);
    console.log('📚 Sample books created');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n--- Login Credentials ---');
    console.log('Admin: admin@library.com / admin123');
    console.log('User:  john@example.com / user123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder Error:', error.message);
    process.exit(1);
  }
};

seedData();
