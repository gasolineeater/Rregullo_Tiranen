const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getStats,
  getAdminReports,
  createGlobalNotification
} = require('../controllers/admin');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Apply protection and authorization to all routes
router.use(protect);
router.use(authorize('admin'));

router.route('/users').get(getUsers);
router.route('/users/:id').get(getUser).put(updateUser).delete(deleteUser);
router.route('/stats').get(getStats);
router.route('/reports').get(getAdminReports);
router.route('/notifications').post(createGlobalNotification);

module.exports = router;
