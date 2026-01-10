'use strict';
const { Model, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      // Define associations here
      Notification.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      Notification.belongsTo(models.Device, {
        foreignKey: 'deviceId',
        as: 'device'
      });
    }

    // Instance method to mark as read
    markAsRead() {
      this.readAt = new Date();
      return this.save();
    }

    // Instance method to mark as sent
    markAsSent(fcmMessageId) {
      this.status = 'sent';
      this.fcmMessageId = fcmMessageId;
      this.sentAt = new Date();
      return this.save();
    }

    // Instance method to mark as failed
    markAsFailed(errorCode, errorMessage) {
      this.status = 'failed';
      this.fcmErrorCode = errorCode;
      this.fcmErrorMessage = errorMessage;
      if (errorCode === 'messaging/invalid-registration-token' || 
          errorCode === 'messaging/registration-token-not-registered') {
        this.status = 'invalid_token';
      }
      return this.save();
    }
  }
  
  Notification.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who should receive the notification'
    },
    deviceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'devices',
        key: 'id'
      },
      comment: 'Reference to specific device (if sending to one device)'
    },
    deviceToken: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 500]
      },
      comment: 'FCM token used for sending (stored for history)'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: 'Additional data payload for notification'
    },
    notificationType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'general',
      validate: {
        len: [0, 100]
      },
      comment: 'Type of notification (e.g., order, message, alert, system)'
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'failed', 'invalid_token'),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'sent', 'failed', 'invalid_token']]
      }
    },
    fcmMessageId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: [0, 255]
      }
    },
    fcmErrorCode: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    fcmErrorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    indexes: [
      { fields: ['userId'] },
      { fields: ['deviceId'] },
      { fields: ['status'] },
      { fields: ['notificationType'] },
      { fields: ['createdAt'] },
      { fields: ['readAt'] }
    ],
    defaultScope: {
      order: [['createdAt', 'DESC']]
    },
    scopes: {
      unread: {
        where: {
          readAt: null
        }
      },
      read: {
        where: {
          readAt: {
            [Op.ne]: null
          }
        }
      },
      pending: {
        where: {
          status: 'pending'
        }
      },
      sent: {
        where: {
          status: 'sent'
        }
      },
      failed: {
        where: {
          status: 'failed'
        }
      }
    }
  });
  
  return Notification;
};

