const mysql = require('./config/mysql');
const rabbitmq = require('./config/rabbitmq');
const fcmConsumer = require('./consumers/fcmConsumer');

// Start FCM consumer
async function startConsumer() {
  try {
    // Test database connection (consumer may need it for notification processing)
    const connectionSuccessful = await mysql.testConnection();
    if (!connectionSuccessful) {
      throw new Error('Database connection test failed');
    }
    console.log('Database connection successful');

    // Start FCM consumer
    await fcmConsumer.start();
    console.log('FCM consumer started and ready to process messages');
  } catch (error) {
    console.error('Error starting FCM consumer:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: stopping FCM consumer');
  await fcmConsumer.stop();
  await rabbitmq.close();
  await mysql.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: stopping FCM consumer');
  await fcmConsumer.stop();
  await rabbitmq.close();
  await mysql.close();
  process.exit(0);
});

startConsumer();

