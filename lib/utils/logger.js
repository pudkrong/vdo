const winston = require('winston');
const logger = new winston.Logger({
  level: 'info',
  transports: [
    new winston.transports.Console({
      colorize: true,
      timestamp: true,
    }),
    new winston.transports.File({
      level: 'warn',
      filename: __dirname + '/../../logs/error.log'
    }),
  ]
});

module.exports = logger;