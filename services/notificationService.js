const { User, Device, Notification } = require('../models');
const rabbitmq = require('../config/rabbitmq');

class NotificationService {
  /**
   * Create notification and add to FCM queue
   * @param {Object} data - Notification data
   * @param {string} data.message - Message body
   * @param {string} data.title - Notification title
   * @param {number} data.userId - User ID
   * @param {number} [data.deviceId] - Optional specific device ID
   * @param {Object} [data.data] - Additional data payload
   * @param {string} [data.notificationType] - Type of notification
   * @returns {Promise<Object>} Created notification
   */
  async createNotification(data) {
    try {
      const { message, title, userId, deviceId, data: notificationData, notificationType } = data;

      // Validate user exists
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // Get device token(s)
      let device = null;
      let deviceToken = null;

      if (deviceId) {
        // Use specific device
        device = await Device.findOne({
          where: {
            id: deviceId,
            userId: userId,
            isActive: true
          }
        });

        if (!device) {
          throw new Error(`Active device with ID ${deviceId} not found for user ${userId}`);
        }

        deviceToken = device.deviceToken;
      } else {
        // Get first active device for user
        device = await Device.findOne({
          where: {
            userId: userId,
            isActive: true
          },
          order: [['lastActiveAt', 'DESC'], ['createdAt', 'DESC']]
        });

        if (!device) {
          throw new Error(`No active device found for user ${userId}`);
        }

        deviceToken = device.deviceToken;
      }

      // Create notification record with pending status
      const notification = await Notification.create({
        userId: userId,
        deviceId: device.id,
        deviceToken: deviceToken,
        title: title || 'Notification',
        body: message,
        data: notificationData || {},
        notificationType: notificationType || 'general',
        status: 'pending'
      });

      // Add message to RabbitMQ queue
      await this.addToFcmQueue({
        notificationId: notification.id,
        userId: userId,
        deviceId: device.id,
        deviceToken: deviceToken,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        notificationType: notification.notificationType
      });

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Add notification to FCM queue
   * @param {Object} notificationData - Notification data to queue
   * @returns {Promise<void>}
   */
  async addToFcmQueue(notificationData) {
    try {
      await rabbitmq.publishMessage('fcm-queue', notificationData);
      console.log('Notification added to FCM queue:', notificationData.notificationId);
    } catch (error) {
      console.error('Error adding notification to FCM queue:', error);
      throw error;
    }
  }

  /**
   * Process FCM notification from queue
   * @param {Object} notificationData - Notification data from queue
   * @returns {Promise<Object>} Updated notification
   */
  async processFcmNotification(notificationData) {
    try {
      const {
        notificationId,
        userId,
        deviceId,
        deviceToken,
        title,
        body,
        data: notificationDataPayload,
        notificationType
      } = notificationData;

      // Get notification record
      const notification = await Notification.findByPk(notificationId);
      if (!notification) {
        throw new Error(`Notification with ID ${notificationId} not found`);
      }

      // Import firebase here to avoid circular dependency issues
      const firebase = require('../config/firebase');

      try {
        // Send notification via FCM
        const fcmResponse = await firebase.sendNotification(
          deviceToken,
          { title, body },
          notificationDataPayload || {}
        );

        // Update notification as sent
        notification.status = 'sent';
        notification.fcmMessageId = fcmResponse;
        notification.sentAt = new Date();
        await notification.save();

        console.log('FCM notification sent successfully:', notificationId);

        // Publish to notification-done topic
        await this.publishNotificationDone({
          notificationId: notification.id,
          userId: notification.userId,
          deviceId: notification.deviceId,
          status: 'sent',
          fcmMessageId: fcmResponse,
          sentAt: notification.sentAt
        });

        return notification;
      } catch (fcmError) {
        // Handle FCM errors
        console.error('FCM error:', fcmError);

        // Check if token is invalid
        const isInvalidToken = 
          fcmError.code === 'messaging/invalid-registration-token' ||
          fcmError.code === 'messaging/registration-token-not-registered';

        // Update notification as failed
        notification.status = isInvalidToken ? 'invalid_token' : 'failed';
        notification.fcmErrorCode = fcmError.code || 'unknown';
        notification.fcmErrorMessage = fcmError.message || 'Unknown error';
        await notification.save();

        // Deactivate device if token is invalid
        if (isInvalidToken && deviceId) {
          await Device.update(
            { isActive: false },
            { where: { id: deviceId } }
          );
          console.log('Device deactivated due to invalid token:', deviceId);
        }

        // Still publish to notification-done topic even on failure
        await this.publishNotificationDone({
          notificationId: notification.id,
          userId: notification.userId,
          deviceId: notification.deviceId,
          status: notification.status,
          fcmErrorCode: notification.fcmErrorCode,
          fcmErrorMessage: notification.fcmErrorMessage
        });

        throw fcmError;
      }
    } catch (error) {
      console.error('Error processing FCM notification:', error);
      throw error;
    }
  }

  /**
   * Publish notification done event to topic
   * @param {Object} eventData - Event data
   * @returns {Promise<void>}
   */
  async publishNotificationDone(eventData) {
    try {
      await rabbitmq.publishToTopic('notification-done', eventData);
      console.log('Published to notification-done topic:', eventData.notificationId);
    } catch (error) {
      console.error('Error publishing to notification-done topic:', error);
      // Don't throw - this is not critical
    }
  }
}

module.exports = new NotificationService();

