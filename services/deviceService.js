const { Device } = require('../models');

class DeviceService {
  /**
   * Register a device
   * @param {Object} deviceData - Device data
   * @returns {Promise<Object>} Created or updated device
   */
  async registerDevice(deviceData) {
    try {
      const { deviceToken, deviceId, platform, appVersion, osVersion, deviceModel } = deviceData;

      // Check if device with this token already exists
      let device = await Device.findOne({ where: { deviceToken } });

      if (device) {
        // Update existing device
        if (deviceId !== undefined) device.deviceId = deviceId;
        if (platform !== undefined) device.platform = platform;
        if (appVersion !== undefined) device.appVersion = appVersion;
        if (osVersion !== undefined) device.osVersion = osVersion;
        if (deviceModel !== undefined) device.deviceModel = deviceModel;
        device.isActive = true;
        device.lastActiveAt = new Date();
        await device.save();
        return device;
      } else {
        // Create new device
        device = await Device.create({
          deviceToken,
          deviceId,
          platform: platform || 'android',
          appVersion,
          osVersion,
          deviceModel,
          isActive: true,
          lastActiveAt: new Date()
        });
        return device;
      }
    } catch (error) {
      console.error('Error registering device:', error);
      throw error;
    }
  }

  /**
   * Create a new device
   * @param {Object} deviceData - Device data
   * @returns {Promise<Object>} Created device
   */
  async createDevice(deviceData) {
    try {
      const { deviceToken, deviceId, platform, appVersion, osVersion, deviceModel, isActive } = deviceData;

      // Check if device token already exists
      const existingDevice = await Device.findOne({ where: { deviceToken } });
      if (existingDevice) {
        throw new Error('Device with this token already exists');
      }

      const device = await Device.create({
        deviceToken,
        deviceId,
        platform: platform || 'android',
        appVersion,
        osVersion,
        deviceModel,
        isActive: isActive !== undefined ? isActive : true,
        lastActiveAt: new Date()
      });

      return device;
    } catch (error) {
      console.error('Error creating device:', error);
      throw error;
    }
  }

  /**
   * Get all devices with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Devices list with pagination
   */
  async getAllDevices(options = {}) {
    try {
      const { limit = 50, offset = 0, platform, isActive, search } = options;

      const where = {};
      if (platform) {
        where.platform = platform;
      }
      if (isActive !== undefined) {
        where.isActive = isActive === 'true' || isActive === true;
      }

      if (search) {
        const { Op } = require('sequelize');
        where[Op.or] = [
          { deviceToken: { [Op.like]: `%${search}%` } },
          { deviceId: { [Op.like]: `%${search}%` } },
          { deviceModel: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await Device.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      return {
        devices: rows,
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };
    } catch (error) {
      console.error('Error getting all devices:', error);
      throw error;
    }
  }

  /**
   * Get device by ID
   * @param {number} deviceId - Device ID
   * @returns {Promise<Object>} Device object
   */
  async getDeviceById(deviceId) {
    try {
      const device = await Device.findByPk(deviceId);

      if (!device) {
        throw new Error(`Device with ID ${deviceId} not found`);
      }

      return device;
    } catch (error) {
      console.error('Error getting device by ID:', error);
      throw error;
    }
  }

  /**
   * Update device by ID
   * @param {number} deviceId - Device ID
   * @param {Object} deviceData - Updated device data
   * @returns {Promise<Object>} Updated device
   */
  async updateDevice(deviceId, deviceData) {
    try {
      const device = await Device.findByPk(deviceId);
      if (!device) {
        throw new Error(`Device with ID ${deviceId} not found`);
      }

      const { deviceToken, deviceId: newDeviceId, platform, appVersion, osVersion, deviceModel, isActive } = deviceData;

      // Check if device token is being changed and already exists
      if (deviceToken && deviceToken !== device.deviceToken) {
        const existingDevice = await Device.findOne({ where: { deviceToken } });
        if (existingDevice) {
          throw new Error('Device with this token already exists');
        }
      }

      // Update fields
      if (deviceToken !== undefined) device.deviceToken = deviceToken;
      if (newDeviceId !== undefined) device.deviceId = newDeviceId;
      if (platform !== undefined) device.platform = platform;
      if (appVersion !== undefined) device.appVersion = appVersion;
      if (osVersion !== undefined) device.osVersion = osVersion;
      if (deviceModel !== undefined) device.deviceModel = deviceModel;
      if (isActive !== undefined) device.isActive = isActive;
      if (isActive === true) {
        device.lastActiveAt = new Date();
      }

      await device.save();

      return device;
    } catch (error) {
      console.error('Error updating device:', error);
      throw error;
    }
  }

  /**
   * Delete device by ID
   * @param {number} deviceId - Device ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteDevice(deviceId) {
    try {
      const device = await Device.findByPk(deviceId);
      if (!device) {
        throw new Error(`Device with ID ${deviceId} not found`);
      }

      await device.destroy();
      return true;
    } catch (error) {
      console.error('Error deleting device:', error);
      throw error;
    }
  }

}

module.exports = new DeviceService();

