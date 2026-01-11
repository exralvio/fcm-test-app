const rabbitmq = require('../config/rabbitmq');
const { Device } = require('../models');

class NotificationService {
  /**
   * Send FCM notification to all active devices in the system
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Published message details
   */
  async sendToAllDevices(notificationData) {
    try {
      const { title, body, data, priority } = notificationData;

      // Validate required fields
      if (!title || !body) {
        throw new Error('Title and body are required');
      }

      // Get all active devices
      const devices = await Device.findAll({
        where: {
          isActive: true
        }
      });

      if (devices.length === 0) {
        throw new Error('No active devices found in the system');
      }

      // Publish notification for each device
      const results = [];
      for (const device of devices) {
        const message = {
          deviceId: device.id,
          deviceToken: device.deviceToken,
          title,
          body,
          data: data || {},
          priority: priority || 'normal',
          timestamp: new Date().toISOString()
        };

        await rabbitmq.publishMessage('notification.fcm', message);
        results.push({
          deviceId: device.id,
          deviceToken: device.deviceToken,
          platform: device.platform
        });
      }

      return {
        success: true,
        message: `Notification queued successfully to ${results.length} device(s)`,
        data: {
          title,
          body,
          totalDevices: results.length,
          devices: results,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error sending notification to all devices:', error);
      throw error;
    }
  }

}

module.exports = new NotificationService();
