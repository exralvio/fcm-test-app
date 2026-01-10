const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// POST /create-notification - Create notification and queue for FCM
router.post('/create-notification', notificationController.createNotification.bind(notificationController));

// GET /notifications/:id - Get notification by ID
router.get('/notifications/:id', notificationController.getNotification.bind(notificationController));

// GET /notifications/user/:userId - Get notifications by user ID
router.get('/notifications/user/:userId', notificationController.getUserNotifications.bind(notificationController));

module.exports = router;

