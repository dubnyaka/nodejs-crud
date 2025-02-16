import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const logDirectory = path.join(__dirname, '../../logs');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({timestamp, level, message}) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(), // Логи в консоль
        new DailyRotateFile({
            filename: `${logDirectory}/app-%DATE%.log`,
            datePattern: 'YYYY-MM-DD',
            maxSize: '10m',
            maxFiles: '14d',
        }),
        new DailyRotateFile({
            level: 'error',
            filename: `${logDirectory}/error-%DATE%.log`,
            datePattern: 'YYYY-MM-DD',
            maxSize: '10m',
            maxFiles: '30d',
        })
    ]
});

export default logger;
