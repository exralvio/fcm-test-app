const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authenticate = require('../middleware/auth');

/**
 * @swagger
 * /notifications/all:
 *   post:
 *     summary: Send FCM notification to all active devices in the system
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *                 example: System Announcement
 *               body:
 *                 type: string
 *                 example: This is a system-wide notification
 *               data:
 *                 type: object
 *                 example:
 *                   announcementId: 123
 *                   type: system
 *                 description: Optional custom data payload
 *               priority:
 *                 type: string
 *                 enum: [normal, high]
 *                 default: normal
 *                 example: normal
 *     responses:
 *       200:
 *         description: Notification queued successfully to all devices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Notification queued successfully to 10 device(s)
 *                 data:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: System Announcement
 *                     body:
 *                       type: string
 *                       example: This is a system-wide notification
 *                     totalDevices:
 *                       type: integer
 *                       example: 10
 *                     devices:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           deviceId:
 *                             type: integer
 *                             example: 1
 *                           userId:
 *                             type: integer
 *                             example: 1
 *                           deviceToken:
 *                             type: string
 *                             example: fcm_token_here
 *                           platform:
 *                             type: string
 *                             enum: [ios, android, web]
 *                             example: android
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Title and body are required
 *       404:
 *         description: No active devices found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: No active devices found in the system
 */
router.post('/notifications/all', notificationController.sendToAllDevices.bind(notificationController));

/**
 * @swagger
 * /notifications/user/{userId}:
 *   post:
 *     summary: Send FCM notification to all active devices of a specific user
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *                 example: New Message
 *               body:
 *                 type: string
 *                 example: You have a new message from John
 *               data:
 *                 type: object
 *                 example:
 *                   messageId: 123
 *                   type: chat
 *                 description: Optional custom data payload
 *               priority:
 *                 type: string
 *                 enum: [normal, high]
 *                 default: normal
 *                 example: normal
 *     responses:
 *       200:
 *         description: Notification queued successfully to user's devices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Notification queued successfully to 2 device(s)
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: New Message
 *                     body:
 *                       type: string
 *                       example: You have a new message from John
 *                     totalDevices:
 *                       type: integer
 *                       example: 2
 *                     devices:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           deviceId:
 *                             type: integer
 *                             example: 1
 *                           deviceToken:
 *                             type: string
 *                             example: fcm_token_here
 *                           platform:
 *                             type: string
 *                             enum: [ios, android, web]
 *                             example: android
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Title and body are required
 *       404:
 *         description: User not found or no active devices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: No active devices found for user 1
 */
router.post('/notifications/user/:userId', notificationController.sendToUserId.bind(notificationController));

module.exports = router;

