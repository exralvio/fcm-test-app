const deviceService = require('../services/deviceService');

class DeviceController {
  /**
   * Create a new device
   * POST /devices
   */
  async createDevice(req, res) {
    try {
      const { deviceToken, deviceId, platform, appVersion, osVersion, deviceModel, isActive } = req.body;

      // Validate required fields
      if (!deviceToken) {
        return res.status(400).json({
          success: false,
          error: 'deviceToken is required'
        });
      }

      const device = await deviceService.createDevice({
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
      const { platform, isActive, search } = req.query;

      const result = await deviceService.getAllDevices({
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
      const { deviceToken, deviceId, platform, appVersion, osVersion, deviceModel, isActive } = req.body;

      const device = await deviceService.updateDevice(id, {
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

}

module.exports = new DeviceController();

