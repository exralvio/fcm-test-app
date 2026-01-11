const { FcmJob } = require('../models');

class FcmJobService {
  /**
   * Create a new FCM job record
   * @param {Object} jobData - FCM job data
   * @param {number} jobData.deviceId - Device ID
   * @param {string} jobData.identifier - Job identifier
   * @param {string} jobData.messageId - FCM message ID
   * @param {Date} jobData.deliverAt - Delivery time (optional)
   * @returns {Promise<Object>} Created FCM job
   */
  async createFcmJob(jobData) {
    try {
      const { deviceId, identifier, messageId, deliverAt } = jobData;

      // Validate required fields
      if (!deviceId) {
        throw new Error('Device ID is required');
      }

      // Create FCM job record
      const fcmJob = await FcmJob.create({
        deviceId,
        identifier: identifier || null,
        messageId: messageId || null,
        deliverAt: deliverAt || new Date(),
      });

      return fcmJob;
    } catch (error) {
      console.error('Error creating FCM job:', error);
      throw error;
    }
  }
}

module.exports = new FcmJobService();
