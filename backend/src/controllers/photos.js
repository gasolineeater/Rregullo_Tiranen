const Report = require('../models/Report');
const path = require('path');
const fs = require('fs');

// @desc    Upload photo for report
// @route   POST /api/reports/:id/photos
// @access  Private
exports.uploadReportPhoto = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      // Remove uploaded file if report not found
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(404).json({
        success: false,
        message: `Report not found with id of ${req.params.id}`
      });
    }

    // Make sure user is report owner or admin
    if (report.user.toString() !== req.user.id && req.user.role !== 'admin') {
      // Remove uploaded file if not authorized
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this report`
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Get filename
    const fileName = req.file.filename;

    // Add photo to report
    report.photos.push(fileName);
    await report.save();

    res.status(200).json({
      success: true,
      data: fileName
    });
  } catch (err) {
    // Remove uploaded file if error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    next(err);
  }
};

// @desc    Delete photo from report
// @route   DELETE /api/reports/:id/photos/:photo
// @access  Private
exports.deleteReportPhoto = async (req, res, next) => {
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
        message: `User ${req.user.id} is not authorized to update this report`
      });
    }

    // Check if photo exists in report
    if (!report.photos.includes(req.params.photo)) {
      return res.status(404).json({
        success: false,
        message: `Photo ${req.params.photo} not found in report`
      });
    }

    // Remove photo from report
    report.photos = report.photos.filter(photo => photo !== req.params.photo);
    await report.save();

    // Delete photo from filesystem
    const photoPath = path.join(__dirname, `../../uploads/${req.params.photo}`);
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all photos for a report
// @route   GET /api/reports/:id/photos
// @access  Public
exports.getReportPhotos = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Report not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      count: report.photos.length,
      data: report.photos
    });
  } catch (err) {
    next(err);
  }
};
