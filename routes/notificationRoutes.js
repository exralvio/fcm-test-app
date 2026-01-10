const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

/**
 * @swagger
 * /create-notification:
 *   post:
 *     summary: Create notification and queue for FCM
 *     description: Creates a notification record, adds it to FCM queue for processing, and sends via Firebase Cloud Messaging
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - userId
 *             properties:
 *               message:
 *                 type: string
 *                 description: Notification message body
 *                 example: You have a new message
 *               title:
 *                 type: string
 *                 description: Notification title
 *                 example: New Message
 *               userId:
 *                 type: integer
 *                 description: User ID who should receive the notification
 *                 example: 1
 *               deviceId:
 *                 type: integer
 *                 description: Optional specific device ID (if not provided, uses first active device)
 *                 example: 1
 *               data:
 *                 type: object
 *                 description: Additional data payload for notification
 *                 example:
 *                   messageId: 123
 *                   customField: value
 *               notificationType:
 *                 type: string
 *                 description: Type of notification
 *                 example: general
 *     responses:
 *       201:
 *         description: Notification created and queued successfully
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
 *                   example: Notification created and queued successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     userId:
 *                       type: integer
 *                     deviceId:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     body:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [pending, sent, failed, invalid_token]
 *                     createdAt:
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
 *                   example: Message is required
 *       404:
 *         description: User or device not found
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
 *                   example: User with ID 1 not found
 */
router.post('/create-notification', notificationController.createNotification.bind(notificationController));

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Get notification by ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     deviceId:
 *                       type: integer
 *                       example: 1
 *                       nullable: true
 *                     deviceToken:
 *                       type: string
 *                       example: fcm_token_here
 *                     title:
 *                       type: string
 *                       example: New Message
 *                     body:
 *                       type: string
 *                       example: You have a new message
 *                     data:
 *                       type: object
 *                       example:
 *                         messageId: 123
 *                       nullable: true
 *                     notificationType:
 *                       type: string
 *                       example: general
 *                       nullable: true
 *                     status:
 *                       type: string
 *                       enum: [pending, sent, failed, invalid_token]
 *                       example: pending
 *                     fcmMessageId:
 *                       type: string
 *                       example: projects/project-id/messages/message-id
 *                       nullable: true
 *                     fcmErrorCode:
 *                       type: string
 *                       example: messaging/invalid-registration-token
 *                       nullable: true
 *                     fcmErrorMessage:
 *                       type: string
 *                       example: The registration token is invalid
 *                       nullable: true
 *                     sentAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     deliveredAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     readAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     device:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         platform:
 *                           type: string
 *                         deviceModel:
 *                           type: string
 *       404:
 *         description: Notification not found
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
 *                   example: Notification with ID 1 not found
 */
router.get('/notifications/:id', notificationController.getNotification.bind(notificationController));

/**
 * @swagger
 * /notifications/user/{userId}:
 *   get:
 *     summary: Get notifications by user ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of notifications to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of notifications to skip
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, sent, failed, invalid_token]
 *         description: Filter by notification status
 *     responses:
 *       200:
 *         description: List of notifications for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           userId:
 *                             type: integer
 *                             example: 1
 *                           deviceId:
 *                             type: integer
 *                             example: 1
 *                             nullable: true
 *                           deviceToken:
 *                             type: string
 *                             example: fcm_token_here
 *                           title:
 *                             type: string
 *                             example: New Message
 *                           body:
 *                             type: string
 *                             example: You have a new message
 *                           data:
 *                             type: object
 *                             example:
 *                               messageId: 123
 *                             nullable: true
 *                           notificationType:
 *                             type: string
 *                             example: general
 *                             nullable: true
 *                           status:
 *                             type: string
 *                             enum: [pending, sent, failed, invalid_token]
 *                             example: pending
 *                           fcmMessageId:
 *                             type: string
 *                             example: projects/project-id/messages/message-id
 *                             nullable: true
 *                           fcmErrorCode:
 *                             type: string
 *                             example: messaging/invalid-registration-token
 *                             nullable: true
 *                           fcmErrorMessage:
 *                             type: string
 *                             example: The registration token is invalid
 *                             nullable: true
 *                           sentAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           deliveredAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           readAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           device:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               platform:
 *                                 type: string
 *                               deviceModel:
 *                                 type: string
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     limit:
 *                       type: integer
 *                       example: 50
 *                     offset:
 *                       type: integer
 *                       example: 0
 *       404:
 *         description: User not found
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
 *                   example: User with ID 1 not found
 */
router.get('/notifications/user/:userId', notificationController.getUserNotifications.bind(notificationController));

module.exports = router;

