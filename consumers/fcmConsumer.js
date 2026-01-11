const rabbitmq = require('../config/rabbitmq');

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
      // Notification processing removed - notifications table has been removed
      console.log('FCM message received (processing disabled)');
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

