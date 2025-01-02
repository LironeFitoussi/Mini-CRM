// utils/logger.js

const { createLogger, format, transports } = require('winston');
const path = require('path');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`)
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join(__dirname, '../logs/combined.log') }),
    new transports.File({ filename: path.join(__dirname, '../logs/error.log'), level: 'error' })
  ],
  exitOnError: false, // Do not exit on handled exceptions
});

module.exports = logger;
