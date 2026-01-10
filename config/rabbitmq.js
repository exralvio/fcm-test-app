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
      
      console.log(`Queue '${queue}' asserted`);
      return { channel, queue: queueResult.queue };
    } catch (error) {
      console.error('Error setting up queue:', error);
      throw error;
    }
  }

  async setupTopicExchange(exchangeName) {
    try {
      const { channel } = await this.connect();
      await channel.assertExchange(exchangeName, 'topic', {
        durable: true
      });
      console.log(`Topic exchange '${exchangeName}' asserted`);
      return channel;
    } catch (error) {
      console.error('Error setting up topic exchange:', error);
      throw error;
    }
  }

  async publishMessage(queueName, message, options = {}) {
    try {
      const { channel, queue } = await this.setupQueue(queueName);
      const messageBuffer = Buffer.from(JSON.stringify(message));
      
      const published = channel.sendToQueue(queue, messageBuffer, {
        persistent: true,
        ...options
      });

      if (published) {
        console.log(`Message published to queue '${queueName}'`);
      } else {
        console.warn('Message returned to queue (buffer full)');
      }

      return published;
    } catch (error) {
      console.error('Error publishing message to queue:', error);
      throw error;
    }
  }

  async publishToTopic(topic, message, options = {}) {
    try {
      const topicExchange = 'notification-topic-exchange';
      const { channel } = await this.setupTopicExchange(topicExchange);
      const messageBuffer = Buffer.from(JSON.stringify(message));
      
      const published = channel.publish(
        topicExchange,
        topic,
        messageBuffer,
        {
          persistent: true,
          ...options
        }
      );

      if (published) {
        console.log(`Message published to topic '${topic}' on exchange '${topicExchange}'`);
      } else {
        console.warn('Message returned to exchange (buffer full)');
      }

      return published;
    } catch (error) {
      console.error('Error publishing to topic:', error);
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
            // Reject and don't requeue on error - message will be lost or use DLQ
            channel.nack(msg, false, false);
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

  async subscribeToTopic(topic, callback, options = {}) {
    try {
      const topicExchange = 'notification-topic-exchange';
      const { channel } = await this.setupTopicExchange(topicExchange);
      
      // Create an exclusive queue for this consumer
      const queueResult = await channel.assertQueue('', {
        exclusive: true
      });
      
      await channel.bindQueue(queueResult.queue, topicExchange, topic);
      
      await channel.prefetch(1);
      
      await channel.consume(queueResult.queue, async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            await callback(content, msg);
            channel.ack(msg);
          } catch (error) {
            console.error('Error processing topic message:', error);
            channel.nack(msg, false, false);
          }
        }
      }, {
        noAck: false,
        ...options
      });

      console.log(`Subscribed to topic '${topic}' on exchange '${topicExchange}'`);
      return queueResult.queue;
    } catch (error) {
      console.error('Error subscribing to topic:', error);
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

