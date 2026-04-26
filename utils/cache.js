const redis = require('redis');
const logger = require('./logger');

let client;

if (process.env.REDIS_URL || process.env.NODE_ENV === 'production') {
  client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  client.on('error', (err) => logger.error('Redis Client Error', err));
  client.on('connect', () => logger.info('🚀 Connected to Redis'));

  client.connect().catch(err => logger.error('Redis connection failed', err));
}

const cache = {
  async get(key) {
    if (!client || !client.isOpen) return null;
    try {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      logger.error('Redis get error', err);
      return null;
    }
  },

  async set(key, value, ttl = 3600) {
    if (!client || !client.isOpen) return;
    try {
      await client.set(key, JSON.stringify(value), {
        EX: ttl
      });
    } catch (err) {
      logger.error('Redis set error', err);
    }
  }
};

module.exports = cache;
