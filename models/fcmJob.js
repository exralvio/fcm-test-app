'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FcmJob extends Model {
    static associate(models) {
      // Define associations here
      FcmJob.belongsTo(models.Device, {
        foreignKey: 'deviceId',
        as: 'device'
      });
    }
  }
  
  FcmJob.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    deviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to devices table'
    },
    identifier: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: [0, 255]
      },
      comment: 'Job identifier'
    },
    messageId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: [0, 255]
      },
      comment: 'FCM message ID'
    },
    deliverAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Scheduled delivery time'
    }
  }, {
    sequelize,
    modelName: 'FcmJob',
    tableName: 'fcm_jobs',
    indexes: [
      { fields: ['deviceId'] },
      { fields: ['deliverAt'] },
      { fields: ['messageId'] }
    ]
  });
  
  return FcmJob;
};

