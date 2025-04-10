const express = require('express');
const {
  getReports,
  getReport,
  createReport,
  updateReport,
  updateReportStatus,
  deleteReport,
  getReportsInRadius,
  addComment,
  getUserReports
} = require('../controllers/reports');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/radius/:lat/:lng/:distance').get(getReportsInRadius);
router.route('/user').get(protect, getUserReports);

router
  .route('/')
  .get(getReports)
  .post(protect, createReport);

router
  .route('/:id')
  .get(getReport)
  .put(protect, updateReport)
  .delete(protect, deleteReport);

router.route('/:id/status').put(protect, authorize('admin'), updateReportStatus);
router.route('/:id/comments').post(protect, addComment);

module.exports = router;
