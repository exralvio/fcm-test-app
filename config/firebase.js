const admin = require('firebase-admin');
const config = require('./config');
const path = require('path');
const fs = require('fs');

class FirebaseConnection {
  constructor() {
    this.app = null;
    this.messaging = null;
  }

  initialize() {
    try {
      if (!this.app) {
        const credentialPath = path.resolve(config.firebase.credentialPath);
        
        if (!fs.existsSync(credentialPath)) {
          throw new Error(`Firebase credential file not found at: ${credentialPath}`);
        }

        const serviceAccount = require(credentialPath);

        this.app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: config.firebase.projectId || serviceAccount.project_id,
          databaseURL: config.firebase.databaseURL
        });

        this.messaging = admin.messaging();
        console.log('Firebase Admin initialized successfully');
      }

      return this.app;
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw error;
    }
  }

  getMessaging() {
    if (!this.app) {
      this.initialize();
    }
    return this.messaging;
  }

  getAuth() {
    if (!this.app) {
      this.initialize();
    }
    return admin.auth();
  }

  /**
   * Create a custom token for Firebase Authentication
   * @param {string} uid - User ID for the custom token
   * @param {Object} additionalClaims - Additional custom claims to include in the token
   * @returns {Promise<string>} Custom token
   */
  async createCustomToken(uid, additionalClaims = {}) {
    try {
      const auth = this.getAuth();
      const customToken = await auth.createCustomToken(uid, additionalClaims);
      return customToken;
    } catch (error) {
      console.error('Error creating custom token:', error);
      throw error;
    }
  }

  async sendNotification(deviceToken, notification, data = {}) {
    try {
      const messaging = this.getMessaging();
      
      const message = {
        token: deviceToken,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {})
      };

      const response = await messaging.send(message);
      console.log('Notification sent successfully:', response);
      return response;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  async sendMulticastNotification(deviceTokens, notification, data = {}) {
    try {
      const messaging = this.getMessaging();
      
      const message = {
        tokens: deviceTokens,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {})
      };

      const response = await messaging.sendMulticast(message);
      console.log(`Notifications sent: ${response.successCount} successful, ${response.failureCount} failed`);
      return response;
    } catch (error) {
      console.error('Error sending multicast notification:', error);
      throw error;
    }
  }

  async sendTopicNotification(topic, notification, data = {}) {
    try {
      const messaging = this.getMessaging();
      
      const message = {
        topic: topic,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {})
      };

      const response = await messaging.send(message);
      console.log(`Notification sent to topic '${topic}' successfully`);
      return response;
    } catch (error) {
      console.error('Error sending topic notification:', error);
      throw error;
    }
  }

  async subscribeToTopic(deviceTokens, topic) {
    try {
      const messaging = this.getMessaging();
      const response = await messaging.subscribeToTopic(deviceTokens, topic);
      console.log(`Subscribed ${response.successCount} devices to topic '${topic}'`);
      return response;
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      throw error;
    }
  }

  async unsubscribeFromTopic(deviceTokens, topic) {
    try {
      const messaging = this.getMessaging();
      const response = await messaging.unsubscribeFromTopic(deviceTokens, topic);
      console.log(`Unsubscribed ${response.successCount} devices from topic '${topic}'`);
      return response;
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      throw error;
    }
  }
}

module.exports = new FirebaseConnection();

