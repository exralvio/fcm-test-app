require('dotenv').config();

module.exports = {
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'imbee_test',
    port: process.env.MYSQL_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost',
    exchange: process.env.RABBITMQ_EXCHANGE || 'imbee_exchange',
    queue: process.env.RABBITMQ_QUEUE || 'imbee_queue',
    options: {
      durable: true,
      noAck: false
    }
  },
  firebase: {
    credentialPath: process.env.FIREBASE_CREDENTIAL_PATH || './config/firebase-service-account.json',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    databaseURL: process.env.FIREBASE_DATABASE_URL || '',
    web: {
      apiKey: process.env.FIREBASE_WEB_API_KEY || '',
      authDomain: process.env.FIREBASE_WEB_AUTH_DOMAIN || '',
      databaseURL: process.env.FIREBASE_WEB_DATABASE_URL || '',
      projectId: process.env.FIREBASE_WEB_PROJECT_ID || '',
      storageBucket: process.env.FIREBASE_WEB_STORAGE_BUCKET || '',
      messagingSenderId: process.env.FIREBASE_WEB_MESSAGING_SENDER_ID || '',
      appId: process.env.FIREBASE_WEB_APP_ID || '',
      measurementId: process.env.FIREBASE_WEB_MEASUREMENT_ID || ''
    },
    vapidKey: process.env.FIREBASE_WEB_VAPID_KEY || ''
  }
};

