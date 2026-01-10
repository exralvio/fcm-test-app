const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// CRUD routes for users
router.post('/users', userController.createUser.bind(userController));
router.get('/users', userController.getAllUsers.bind(userController));
router.get('/users/:id', userController.getUserById.bind(userController));
router.put('/users/:id', userController.updateUser.bind(userController));
router.delete('/users/:id', userController.deleteUser.bind(userController));

module.exports = router;

