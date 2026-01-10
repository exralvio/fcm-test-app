'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'User who should receive the notification'
      },
      deviceId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'devices',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Reference to specific device (if sending to one device)'
      },
      deviceToken: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'FCM token used for sending (stored for history)'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Notification title'
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Notification body/message'
      },
      data: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'Additional data payload for notification'
      },
      notificationType: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: 'general',
        comment: 'Type of notification (e.g., order, message, alert, system)'
      },
      status: {
        type: Sequelize.ENUM('pending', 'sent', 'failed', 'invalid_token'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Notification delivery status'
      },
      fcmMessageId: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'FCM message ID from Firebase response'
      },
      fcmErrorCode: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'FCM error code if delivery failed'
      },
      fcmErrorMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'FCM error message if delivery failed'
      },
      sentAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp when notification was sent'
      },
      deliveredAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp when notification was delivered (if tracked)'
      },
      readAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp when notification was read by user'
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
    await queryInterface.addIndex('notifications', ['userId'], {
      name: 'idx_notifications_user_id'
    });
    await queryInterface.addIndex('notifications', ['deviceId'], {
      name: 'idx_notifications_device_id'
    });
    await queryInterface.addIndex('notifications', ['status'], {
      name: 'idx_notifications_status'
    });
    await queryInterface.addIndex('notifications', ['notificationType'], {
      name: 'idx_notifications_type'
    });
    await queryInterface.addIndex('notifications', ['createdAt'], {
      name: 'idx_notifications_created_at'
    });
    await queryInterface.addIndex('notifications', ['readAt'], {
      name: 'idx_notifications_read_at'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notifications');
  }
};
