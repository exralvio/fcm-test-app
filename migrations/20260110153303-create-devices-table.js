'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('devices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      deviceToken: {
        type: Sequelize.STRING(500),
        allowNull: false,
        unique: true,
        comment: 'FCM registration token'
      },
      deviceId: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Device unique identifier (e.g., UUID from mobile app)'
      },
      platform: {
        type: Sequelize.ENUM('ios', 'android', 'web'),
        allowNull: false,
        defaultValue: 'android',
        comment: 'Platform type'
      },
      appVersion: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'App version installed on device'
      },
      osVersion: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Operating system version'
      },
      deviceModel: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Device model (e.g., iPhone 13, Samsung Galaxy S21)'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this device is currently active'
      },
      lastActiveAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Last time device was active'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('devices', ['deviceToken'], {
      name: 'idx_devices_token',
      unique: true
    });
    await queryInterface.addIndex('devices', ['isActive'], {
      name: 'idx_devices_active'
    });
    await queryInterface.addIndex('devices', ['platform'], {
      name: 'idx_devices_platform'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('devices');
  }
};
