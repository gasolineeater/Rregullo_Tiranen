const express = require('express');
const {
  getNotifications,
  markAsRead,
  deleteNotification,
  markAllAsRead
} = require('../controllers/notifications');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getNotifications);
router.route('/read-all').put(markAllAsRead);
router
  .route('/:id')
  .put(markAsRead)
  .delete(deleteNotification);

module.exports = router;
