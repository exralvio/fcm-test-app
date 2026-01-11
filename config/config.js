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
    databaseURL: process.env.FIREBASE_DATABASE_URL || ''
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  }
};

