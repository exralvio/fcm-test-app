const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User } = require('../models');

class UserService {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    try {
      const { name, email, phone, password, isActive } = userData;

      // Check if email already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Check if phone already exists (if provided)
      if (phone) {
        const existingPhone = await User.findOne({ where: { phone } });
        if (existingPhone) {
          throw new Error('User with this phone number already exists');
        }
      }

      const user = await User.create({
        name,
        email,
        phone,
        password, // In production, hash this password
        isActive: isActive !== undefined ? isActive : true
      });

      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Get all users with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Users list with pagination
   */
  async getAllUsers(options = {}) {
    try {
      const { limit = 50, offset = 0, isActive, search } = options;

      const where = {};
      if (isActive !== undefined) {
        where.isActive = isActive === 'true' || isActive === true;
      }

      if (search) {
        const { Op } = require('sequelize');
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['password'] }
      });

      return {
        users: rows,
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User object
   */
  async getUserById(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: require('../models').Device,
            as: 'devices',
            attributes: ['id', 'deviceToken', 'platform', 'deviceModel', 'isActive', 'lastActiveAt']
          }
        ]
      });

      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      return user;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * Update user by ID
   * @param {number} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, userData) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const { name, email, phone, password, isActive, lastLoginAt } = userData;

      // Check if email is being changed and already exists
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          throw new Error('User with this email already exists');
        }
      }

      // Check if phone is being changed and already exists
      if (phone && phone !== user.phone) {
        const existingPhone = await User.findOne({ where: { phone } });
        if (existingPhone) {
          throw new Error('User with this phone number already exists');
        }
      }

      // Update fields
      if (name !== undefined) user.name = name;
      if (email !== undefined) user.email = email;
      if (phone !== undefined) user.phone = phone;
      if (password !== undefined) user.password = password; // In production, hash this
      if (isActive !== undefined) user.isActive = isActive;
      if (lastLoginAt !== undefined) user.lastLoginAt = lastLoginAt;

      await user.save();

      // Return user without password
      const updatedUser = user.toJSON();
      delete updatedUser.password;

      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete user by ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteUser(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      await user.destroy();
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Authenticate user by email and password
   * @param {string} email - User email
   * @param {string} password - User password (plain text)
   * @returns {Promise<Object>} JWT token
   */
  async login(email, password) {
    try {
      // Find user by email with password included
      const user = await User.scope('withPassword').findOne({ where: { email } });
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('User account is inactive');
      }

      // Check if user has a password set
      if (!user.password) {
        throw new Error('Password not set for this user');
      }

      // Verify password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update lastLoginAt
      user.lastLoginAt = new Date();
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email
        },
        config.jwt.secret,
        {
          expiresIn: config.jwt.expiresIn
        }
      );

      return { token };
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }
}

module.exports = new UserService();

