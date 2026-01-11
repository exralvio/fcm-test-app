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
        deliverAt: deliverAt || new Date()
      });

      return fcmJob;
    } catch (error) {
      console.error('Error creating FCM job:', error);
      throw error;
    }
  }

  /**
   * Get FCM job by ID
   * @param {number} jobId - FCM job ID
   * @returns {Promise<Object|null>} FCM job or null
   */
  async getFcmJobById(jobId) {
    try {
      const fcmJob = await FcmJob.findByPk(jobId);
      return fcmJob;
    } catch (error) {
      console.error('Error getting FCM job:', error);
      throw error;
    }
  }

  /**
   * Get FCM jobs by device ID
   * @param {number} deviceId - Device ID
   * @param {Object} options - Query options (limit, offset, order)
   * @returns {Promise<Array>} Array of FCM jobs
   */
  async getFcmJobsByDeviceId(deviceId, options = {}) {
    try {
      const { limit, offset, order } = options;
      
      const queryOptions = {
        where: { deviceId },
        order: order || [['createdAt', 'DESC']]
      };

      if (limit) queryOptions.limit = limit;
      if (offset) queryOptions.offset = offset;

      const fcmJobs = await FcmJob.findAll(queryOptions);
      return fcmJobs;
    } catch (error) {
      console.error('Error getting FCM jobs by device ID:', error);
      throw error;
    }
  }

  /**
   * Get FCM job by message ID
   * @param {string} messageId - FCM message ID
   * @returns {Promise<Object|null>} FCM job or null
   */
  async getFcmJobByMessageId(messageId) {
    try {
      const fcmJob = await FcmJob.findOne({
        where: { messageId }
      });
      return fcmJob;
    } catch (error) {
      console.error('Error getting FCM job by message ID:', error);
      throw error;
    }
  }
}

module.exports = new FcmJobService();

