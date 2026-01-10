'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Device extends Model {
    static associate(models) {
      // Define associations here
      Device.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      Device.hasMany(models.Notification, {
        foreignKey: 'deviceId',
        as: 'notifications'
      });
    }
  }
  
  Device.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      comment: 'User who owns this device'
    },
    deviceToken: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 500]
      },
      comment: 'FCM registration token'
    },
    deviceId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Device unique identifier (e.g., UUID from mobile app)'
    },
    platform: {
      type: DataTypes.ENUM('ios', 'android', 'web'),
      allowNull: false,
      defaultValue: 'android',
      validate: {
        isIn: [['ios', 'android', 'web']]
      },
      comment: 'Platform type'
    },
    appVersion: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [0, 50]
      }
    },
    osVersion: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [0, 50]
      }
    },
    deviceModel: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: [0, 255]
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    lastActiveAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Device',
    tableName: 'Devices',
    indexes: [
      { fields: ['userId'] },
      { fields: ['deviceToken'], unique: true },
      { fields: ['isActive'] },
      { fields: ['platform'] }
    ]
  });
  
  return Device;
};

