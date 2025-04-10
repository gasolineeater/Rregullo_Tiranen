const Report = require('../models/Report');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all reports
// @route   GET /api/reports
// @access  Public
exports.getReports = async (req, res, next) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    let query = Report.find(JSON.parse(queryStr)).populate({
      path: 'user',
      select: 'fullname'
    });

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Report.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const reports = await query;

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
      data: reports
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Public
exports.getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id).populate({
      path: 'user',
      select: 'fullname'
    }).populate({
      path: 'comments.user',
      select: 'fullname'
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Report not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new report
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    // Format location
    if (req.body.lat && req.body.lng) {
      req.body.location = {
        type: 'Point',
        coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)]
      };
    }

    // Create report
    const report = await Report.create(req.body);

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update report
// @route   PUT /api/reports/:id
// @access  Private
exports.updateReport = async (req, res, next) => {
  try {
    let report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Report not found with id of ${req.params.id}`
      });
    }

    // Make sure user is report owner or admin
    if (report.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this report`
      });
    }

    // Format location if provided
    if (req.body.lat && req.body.lng) {
      req.body.location = {
        type: 'Point',
        coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)]
      };
    }

    report = await Report.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update report status
// @route   PUT /api/reports/:id/status
// @access  Private
exports.updateReportStatus = async (req, res, next) => {
  try {
    const { status, comment } = req.body;

    let report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Report not found with id of ${req.params.id}`
      });
    }

    // Only admins can update status
    if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update report status`
      });
    }

    // Update status
    report.status = status;

    // Add status update to history
    if (!report.statusUpdates) {
      report.statusUpdates = new Map();
    }

    report.statusUpdates.set(status, {
      date: Date.now(),
      comment: comment || '',
      updatedBy: req.user.id
    });

    await report.save();

    // Create notification for report owner
    if (report.user.toString() !== req.user.id) {
      // Get user to check notification preferences
      const user = await User.findById(report.user);

      // Check if user wants status notifications
      if (user && user.notifications && user.notifications.status) {
        let statusMessage = '';
        
        switch(status) {
          case 'in-progress':
            statusMessage = 'ka ndryshuar statusin në "Në proces"';
            break;
          case 'resolved':
            statusMessage = 'ka ndryshuar statusin në "I zgjidhur"';
            break;
          case 'pending':
            statusMessage = 'ka ndryshuar statusin në "Në pritje"';
            break;
          default:
            statusMessage = `ka ndryshuar statusin në "${status}"`;
        }

        await Notification.create({
          user: report.user,
          type: 'status',
          title: 'Statusi i raportimit u përditësua',
          message: `Raportimi juaj "${report.title}" ${statusMessage}.${comment ? ` Komenti: ${comment}` : ''}`,
          report: report._id
        });
      }
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private
exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Report not found with id of ${req.params.id}`
      });
    }

    // Make sure user is report owner or admin
    if (report.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this report`
      });
    }

    await report.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reports within radius
// @route   GET /api/reports/radius/:zipcode/:distance
// @access  Public
exports.getReportsInRadius = async (req, res, next) => {
  try {
    const { lat, lng, distance } = req.params;

    // Calculate radius using radians
    // Divide distance by radius of Earth
    // Earth Radius = 6,378 km
    const radius = distance / 6378;

    const reports = await Report.find({
      location: {
        $geoWithin: { $centerSphere: [[lng, lat], radius] }
      }
    });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment to report
// @route   POST /api/reports/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Report not found with id of ${req.params.id}`
      });
    }

    // Create comment
    const comment = {
      text: req.body.text,
      user: req.user.id,
      name: req.user.fullname
    };

    // Add comment to report
    report.comments.push(comment);
    await report.save();

    // Create notification for report owner if not the commenter
    if (report.user.toString() !== req.user.id) {
      // Get user to check notification preferences
      const user = await User.findById(report.user);

      // Check if user wants comment notifications
      if (user && user.notifications && user.notifications.comments) {
        await Notification.create({
          user: report.user,
          type: 'comment',
          title: 'Koment i ri në raportin tuaj',
          message: `${req.user.fullname}: "${req.body.text.substring(0, 100)}${req.body.text.length > 100 ? '...' : ''}"`,
          report: report._id
        });
      }
    }

    res.status(200).json({
      success: true,
      data: report.comments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user reports
// @route   GET /api/reports/user
// @access  Private
exports.getUserReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (err) {
    next(err);
  }
};
