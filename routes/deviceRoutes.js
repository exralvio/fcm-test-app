const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const authenticate = require('../middleware/auth');

/**
 * @swagger
 * /devices/register:
 *   post:
 *     summary: Register a device for a user (updates if token exists)
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceToken
 *             properties:
 *               deviceToken:
 *                 type: string
 *                 example: fcm_token_here
 *               deviceId:
 *                 type: string
 *                 example: unique_device_uuid
 *               platform:
 *                 type: string
 *                 enum: [ios, android, web]
 *                 example: android
 *               appVersion:
 *                 type: string
 *                 example: 1.0.0
 *               osVersion:
 *                 type: string
 *                 example: 13.0
 *               deviceModel:
 *                 type: string
 *                 example: Samsung Galaxy S21
 *     responses:
 *       201:
 *         description: Device registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     deviceToken:
 *                       type: string
 *                       example: fcm_token_here
 *                     deviceId:
 *                       type: string
 *                       example: unique_device_uuid
 *                       nullable: true
 *                     platform:
 *                       type: string
 *                       enum: [ios, android, web]
 *                       example: android
 *                     appVersion:
 *                       type: string
 *                       example: 1.0.0
 *                       nullable: true
 *                     osVersion:
 *                       type: string
 *                       example: 13.0
 *                       nullable: true
 *                     deviceModel:
 *                       type: string
 *                       example: Samsung Galaxy S21
 *                       nullable: true
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     lastActiveAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
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
 *                   example: Validation error message
 *       401:
 *         description: Authentication error
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
 *                   example: Authentication token is required
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
router.post('/devices/register', authenticate, deviceController.registerDevice.bind(deviceController));

/**
 * @swagger
 * /devices:
 *   post:
 *     summary: Create a new device
 *     tags: [Devices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - deviceToken
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               deviceToken:
 *                 type: string
 *                 example: fcm_token_here
 *               deviceId:
 *                 type: string
 *                 example: unique_device_uuid
 *               platform:
 *                 type: string
 *                 enum: [ios, android, web]
 *                 default: android
 *               appVersion:
 *                 type: string
 *                 example: 1.0.0
 *               osVersion:
 *                 type: string
 *                 example: 13.0
 *               deviceModel:
 *                 type: string
 *                 example: Samsung Galaxy S21
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Device created successfully
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
 *                   example: Device created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     userId:
 *                       type: integer
 *                     deviceToken:
 *                       type: string
 *                     deviceId:
 *                       type: string
 *                       nullable: true
 *                     platform:
 *                       type: string
 *                     appVersion:
 *                       type: string
 *                       nullable: true
 *                     osVersion:
 *                       type: string
 *                       nullable: true
 *                     deviceModel:
 *                       type: string
 *                       nullable: true
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error or device token already exists
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
 *                   example: Device with this token already exists
 */
router.post('/devices', deviceController.createDevice.bind(deviceController));

/**
 * @swagger
 * /devices:
 *   get:
 *     summary: Get all devices with pagination
 *     tags: [Devices]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of devices to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of devices to skip
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [ios, android, web]
 *         description: Filter by platform
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in deviceToken, deviceId, or deviceModel
 *     responses:
 *       200:
 *         description: List of devices
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
 *                     devices:
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
 *                           deviceToken:
 *                             type: string
 *                             example: fcm_token_here
 *                           deviceId:
 *                             type: string
 *                             example: unique_device_uuid
 *                             nullable: true
 *                           platform:
 *                             type: string
 *                             enum: [ios, android, web]
 *                             example: android
 *                           appVersion:
 *                             type: string
 *                             example: 1.0.0
 *                             nullable: true
 *                           osVersion:
 *                             type: string
 *                             example: 13.0
 *                             nullable: true
 *                           deviceModel:
 *                             type: string
 *                             example: Samsung Galaxy S21
 *                             nullable: true
 *                           isActive:
 *                             type: boolean
 *                             example: true
 *                           lastActiveAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               name:
 *                                 type: string
 *                               email:
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
 */
router.get('/devices', deviceController.getAllDevices.bind(deviceController));

/**
 * @swagger
 * /devices/{id}:
 *   get:
 *     summary: Get device by ID
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Device ID
 *     responses:
 *       200:
 *         description: Device details
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
 *                     deviceToken:
 *                       type: string
 *                       example: fcm_token_here
 *                     deviceId:
 *                       type: string
 *                       example: unique_device_uuid
 *                       nullable: true
 *                     platform:
 *                       type: string
 *                       enum: [ios, android, web]
 *                       example: android
 *                     appVersion:
 *                       type: string
 *                       example: 1.0.0
 *                       nullable: true
 *                     osVersion:
 *                       type: string
 *                       example: 13.0
 *                       nullable: true
 *                     deviceModel:
 *                       type: string
 *                       example: Samsung Galaxy S21
 *                       nullable: true
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     lastActiveAt:
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
 *       404:
 *         description: Device not found
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
 *                   example: Device with ID 1 not found
 */
router.get('/devices/:id', deviceController.getDeviceById.bind(deviceController));

/**
 * @swagger
 * /devices/{id}:
 *   put:
 *     summary: Update device by ID
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Device ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               deviceToken:
 *                 type: string
 *               deviceId:
 *                 type: string
 *               platform:
 *                 type: string
 *                 enum: [ios, android, web]
 *               appVersion:
 *                 type: string
 *               osVersion:
 *                 type: string
 *               deviceModel:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Device updated successfully
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
 *                   example: Device updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     userId:
 *                       type: integer
 *                     deviceToken:
 *                       type: string
 *                     deviceId:
 *                       type: string
 *                       nullable: true
 *                     platform:
 *                       type: string
 *                     appVersion:
 *                       type: string
 *                       nullable: true
 *                     osVersion:
 *                       type: string
 *                       nullable: true
 *                     deviceModel:
 *                       type: string
 *                       nullable: true
 *                     isActive:
 *                       type: boolean
 *                     lastActiveAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
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
 *                   example: Device with this token already exists
 *       404:
 *         description: Device not found
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
 *                   example: Device with ID 1 not found
 */
router.put('/devices/:id', deviceController.updateDevice.bind(deviceController));

/**
 * @swagger
 * /devices/{id}:
 *   delete:
 *     summary: Delete device by ID
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Device ID
 *     responses:
 *       200:
 *         description: Device deleted successfully
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
 *                   example: Device deleted successfully
 *       404:
 *         description: Device not found
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
 *                   example: Device with ID 1 not found
 */
router.delete('/devices/:id', deviceController.deleteDevice.bind(deviceController));

/**
 * @swagger
 * /devices/user/{userId}:
 *   get:
 *     summary: Get all devices by user ID
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of devices for the user
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
 *                     devices:
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
 *                           deviceToken:
 *                             type: string
 *                             example: fcm_token_here
 *                           deviceId:
 *                             type: string
 *                             example: unique_device_uuid
 *                             nullable: true
 *                           platform:
 *                             type: string
 *                             enum: [ios, android, web]
 *                             example: android
 *                           appVersion:
 *                             type: string
 *                             example: 1.0.0
 *                             nullable: true
 *                           osVersion:
 *                             type: string
 *                             example: 13.0
 *                             nullable: true
 *                           deviceModel:
 *                             type: string
 *                             example: Samsung Galaxy S21
 *                             nullable: true
 *                           isActive:
 *                             type: boolean
 *                             example: true
 *                           lastActiveAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     total:
 *                       type: integer
 *                       example: 5
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
router.get('/devices/user/:userId', deviceController.getDevicesByUserId.bind(deviceController));

/**
 * @swagger
 * /devices/firebase-token:
 *   post:
 *     summary: Generate Firebase custom authentication token
 *     description: Generate a Firebase custom authentication token using Firebase Admin SDK. This token is generated by the Firebase SDK, not from MySQL database.
 *     tags: [Devices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uid
 *             properties:
 *               uid:
 *                 type: string
 *                 description: User ID for the custom token
 *                 example: user123
 *               claims:
 *                 type: object
 *                 description: Additional custom claims to include in the token (optional)
 *                 example:
 *                   role: admin
 *                   premium: true
 *     responses:
 *       200:
 *         description: Firebase custom token generated successfully
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
 *                   example: Firebase custom token generated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: Firebase custom authentication token
 *                       example: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     uid:
 *                       type: string
 *                       example: user123
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T10:30:00.000Z
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
 *                   example: uid is required
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
 *                   example: Failed to generate Firebase token
 */
router.post('/devices/firebase-token', deviceController.getFirebaseToken.bind(deviceController));

module.exports = router;

