# Imbee Test App

A Node.js Express application for managing devices and sending Firebase Cloud Messaging (FCM) notifications using RabbitMQ for asynchronous message processing.

## Overview

This application provides a RESTful API for device management and notification distribution. It uses RabbitMQ for message queuing to handle notification delivery asynchronously, ensuring scalability and reliability.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Message Queue**: RabbitMQ
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **API Documentation**: Swagger/OpenAPI
- **Process Manager**: PM2

## Project Structure

```
imbee-test/
├── config/                  # Configuration files
│   ├── config.js           # Application configuration
│   ├── firebase.js         # Firebase/FCM setup
│   ├── mysql.js            # MySQL connection
│   ├── rabbitmq.js         # RabbitMQ connection and utilities
│   ├── sequelize.js        # Sequelize ORM configuration
│   ├── swagger.js          # Swagger API documentation setup
│   └── firebase-json/      # Firebase service account credentials
│
├── controllers/            # Request handlers
│   ├── deviceController.js
│   └── notificationController.js
│
├── services/               # Business logic
│   ├── deviceService.js
│   ├── notificationService.js
│   ├── fcmService.js
│   └── fcmJobService.js
│
├── routes/                 # API route definitions
│   ├── deviceRoutes.js
│   └── notificationRoutes.js
│
├── models/                 # Sequelize models
│   ├── device.js
│   ├── fcmJob.js
│   └── index.js
│
├── migrations/             # Database migrations
│   ├── 20260110153303-create-devices-table.js
│   └── 20260112054423-create-fcm-jobs-table.js
│
├── consumers/              # RabbitMQ message consumers
│   └── fcmConsumer.js
│
├── utils/                  # Utility functions
│   └── functions.js
│
├── logs/                   # Application logs
│   ├── api-error.log
│   ├── api-out.log
│   ├── consumer-error.log
│   └── consumer-out.log
│
├── server.js               # API server entry point
├── consumer.js             # Consumer service entry point
├── index.js                # Combined server (API + Consumer)
├── ecosystem.config.js     # PM2 configuration
└── package.json
```

## Application Flow

### 1. Device Management Flow

```
Client Request
    ↓
Routes (deviceRoutes.js)
    ↓
Controller (deviceController.js)
    ↓
Service (deviceService.js)
    ↓
Model (Device)
    ↓
MySQL Database
```

### 2. Notification Flow

#### 2.1 Send Notification Request

```
POST /notifications/all
    ↓
notificationController.sendToAllDevices()
    ↓
notificationService.sendToAllDevices()
    ↓
Get all devices from database
    ↓
For each device:
    - Generate unique identifier
    - Publish message to RabbitMQ queue ('notification.fcm')
    ↓
Return response to client
```

#### 2.2 Message Processing Flow

```
RabbitMQ Queue ('notification.fcm')
    ↓
FCM Consumer (fcmConsumer.js)
    ↓
Handle FCM Message:
    1. Validate message structure
    2. Prepare notification data
    3. Send notification via FCM Service
    4. Create FCM Job record in database
    5. Update device lastActiveAt timestamp
    6. Publish to 'notification.done' topic
    ↓
Firebase Cloud Messaging
    ↓
Device receives notification
```

#### 2.3 Detailed Notification Processing

```
┌─────────────────────────────────────────────────────────┐
│ 1. API Request (POST /notifications/all)                │
│    - Title, body, data, priority                        │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Notification Service                                 │
│    - Fetch all active devices from database             │
│    - For each device, publish message to RabbitMQ       │
│      Queue: 'notification.fcm'                          │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 3. RabbitMQ Queue ('notification.fcm')                  │
│    Message structure:                                   │
│    {                                                    │
│      identifier, deviceId, deviceToken,                │
│      title, body, data, priority                       │
│    }                                                    │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 4. FCM Consumer                                         │
│    - Consumes messages from queue                       │
│    - Validates message structure                        │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 5. FCM Service                                          │
│    - Sends notification via Firebase Admin SDK          │
│    - Returns FCM messageId                              │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 6. FCM Job Service                                      │
│    - Creates record in fcm_jobs table                   │
│    - Stores: deviceId, identifier, messageId, deliverAt │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 7. Publish to Topic ('notification.done')               │
│    - Publishes job completion data                      │
└─────────────────────────────────────────────────────────┘
```

## Database Schema

### Devices Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| deviceToken | STRING(500) | FCM registration token (unique) |
| deviceId | STRING(255) | Device unique identifier (optional) |
| platform | ENUM | 'ios', 'android', 'web' |
| appVersion | STRING(50) | Application version (optional) |
| osVersion | STRING(50) | Operating system version (optional) |
| deviceModel | STRING(255) | Device model (optional) |
| lastActiveAt | DATE | Last notification sent timestamp |
| createdAt | DATE | Record creation timestamp |
| updatedAt | DATE | Record update timestamp |

### FCM Jobs Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| deviceId | INTEGER | Foreign key to devices table |
| identifier | STRING(255) | Job identifier |
| messageId | STRING(255) | FCM message ID |
| deliverAt | DATE | Delivery timestamp |
| createdAt | DATE | Record creation timestamp |
| updatedAt | DATE | Record update timestamp |

## API Endpoints

### Device Management

- **POST** `/devices` - Create a new device
- **GET** `/devices` - Get all devices (with optional filters: platform, search)
- **GET** `/devices/:id` - Get device by ID
- **PUT** `/devices/:id` - Update device by ID
- **DELETE** `/devices/:id` - Delete device by ID

### Notifications

- **POST** `/notifications/all` - Send notification to all active devices

### API Documentation

- **GET** `/api-docs` - Swagger API documentation (interactive)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- RabbitMQ Server
- Firebase project with FCM enabled

### Installation

1. **Clone the repository and install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

Create a `.env` file in the root directory:

```env
# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=imbee_test
MYSQL_PORT=3306

# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost
RABBITMQ_EXCHANGE=imbee_exchange
RABBITMQ_QUEUE=imbee_queue

# Firebase Configuration
FIREBASE_CREDENTIAL_PATH=./config/firebase-json/***REMOVED***-b46961602f80.json
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Server Configuration
PORT=3000
NODE_ENV=development
```

3. **Set up Firebase:**

   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Cloud Messaging
   - Generate a service account key
   - Place the JSON file in `config/firebase-json/` directory
   - Update `FIREBASE_CREDENTIAL_PATH` in `.env`

4. **Set up MySQL database:**

```bash
# Create database
mysql -u root -p
CREATE DATABASE imbee_test;

# Run migrations
npm run db:migrate
```

5. **Start RabbitMQ Server:**

```bash
# On macOS (using Homebrew)
brew services start rabbitmq

# On Linux
sudo systemctl start rabbitmq-server

# On Windows
# Start RabbitMQ service from Services panel
```

## Docker Setup (Recommended)

### Prerequisites

- Docker (v20.10 or higher)
- Docker Compose (v2.0 or higher)
- Firebase service account JSON file (place in `config/firebase-json/` directory)

### Quick Start with Docker

1. **Place Firebase credentials:**

   Ensure your Firebase service account JSON file is in `config/firebase-json/` directory. The default filename expected is `***REMOVED***-b46961602f80.json`, or update the path in `docker-compose.yml`.

2. **Set Firebase environment variables (optional):**

   Create a `.env` file in the root directory (or export environment variables):
   
   ```env
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   ```

3. **Start all services with one command:**

   ```bash
   docker-compose up -d
   ```

   This command will:
   - Build the Node.js application images
   - Start MySQL database
   - Start RabbitMQ server
   - Start API server
   - Start Consumer service
   - **Automatically run database migrations** before starting the services

4. **View logs:**

   ```bash
   # View all logs
   docker-compose logs -f

   # View specific service logs
   docker-compose logs -f api
   docker-compose logs -f consumer
   docker-compose logs -f mysql
   docker-compose logs -f rabbitmq
   ```

5. **Access the services:**

   - **API Server**: http://localhost:3000
   - **Swagger Documentation**: http://localhost:3000/api-docs
   - **RabbitMQ Management UI**: http://localhost:15672
     - Username: `imbee_user`
     - Password: `imbee_password`

### Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v

# Rebuild and restart services
docker-compose up -d --build

# View service status
docker-compose ps

# Execute command in running container
docker-compose exec api npm run db:migrate:status
docker-compose exec api sh

# Run migrations manually (if needed)
docker-compose exec api npm run db:migrate

# View logs
docker-compose logs -f [service-name]
```

### Docker Services

The Docker setup includes:

- **MySQL 8.0**: Database server (port 3306)
  - Database: `imbee_test`
  - User: `imbee_user`
  - Password: `imbee_password`
  - Root Password: `rootpassword`

- **RabbitMQ 3.12**: Message queue server (ports 5672, 15672)
  - User: `imbee_user`
  - Password: `imbee_password`
  - Management UI: http://localhost:15672

- **API Service**: Express API server (port 3000)
  - Runs database migrations on startup
  - Automatically waits for MySQL and RabbitMQ to be ready

- **Consumer Service**: FCM notification consumer
  - Processes messages from RabbitMQ queue
  - Automatically waits for MySQL and RabbitMQ to be ready

### Environment Variables for Docker

The Docker Compose file uses the following default values (can be overridden with `.env` file):

```env
# MySQL (internal to Docker network)
MYSQL_HOST=mysql
MYSQL_USER=imbee_user
MYSQL_PASSWORD=imbee_password
MYSQL_DATABASE=imbee_test

# RabbitMQ (internal to Docker network)
RABBITMQ_URL=amqp://imbee_user:imbee_password@rabbitmq:5672

# Firebase (from your local .env file or environment)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### Data Persistence

Docker volumes are used to persist data:

- `mysql_data`: MySQL database data
- `rabbitmq_data`: RabbitMQ messages and configurations

Data persists even when containers are stopped. To remove all data:

```bash
docker-compose down -v
```

## Running the Application

### Development Mode

**Option 1: Run API and Consumer together (index.js)**
```bash
npm start
# or
node index.js
```

**Option 2: Run separately**
```bash
# Terminal 1 - API Server
npm run start:api
# or
node server.js

# Terminal 2 - Consumer
npm run start:consumer
# or
node consumer.js
```

### Production Mode with PM2

```bash
# Start both API and Consumer services
pm2 start ecosystem.config.js

# View status
pm2 status

# View logs
pm2 logs

# Stop services
pm2 stop ecosystem.config.js

# Restart services
pm2 restart ecosystem.config.js

# Delete services
pm2 delete ecosystem.config.js
```

## Database Migrations

```bash
# Run migrations
npm run db:migrate

# Undo last migration
npm run db:migrate:undo

# Undo all migrations
npm run db:migrate:undo:all

# Check migration status
npm run db:migrate:status
```

## RabbitMQ Queue and Exchange

The application uses the following RabbitMQ setup:

- **Queue**: `notification.fcm` - For FCM notification messages
- **Topic Exchange**: `notification.done` - For completed notification jobs
- **Exchange Type**: Direct exchange for queues, Topic exchange for completion events

## Logs

Logs are stored in the `logs/` directory:

- `api-error.log` - API server error logs
- `api-out.log` - API server output logs
- `consumer-error.log` - Consumer error logs
- `consumer-out.log` - Consumer output logs

When using PM2, logs are automatically written to these files.

## Key Features

1. **Asynchronous Notification Processing**: Uses RabbitMQ to handle notification delivery asynchronously
2. **Device Management**: CRUD operations for device registration and management
3. **Bulk Notifications**: Send notifications to all registered devices
4. **Job Tracking**: Tracks FCM jobs in database for audit and monitoring
5. **Error Handling**: Comprehensive error handling with logging
6. **API Documentation**: Interactive Swagger documentation
7. **Scalable Architecture**: Separate API and Consumer processes for better scalability

## Architecture Decisions

1. **Separate API and Consumer Processes**: Allows independent scaling of API and message processing
2. **RabbitMQ for Message Queue**: Provides reliability, persistence, and scalability for notification processing
3. **Database Job Tracking**: Maintains audit trail of all notification jobs
4. **Firebase Admin SDK**: Official SDK for sending FCM notifications
5. **Sequelize ORM**: Provides database abstraction and migration support

## Troubleshooting

### Common Issues

1. **Database Connection Error**: Verify MySQL is running and credentials are correct
2. **RabbitMQ Connection Error**: Ensure RabbitMQ server is running on the configured URL
3. **Firebase Authentication Error**: Check service account JSON file path and permissions
4. **Port Already in Use**: Change PORT in `.env` or stop the process using port 3000

### Checking Services

```bash
# Check MySQL
mysql -u root -p -e "SELECT 1"

# Check RabbitMQ
rabbitmqctl status

# Check if ports are in use
lsof -i :3000
lsof -i :5672  # RabbitMQ default port
```

## License

ISC

