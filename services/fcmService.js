const firebase = require('../config/firebase');
const { Device } = require('../models');

class FcmService {
  /**
   * Send FCM notification to a single device
   * @param {Object} notificationData - Notification data
   * @param {string} notificationData.deviceToken - FCM device token
   * @param {string} notificationData.title - Notification title
   * @param {string} notificationData.body - Notification body
   * @param {Object} notificationData.data - Additional data payload
   * @param {string} notificationData.priority - Notification priority (normal/high)
   * @param {number} notificationData.deviceId - Device ID (optional, for updating status)
   * @returns {Promise<Object>} Send result
   */
  async sendNotification(notificationData) {
    try {
      const { deviceToken, title, body, data = {}, priority = 'normal', deviceId } = notificationData;

      // Validate required fields
      if (!deviceToken) {
        throw new Error('Device token is required');
      }
      if (!title || !body) {
        throw new Error('Title and body are required');
      }

      // Prepare notification object
      const notification = {
        title,
        body
      };

      // Send notification via Firebase
      const response = await firebase.sendNotification(deviceToken, notification, data);

      // Update device last active time if deviceId is provided
      if (deviceId) {
        try {
          const device = await Device.findByPk(deviceId);
          if (device) {
            device.lastActiveAt = new Date();
            await device.save();
          }
        } catch (error) {
          // Log but don't fail the notification send
          console.error('Error updating device last active time:', error);
        }
      }

      return {
        success: true,
        messageId: response,
        deviceToken,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      // Handle FCM errors
      if (error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered') {
        // Token is invalid
        throw new Error(`Invalid device token: ${error.message}`);
      }

      console.error('Error sending FCM notification:', error);
      throw error;
    }
  }

  /**
   * Send FCM notification to multiple devices
   * @param {Array<string>} deviceTokens - Array of FCM device tokens
   * @param {Object} notification - Notification object with title and body
   * @param {Object} data - Additional data payload
   * @returns {Promise<Object>} Multicast send result
   */
  async sendMulticastNotification(deviceTokens, notification, data = {}) {
    try {
      if (!Array.isArray(deviceTokens) || deviceTokens.length === 0) {
        throw new Error('Device tokens array is required and must not be empty');
      }

      const response = await firebase.sendMulticastNotification(deviceTokens, notification, data);

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error sending multicast FCM notification:', error);
      throw error;
    }
  }

  /**
   * Send FCM notification to a topic
   * @param {string} topic - Topic name
   * @param {Object} notification - Notification object with title and body
   * @param {Object} data - Additional data payload
   * @returns {Promise<Object>} Send result
   */
  async sendTopicNotification(topic, notification, data = {}) {
    try {
      if (!topic) {
        throw new Error('Topic is required');
      }

      const response = await firebase.sendTopicNotification(topic, notification, data);

      return {
        success: true,
        messageId: response,
        topic,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error sending topic FCM notification:', error);
      throw error;
    }
  }
}

module.exports = new FcmService();

