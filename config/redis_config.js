var redisConf = {
  host: 'your.redis.server.net',
  port: 'your.port',
  auth: {
    auth_pass: 'your.redis.key', tls: {servername: 'your.redis.server.net'}
  }
};

module.exports = redisConf;
