const rabbitmq = require('../config/rabbitmq');
const fcmService = require('../services/fcmService');

class FcmConsumer {
  constructor() {
    this.isConsuming = false;
  }

  /**
   * Start consuming messages from fcm-queue
   */
  async start() {
    if (this.isConsuming) {
      console.log('FCM consumer is already running');
      return;
    }

    try {
      console.log('Starting FCM consumer...');

      // Setup queue and start consuming
      await rabbitmq.consumeQueue('notification.fcm', async (message) => {
        await this.handleFcmMessage(message);
      });

      this.isConsuming = true;
      console.log('FCM consumer started and listening to fcm-queue');
    } catch (error) {
      console.error('Error starting FCM consumer:', error);
      throw error;
    }
  }

  /**
   * Handle FCM message from queue
   * @param {Object} message - Message from queue
   */
  async handleFcmMessage(message) {
    try {
      console.log('Processing FCM message:', message);

      // Validate message structure
      if (!message.deviceToken) {
        throw new Error('Device token is missing from message');
      }
      if (!message.title || !message.body) {
        throw new Error('Title and body are required in message');
      }

      // Prepare notification data
      const notificationData = {
        deviceToken: message.deviceToken,
        title: message.title,
        body: message.body,
        data: message.data || {},
        priority: message.priority || 'normal',
        deviceId: message.deviceId
      };

      // Send notification via FCM service
      const result = await fcmService.sendNotification(notificationData);

      console.log('FCM notification sent successfully:', {
        deviceToken: message.deviceToken,
        deviceId: message.deviceId,
        messageId: result.messageId
      });

      return result;
    } catch (error) {
      console.error('Error handling FCM message:', error);
      // Message will be nacked (not acknowledged) and can be retried or moved to DLQ
      throw error;
    }
  }

  /**
   * Stop consuming messages
   */
  async stop() {
    this.isConsuming = false;
    console.log('FCM consumer stopped');
  }
}

module.exports = new FcmConsumer();

