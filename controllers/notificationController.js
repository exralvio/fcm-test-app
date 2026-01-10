const notificationService = require('../services/notificationService');

class NotificationController {
  /**
   * Create notification endpoint handler
   * POST /create-notification
   * Body: { message: string, title?: string, userId: number, deviceId?: number, data?: object, notificationType?: string }
   */
  async createNotification(req, res) {
    try {
      const { message, title, userId, deviceId, data, notificationType } = req.body;

      // Validate required fields
      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Message is required'
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'UserId is required'
        });
      }

      // Create notification and add to queue
      const notification = await notificationService.createNotification({
        message,
        title,
        userId,
        deviceId,
        data,
        notificationType
      });

      return res.status(201).json({
        success: true,
        message: 'Notification created and queued successfully',
        data: {
          id: notification.id,
          userId: notification.userId,
          deviceId: notification.deviceId,
          title: notification.title,
          body: notification.body,
          status: notification.status,
          createdAt: notification.createdAt
        }
      });
    } catch (error) {
      console.error('Error in createNotification controller:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      });
    }
  }

  /**
   * Get notification by ID
   * GET /notifications/:id
   */
  async getNotification(req, res) {
    try {
      const { id } = req.params;
      const { Notification } = require('../models');

      const notification = await Notification.findByPk(id, {
        include: [
          { model: require('../models').User, as: 'user', attributes: ['id', 'name', 'email'] },
          { model: require('../models').Device, as: 'device', attributes: ['id', 'platform', 'deviceModel'] }
        ]
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: notification
      });
    } catch (error) {
      console.error('Error in getNotification controller:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      });
    }
  }

  /**
   * Get notifications by user ID
   * GET /notifications/user/:userId
   */
  async getUserNotifications(req, res) {
    try {
      const { userId } = req.params;
      const { Notification } = require('../models');
      const { limit = 50, offset = 0, status } = req.query;

      const where = { userId };
      if (status) {
        where.status = status;
      }

      const notifications = await Notification.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        include: [
          { model: require('../models').Device, as: 'device', attributes: ['id', 'platform', 'deviceModel'] }
        ]
      });

      return res.status(200).json({
        success: true,
        data: {
          notifications: notifications.rows,
          total: notifications.count,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      console.error('Error in getUserNotifications controller:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      });
    }
  }
}

module.exports = new NotificationController();

