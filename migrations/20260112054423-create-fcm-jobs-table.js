'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('fcm_jobs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      deviceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Reference to devices table'
      },
      identifier: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Job identifier'
      },
      messageId: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'FCM message ID'
      },
      deliverAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Scheduled delivery time'
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
    await queryInterface.addIndex('fcm_jobs', ['deviceId'], {
      name: 'idx_fcm_jobs_deviceId'
    });
    await queryInterface.addIndex('fcm_jobs', ['deliverAt'], {
      name: 'idx_fcm_jobs_deliverAt'
    });
    await queryInterface.addIndex('fcm_jobs', ['messageId'], {
      name: 'idx_fcm_jobs_messageId'
    });

    // Add foreign key constraint
    await queryInterface.addConstraint('fcm_jobs', {
      fields: ['deviceId'],
      type: 'foreign key',
      name: 'fk_fcm_jobs_deviceId',
      references: {
        table: 'devices',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('fcm_jobs');
  }
};

