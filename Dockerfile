FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies for waiting scripts
RUN apk add --no-cache bash mysql-client netcat-openbsd

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Create logs directory
RUN mkdir -p logs

# Copy entrypoint scripts
COPY docker-entrypoint.sh /usr/local/bin/
COPY wait-for-it.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh /usr/local/bin/wait-for-it.sh

# Expose port
EXPOSE 3000

# Use entrypoint script
ENTRYPOINT ["docker-entrypoint.sh"]

