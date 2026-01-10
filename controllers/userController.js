const bcrypt = require('bcryptjs');
const userService = require('../services/userService');

class UserController {
  /**
   * Create a new user
   * POST /users
   */
  async createUser(req, res) {
    try {
      const { name, email, phone, password } = req.body;

      // Validate required fields
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          error: 'Name and email are required'
        });
      }

      // Hash password with salt before saving
      let hashedPassword = null;
      if (password) {
        const saltRounds = 10;
        hashedPassword = await bcrypt.hash(password, saltRounds);
      }

      const user = await userService.createUser({
        name,
        email,
        phone,
        password: hashedPassword
      });

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error) {
      console.error('Error in createUser controller:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'Failed to create user'
      });
    }
  }

  /**
   * Get all users
   * GET /users
   */
  async getAllUsers(req, res) {
    try {
      const { limit, offset, isActive, search } = req.query;

      const result = await userService.getAllUsers({
        limit,
        offset,
        isActive,
        search
      });

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in getAllUsers controller:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get users'
      });
    }
  }

  /**
   * Get user by ID
   * GET /users/:id
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      const user = await userService.getUserById(id);

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error in getUserById controller:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to get user'
      });
    }
  }

  /**
   * Update user by ID
   * PUT /users/:id
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email, phone, password, isActive, lastLoginAt } = req.body;

      const user = await userService.updateUser(id, {
        name,
        email,
        phone,
        password,
        isActive,
        lastLoginAt
      });

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      console.error('Error in updateUser controller:', error);
      const statusCode = error.message.includes('not found') || error.message.includes('already exists') ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to update user'
      });
    }
  }

  /**
   * Delete user by ID
   * DELETE /users/:id
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      await userService.deleteUser(id);

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteUser controller:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to delete user'
      });
    }
  }
}

module.exports = new UserController();

