import winston from 'winston';
import path from 'path';

class Logger {
  private static instance: winston.Logger;

  private constructor() {}

  public static getInstance(): winston.Logger {
    if (!Logger.instance) {
      const logFormat = winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      );

      Logger.instance = winston.createLogger({
        level: 'info',
        format: logFormat,
        transports: [
          // Console transport
          new winston.transports.Console({
            format: winston.format.simple()
          }),
          
          // File transport for errors
          new winston.transports.File({
            filename: path.join(__dirname, '../logs/error.log'),
            level: 'error'
          }),
          
          // File transport for combined logs
          new winston.transports.File({
            filename: path.join(__dirname, '../logs/combined.log')
          })
        ]
      });
    }
    return Logger.instance;
  }

  // Static methods for easy logging
  public static error(message: string, meta?: any) {
    this.getInstance().error(message, meta);
  }

  public static warn(message: string, meta?: any) {
    this.getInstance().warn(message, meta);
  }

  public static info(message: string, meta?: any) {
    this.getInstance().info(message, meta);
  }
}

export default Logger;