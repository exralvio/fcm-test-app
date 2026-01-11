const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Authentication middleware to verify JWT tokens
 * Extracts token from Authorization header and verifies it
 * Sets req.user with user information from token
 */
const authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token is required'
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token is required'
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // Set user information in request object
      req.user = {
        id: decoded.id,
        email: decoded.email
      };
      
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid authentication token'
        });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Authentication token has expired'
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error in authentication middleware:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

module.exports = authenticate;

