const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Imbee Test App API Documentation'
}));

// Routes
const userRoutes = require('./routes/userRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/', userRoutes);
app.use('/', deviceRoutes);
app.use('/', notificationRoutes);

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
      console.log(`Swagger documentation: http://localhost:${PORT}/api-docs`);
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

