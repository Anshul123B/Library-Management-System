const Membership = require('../models/Membership');

/**
 * @desc    Get all memberships
 * @route   GET /api/memberships
 * @access  Public
 */
const getMemberships = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const memberships = await Membership.find(filter).sort({ price: 1 });

    res.status(200).json({
      success: true,
      count: memberships.length,
      data: memberships,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single membership
 * @route   GET /api/memberships/:id
 * @access  Public
 */
const getMembership = async (req, res, next) => {
  try {
    const membership = await Membership.findById(req.params.id);

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: membership,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create membership
 * @route   POST /api/memberships
 * @access  Admin
 */
const createMembership = async (req, res, next) => {
  try {
    const { type, duration, maxBooksAllowed, price, finePerDay } = req.body;

    const existingMembership = await Membership.findOne({ type });
    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: 'Membership type already exists.',
      });
    }

    const membership = await Membership.create({
      type,
      duration,
      maxBooksAllowed,
      price,
      finePerDay: finePerDay || 1,
    });

    res.status(201).json({
      success: true,
      message: 'Membership created successfully.',
      data: membership,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update membership
 * @route   PUT /api/memberships/:id
 * @access  Admin
 */
const updateMembership = async (req, res, next) => {
  try {
    let membership = await Membership.findById(req.params.id);

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found.',
      });
    }

    membership = await Membership.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Membership updated successfully.',
      data: membership,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete membership
 * @route   DELETE /api/memberships/:id
 * @access  Admin
 */
const deleteMembership = async (req, res, next) => {
  try {
    const membership = await Membership.findById(req.params.id);

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found.',
      });
    }

    await Membership.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Membership deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMemberships, getMembership, createMembership, updateMembership, deleteMembership };
