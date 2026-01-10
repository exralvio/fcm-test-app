const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// Register device endpoint (special endpoint for device registration)
router.post('/devices/register', deviceController.registerDevice.bind(deviceController));

// CRUD routes for devices
router.post('/devices', deviceController.createDevice.bind(deviceController));
router.get('/devices', deviceController.getAllDevices.bind(deviceController));
router.get('/devices/:id', deviceController.getDeviceById.bind(deviceController));
router.put('/devices/:id', deviceController.updateDevice.bind(deviceController));
router.delete('/devices/:id', deviceController.deleteDevice.bind(deviceController));

// Get devices by user ID
router.get('/devices/user/:userId', deviceController.getDevicesByUserId.bind(deviceController));

module.exports = router;

