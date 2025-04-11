const User = require('../models/User');
const Report = require('../models/Report');
const Notification = require('../models/Notification');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    // Remove password field if it exists in the request
    if (req.body.password) {
      delete req.body.password;
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`
      });
    }

    // Delete user's reports
    await Report.deleteMany({ user: req.params.id });

    // Delete user's notifications
    await Notification.deleteMany({ user: req.params.id });

    // Delete user
    await user.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res, next) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();

    // Get total reports count
    const totalReports = await Report.countDocuments();

    // Get reports by status
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const inProgressReports = await Report.countDocuments({ status: 'in-progress' });
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });

    // Get reports by category
    const reportsByCategory = await Report.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get reports created in the last 7 days
    const lastWeekReports = await Report.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // Get reports created in the last 30 days
    const lastMonthReports = await Report.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // Get reports by neighborhood
    const reportsByNeighborhood = await Report.aggregate([
      {
        $group: {
          _id: '$neighborhood',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalReports,
        reportsByStatus: {
          pending: pendingReports,
          inProgress: inProgressReports,
          resolved: resolvedReports
        },
        reportsByCategory,
        reportsByTime: {
          lastWeek: lastWeekReports,
          lastMonth: lastMonthReports
        },
        reportsByNeighborhood
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reports for admin
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getAdminReports = async (req, res, next) => {
  try {
    // Build query
    const query = {};

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by category if provided
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by neighborhood if provided
    if (req.query.neighborhood) {
      query.neighborhood = req.query.neighborhood;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Report.countDocuments(query);

    // Execute query
    const reports = await Report.find(query)
      .populate({
        path: 'user',
        select: 'fullname email'
      })
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: reports.length,
      pagination,
      total,
      data: reports
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create notification for all users
// @route   POST /api/admin/notifications
// @access  Private/Admin
exports.createGlobalNotification = async (req, res, next) => {
  try {
    const { title, message, type } = req.body;

    if (!title || !message || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, message and type'
      });
    }

    // Get all users
    const users = await User.find();

    // Create notification for each user
    const notifications = [];
    for (const user of users) {
      notifications.push({
        user: user._id,
        type,
        title,
        message,
        read: false
      });
    }

    // Insert all notifications
    await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: `Notification sent to ${users.length} users`
    });
  } catch (err) {
    next(err);
  }
};
