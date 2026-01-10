const amqp = require('amqplib');
const config = require('./config');

class RabbitMQConnection {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      if (!this.connection) {
        this.connection = await amqp.connect(config.rabbitmq.url);
        console.log('RabbitMQ connected');
        
        this.connection.on('error', (err) => {
          console.error('RabbitMQ connection error:', err);
          this.connection = null;
        });

        this.connection.on('close', () => {
          console.log('RabbitMQ connection closed');
          this.connection = null;
          this.channel = null;
        });
      }

      if (!this.channel) {
        this.channel = await this.connection.createChannel();
        console.log('RabbitMQ channel created');
      }

      return { connection: this.connection, channel: this.channel };
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
      throw error;
    }
  }

  async setupExchange() {
    try {
      const { channel } = await this.connect();
      await channel.assertExchange(config.rabbitmq.exchange, 'direct', {
        durable: true
      });
      console.log(`Exchange '${config.rabbitmq.exchange}' asserted`);
      return channel;
    } catch (error) {
      console.error('Error setting up exchange:', error);
      throw error;
    }
  }

  async setupQueue(queueName = null) {
    try {
      const { channel } = await this.connect();
      const queue = queueName || config.rabbitmq.queue;
      
      const queueResult = await channel.assertQueue(queue, {
        durable: true
      });
      
      await channel.bindQueue(queue, config.rabbitmq.exchange, '');
      
      console.log(`Queue '${queue}' asserted and bound`);
      return { channel, queue: queueResult.queue };
    } catch (error) {
      console.error('Error setting up queue:', error);
      throw error;
    }
  }

  async publishMessage(routingKey, message, options = {}) {
    try {
      const { channel } = await this.setupExchange();
      const messageBuffer = Buffer.from(JSON.stringify(message));
      
      const published = channel.publish(
        config.rabbitmq.exchange,
        routingKey || '',
        messageBuffer,
        {
          persistent: true,
          ...options
        }
      );

      if (published) {
        console.log(`Message published to exchange '${config.rabbitmq.exchange}' with routing key '${routingKey || ''}'`);
      } else {
        console.warn('Message returned to queue (buffer full)');
      }

      return published;
    } catch (error) {
      console.error('Error publishing message:', error);
      throw error;
    }
  }

  async consumeQueue(queueName, callback, options = {}) {
    try {
      const { channel, queue } = await this.setupQueue(queueName);
      
      await channel.prefetch(1);
      
      await channel.consume(queue, async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            await callback(content, msg);
            channel.ack(msg);
          } catch (error) {
            console.error('Error processing message:', error);
            channel.nack(msg, false, false); // Reject and don't requeue
          }
        }
      }, {
        noAck: false,
        ...options
      });

      console.log(`Consuming messages from queue '${queue}'`);
    } catch (error) {
      console.error('Error consuming queue:', error);
      throw error;
    }
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
        console.log('RabbitMQ channel closed');
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
        console.log('RabbitMQ connection closed');
      }
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
      throw error;
    }
  }
}

module.exports = new RabbitMQConnection();

