const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

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
 *     summary: Get all devices
 *     tags: [Devices]
 *     parameters:
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [ios, android, web]
 *         description: Filter by platform
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       deviceToken:
 *                         type: string
 *                         example: fcm_token_here
 *                       deviceId:
 *                         type: string
 *                         example: unique_device_uuid
 *                         nullable: true
 *                       platform:
 *                         type: string
 *                         enum: [ios, android, web]
 *                         example: android
 *                       appVersion:
 *                         type: string
 *                         example: 1.0.0
 *                         nullable: true
 *                       osVersion:
 *                         type: string
 *                         example: 13.0
 *                         nullable: true
 *                       deviceModel:
 *                         type: string
 *                         example: Samsung Galaxy S21
 *                         nullable: true
 *                       lastActiveAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
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


module.exports = router;

