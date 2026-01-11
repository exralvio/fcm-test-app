const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Imbee Test App API',
      version: '1.0.0',
      description: 'API documentation for Imbee Test App - FCM Notification System with Users and Devices management',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.example.com',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Users',
        description: 'User management endpoints'
      },
      {
        name: 'Devices',
        description: 'Device management endpoints'
      },
      {
        name: 'Health',
        description: 'Health check endpoints'
      },
      {
        name: 'Auth',
        description: 'Authentication endpoints'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /auth/login endpoint'
        }
      }
    }
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './index.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;