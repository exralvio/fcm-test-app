const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Imbee Test App API Documentation'
}));

// Routes
const deviceRoutes = require('./routes/deviceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/', deviceRoutes);
app.use('/', notificationRoutes);

// Initialize database connection
const mysql = require('./config/mysql');

// Start server
async function startServer() {
  try {
    // Test database connection
    const connectionSuccessful = await mysql.testConnection();
    if (!connectionSuccessful) {
      throw new Error('Database connection test failed');
    }
    console.log('Database connection successful');

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`API Server is running on http://localhost:${PORT}`);
      console.log(`Swagger documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Error starting API server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server and connections');
  await mysql.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server and connections');
  await mysql.close();
  process.exit(0);
});

startServer();

