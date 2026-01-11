#!/bin/bash
set -e

# Get the command (default to npm start if not provided)
CMD="${@:-npm start}"

# Extract RabbitMQ host and port from URL if provided
if [ -n "$RABBITMQ_URL" ]; then
    # Extract host and port from amqp://user:pass@host:port format
    RABBITMQ_HOST=$(echo $RABBITMQ_URL | sed -e 's|^[^@]*@||' -e 's|:.*$||')
    RABBITMQ_PORT=$(echo $RABBITMQ_URL | sed -e 's|^.*:||' -e 's|/.*$||')
fi

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
wait-for-it.sh "${MYSQL_HOST:-mysql}:${MYSQL_PORT:-3306}" --timeout=60 --strict

# Wait for RabbitMQ to be ready
echo "Waiting for RabbitMQ to be ready..."
wait-for-it.sh "${RABBITMQ_HOST:-rabbitmq}:${RABBITMQ_PORT:-5672}" --timeout=60 --strict

# Run database migrations (only if RUN_MIGRATIONS is not set to false)
if [ "${RUN_MIGRATIONS:-true}" != "false" ]; then
    echo "Running database migrations..."
    npm run db:migrate || {
        echo "Warning: Migration failed, continuing anyway..."
    }
fi

# Execute the main command
echo "Starting application: $CMD"
exec $CMD

