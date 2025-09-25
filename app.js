import http from 'http';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';

dotenv.config();

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp }) => {
            return `${timestamp} - ${level} - ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'app.log' }),
    ],
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJSONPath = path.join(__dirname, 'package.json');
const { version } = JSON.parse(fs.readFileSync(packageJSONPath, 'utf-8'));

const port = process.env.PORT;

const server = http.createServer(function (request, response) {
    logger.info(`Incoming request: ${request.method} ${request.url}`);

    response.setHeader('Content-Type', 'application/json');
    response.setHeader('X-Powered-By', 'Node.js');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('Date', new Date().toUTCString());

    try {
        if (request.url === '/health' && request.method === 'GET') {
            const data = { version };

            response.end(JSON.stringify(data));
        } else {
            response.end();
        }
    } catch (err) {
        logger.error(`Error - ${err.message}`);
    }
});

server.listen(port);
