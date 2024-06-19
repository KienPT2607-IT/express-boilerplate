const { createClient } = require('redis');

const redisClient = createClient({
   url: 'redis://localhost:6379' // Adjust according to your Redis setup
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Immediately invoked function to connect to Redis
(async () => {
   try {
      await redisClient.connect();
      console.log('Connected to Redis');
   } catch (err) {
      console.error('Redis connection error:', err);
   }
})();

module.exports = redisClient;
