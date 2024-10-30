import winston, { format, transports } from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

// Define log directory
const logDirectory: string = path.join(__dirname, '..', 'logs');

// Log level can be configured using an environment variable (default is 'info')
const logLevel: string = process.env.LOG_LEVEL || 'info';

// Configure the Winston logger
const logger: winston.Logger = winston.createLogger({
    level: logLevel,  // Set log level dynamically
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.printf(({ timestamp, level, message, stack }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
        })
    ),
    transports: [
        // File transport: rotate logs on a daily basis
        new transports.DailyRotateFile({
            filename: path.join(logDirectory, 'log-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            level: logLevel,  // Use the same log level for file logs
        }),

        // Console transport for development (optional)
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.simple()
            ),
            level: logLevel,  // Set log level for console logs as well
        }),
    ],
});

// Catch unhandled exceptions and unhandled promise rejections
logger.exceptions.handle(
    new transports.DailyRotateFile({
        filename: path.join(logDirectory, 'exceptions-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
    })
);

export default logger;
