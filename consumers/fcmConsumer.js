const rabbitmq = require('../config/rabbitmq');
const fcmService = require('../services/fcmService');
const fcmJobService = require('../services/fcmJobService');

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
        deviceId: message.deviceId,
      };

      // Send notification via FCM service
      const result = await fcmService.sendNotification(notificationData);

      // Insert FCM job record after successful delivery
      if (message.deviceId && result.messageId) {
        const jobData = {
          deviceId: message.deviceId,
          identifier: message.identifier || null,
          messageId: result.messageId,
          deliverAt: new Date(),
        };

        // Create FCM job record
        await this.handleFcmJobCreation(jobData);

        // Publish message to 'notification.done' topic
        await this.publishNotificationDone(jobData);
      } else {
        console.error('Failed to send FCM notification:', result);
      }

      return result;
    } catch (error) {
      console.error('Error handling FCM message:', error);
      // Message will be nacked (not acknowledged) and can be retried or moved to DLQ
      throw error;
    }
  }

  /**
   * Handle FCM job creation and publish to notification.done topic
   * @param {Object} message - Original message from queue
   * @param {Object} result - FCM send result
   */
  async handleFcmJobCreation(jobData) {
    try {
      const fcmJob = await fcmJobService.createFcmJob(jobData);
      console.log('FCM job record created successfully:', fcmJob);
    } catch (error) {
      // Log but don't fail the notification send
      console.error('Error creating FCM job record:', error);
    }
  }

  /**
   * Publish message to 'notification.done' topic with fcm_jobs data
   * @param {Object} jobData - FCM job data
   */
  async publishNotificationDone(jobData) {
    try {
      const publishData = {
        deviceId: jobData.deviceId,
        identifier: jobData.identifier,
        messageId: jobData.messageId,
        deliverAt: jobData.deliverAt ? jobData.deliverAt.toISOString() : null,
      };
      await rabbitmq.publishToTopic('notification.done', publishData);
      console.log('Message published to notification.done topic:', publishData);
    } catch (error) {
      // Log but don't fail the process
      console.error('Error publishing to notification.done topic:', error);
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
