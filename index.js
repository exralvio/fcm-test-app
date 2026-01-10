const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Express API' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const deviceRoutes = require('./routes/deviceRoutes');

app.use('/', notificationRoutes);
app.use('/', userRoutes);
app.use('/', deviceRoutes);

// Initialize database connection
const mysql = require('./config/mysql');
const fcmConsumer = require('./consumers/fcmConsumer');

// Start server and initialize services
async function startServer() {
  try {
    // Test database connection
    await mysql.testConnection();
    console.log('Database connection successful');

    // Start FCM consumer
    await fcmConsumer.start();
    console.log('FCM consumer started');

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`API endpoint: POST http://localhost:${PORT}/create-notification`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server and connections');
  await fcmConsumer.stop();
  await mysql.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server and connections');
  await fcmConsumer.stop();
  await mysql.close();
  process.exit(0);
});

startServer();

