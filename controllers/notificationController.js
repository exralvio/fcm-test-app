const notificationService = require('../services/notificationService');
const fcmJobService = require('../services/fcmJobService');

class NotificationController {
  /**
   * Send FCM notification to all devices
   * POST /send-notifications
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
   * Get all FCM jobs
   * GET /fcm-jobs
   */
  async getAllFcmJobs(req, res) {
    try {
      const { deviceId, includeDevice } = req.query;

      const result = await fcmJobService.getAllFcmJobs({
        deviceId: deviceId ? parseInt(deviceId) : undefined,
        includeDevice: includeDevice !== 'false'
      });

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in getAllFcmJobs controller:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get FCM jobs'
      });
    }
  }

}

module.exports = new NotificationController();

