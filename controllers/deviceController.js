const deviceService = require('../services/deviceService');

class DeviceController {
  /**
   * Register a device for a user
   * POST /devices/register
   */
  async registerDevice(req, res) {
    try {
      const { userId, deviceToken, deviceId, platform, appVersion, osVersion, deviceModel } = req.body;

      // Validate required fields
      if (!userId || !deviceToken) {
        return res.status(400).json({
          success: false,
          error: 'UserId and deviceToken are required'
        });
      }

      const device = await deviceService.registerDevice({
        userId,
        deviceToken,
        deviceId,
        platform,
        appVersion,
        osVersion,
        deviceModel
      });

      return res.status(201).json({
        success: true,
        message: 'Device registered successfully',
        data: device
      });
    } catch (error) {
      console.error('Error in registerDevice controller:', error);
      const statusCode = error.message.includes('not found') ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to register device'
      });
    }
  }

  /**
   * Create a new device
   * POST /devices
   */
  async createDevice(req, res) {
    try {
      const { userId, deviceToken, deviceId, platform, appVersion, osVersion, deviceModel, isActive } = req.body;

      // Validate required fields
      if (!userId || !deviceToken) {
        return res.status(400).json({
          success: false,
          error: 'UserId and deviceToken are required'
        });
      }

      const device = await deviceService.createDevice({
        userId,
        deviceToken,
        deviceId,
        platform,
        appVersion,
        osVersion,
        deviceModel,
        isActive
      });

      return res.status(201).json({
        success: true,
        message: 'Device created successfully',
        data: device
      });
    } catch (error) {
      console.error('Error in createDevice controller:', error);
      const statusCode = error.message.includes('not found') || error.message.includes('already exists') ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to create device'
      });
    }
  }

  /**
   * Get all devices
   * GET /devices
   */
  async getAllDevices(req, res) {
    try {
      const { limit, offset, userId, platform, isActive, search } = req.query;

      const result = await deviceService.getAllDevices({
        limit,
        offset,
        userId,
        platform,
        isActive,
        search
      });

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in getAllDevices controller:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get devices'
      });
    }
  }

  /**
   * Get device by ID
   * GET /devices/:id
   */
  async getDeviceById(req, res) {
    try {
      const { id } = req.params;

      const device = await deviceService.getDeviceById(id);

      return res.status(200).json({
        success: true,
        data: device
      });
    } catch (error) {
      console.error('Error in getDeviceById controller:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to get device'
      });
    }
  }

  /**
   * Update device by ID
   * PUT /devices/:id
   */
  async updateDevice(req, res) {
    try {
      const { id } = req.params;
      const { userId, deviceToken, deviceId, platform, appVersion, osVersion, deviceModel, isActive } = req.body;

      const device = await deviceService.updateDevice(id, {
        userId,
        deviceToken,
        deviceId,
        platform,
        appVersion,
        osVersion,
        deviceModel,
        isActive
      });

      return res.status(200).json({
        success: true,
        message: 'Device updated successfully',
        data: device
      });
    } catch (error) {
      console.error('Error in updateDevice controller:', error);
      const statusCode = error.message.includes('not found') || error.message.includes('already exists') ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to update device'
      });
    }
  }

  /**
   * Delete device by ID
   * DELETE /devices/:id
   */
  async deleteDevice(req, res) {
    try {
      const { id } = req.params;

      await deviceService.deleteDevice(id);

      return res.status(200).json({
        success: true,
        message: 'Device deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteDevice controller:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to delete device'
      });
    }
  }

  /**
   * Get devices by user ID
   * GET /devices/user/:userId
   */
  async getDevicesByUserId(req, res) {
    try {
      const { userId } = req.params;

      const devices = await deviceService.getDevicesByUserId(userId);

      return res.status(200).json({
        success: true,
        data: {
          devices,
          total: devices.length
        }
      });
    } catch (error) {
      console.error('Error in getDevicesByUserId controller:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to get devices'
      });
    }
  }
}

module.exports = new DeviceController();

