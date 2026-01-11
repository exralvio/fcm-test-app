const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

/**
 * @swagger
 * /send-notifications:
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
router.post('/send-notifications', notificationController.sendToAllDevices.bind(notificationController));

/**
 * @swagger
 * /fcm-jobs:
 *   get:
 *     summary: Get all FCM jobs
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: deviceId
 *         schema:
 *           type: integer
 *         description: Filter by device ID
 *       - in: query
 *         name: includeDevice
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include device information in response
 *     responses:
 *       200:
 *         description: List of FCM jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       deviceId:
 *                         type: integer
 *                         example: 1
 *                       identifier:
 *                         type: string
 *                         nullable: true
 *                         example: job-123
 *                       messageId:
 *                         type: string
 *                         nullable: true
 *                         example: fcm-message-id
 *                       deliverAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: 2024-01-15T10:30:00.000Z
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-15T10:00:00.000Z
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-15T10:00:00.000Z
 *                       device:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           deviceToken:
 *                             type: string
 *                             example: fcm_token_here
 *                           deviceId:
 *                             type: string
 *                             nullable: true
 *                             example: unique_device_uuid
 *                           platform:
 *                             type: string
 *                             enum: [ios, android, web]
 *                             example: android
 *                           appVersion:
 *                             type: string
 *                             nullable: true
 *                             example: 1.0.0
 *                           osVersion:
 *                             type: string
 *                             nullable: true
 *                             example: 13.0
 *                           deviceModel:
 *                             type: string
 *                             nullable: true
 *                             example: Samsung Galaxy S21
 *       500:
 *         description: Server error
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
 *                   example: Failed to get FCM jobs
 */
router.get('/fcm-jobs', notificationController.getAllFcmJobs.bind(notificationController));


module.exports = router;

