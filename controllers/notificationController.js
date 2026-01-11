const notificationService = require('../services/notificationService');

class NotificationController {
  /**
   * Send FCM notification to all devices
   * POST /notifications/all
   */
  async sendToAllDevices(req, res) {
    try {
      const { title, body, data, priority } = req.body;

      // Validate required fields
      if (!title || !body) {
        return res.status(400).json({
          success: false,
          error: 'Title and body are required'
        });
      }

      const result = await notificationService.sendToAllDevices({
        title,
        body,
        data,
        priority
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('Error in sendToAllDevices controller:', error);
      const statusCode = error.message.includes('not found') || error.message.includes('No active devices') ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to send notification to all devices'
      });
    }
  }

  /**
   * Send FCM notification to specific user ID
   * POST /notifications/user/:userId
   */
  async sendToUserId(req, res) {
    try {
      const { userId } = req.params;
      const { title, body, data, priority } = req.body;

      // Validate required fields
      if (!title || !body) {
        return res.status(400).json({
          success: false,
          error: 'Title and body are required'
        });
      }

      const result = await notificationService.sendToUserId({
        userId: parseInt(userId),
        title,
        body,
        data,
        priority
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('Error in sendToUserId controller:', error);
      const statusCode = error.message.includes('not found') || error.message.includes('No active devices') ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to send notification to user'
      });
    }
  }
}

module.exports = new NotificationController();

