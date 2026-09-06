const config = require("./config");

const redisConnection = config.REDIS_URL
  ? { url: config.REDIS_URL, maxRetriesPerRequest: null }
  : {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      password: config.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };

module.exports = redisConnection;
