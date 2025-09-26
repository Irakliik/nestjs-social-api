// import http from 'http';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';
import express from 'express';

dotenv.config();

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.printf(({ level, message }) => {
        return `${level} - ${message}`;
    }),
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

const app = express();

app.use((req, res, next) => {
    res.set({
        'Content-Type': 'application/json',
        'X-Powered-By': 'Node.js',
        'Cache-Control': 'no-store',
        Connection: 'keep-alive',
        Date: new Date().toUTCString(),
    });
    next();
});

app.get('/health', (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.url}`);

    try {
        res.json({ version });
    } catch (err) {
        logger.error(`Error - ${err.message}`);
    }
});

app.listen(port);
