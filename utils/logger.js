// utils/logger.js — Structured logging for production
const { createLogger, format, transports } = require('winston');
const path = require('path');

const { combine, timestamp, printf, colorize, errors } = format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => {
    return `${ts} [${level}] ${stack || message}`;
  })
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  format.json()
);

const isProd = process.env.NODE_ENV === 'production';

const logger = createLogger({
  level: isProd ? 'warn' : 'info',
  format: isProd ? prodFormat : devFormat,
  transports: [
    new transports.Console(),
    ...(isProd
      ? [
          new transports.File({
            filename: path.join(__dirname, '../logs/error.log'),
            level: 'error',
            maxsize: 5 * 1024 * 1024, // 5MB
            maxFiles: 5,
          }),
          new transports.File({
            filename: path.join(__dirname, '../logs/combined.log'),
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 10,
          }),
        ]
      : []),
  ],
});

module.exports = logger;
