import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import bcrypt from 'bcrypt';
import User from './models/users.js';
import jwt from 'jsonwebtoken';
import isAuth from './middleware/is-auth.js';
import EventEmitter from 'events';
import nodemailer from 'nodemailer';
import sendgridTransports from 'nodemailer-sendgrid-transport';
import bodyParser from 'body-parser';
import Router from './routers/users.js';
import logger from './util.js';

import type { NextFunction, Request, Response } from 'express';
import type { HttpError, LoginBody, SignupBody } from './types/interfaces.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const port = process.env.PORT;

const transporter = nodemailer.createTransport(
    sendgridTransports({
        auth: {
            api_key: process.env.SENDGRID_API_KEY,
        },
    })
);

export const userEvent = new EventEmitter();

userEvent.on('profileUpdated', (email) => {
    transporter.sendMail({
        to: email,
        from: process.env.ORG_EMAIL,
        subject: 'Update Succeded!',
        html: '<h1>You successfully updated!</h1>',
    });
});

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use((req: Request, res: Response, next: NextFunction) => {
    const headers = {
        'Content-Type': 'application/json',
        'X-Powered-By': 'Node.js',
        'Cache-Control': 'no-store',
        Connection: 'keep-alive',
        Date: new Date().toUTCString(),
    };

    for (const [header, value] of Object.entries(headers)) {
        res.setHeader(header, value);
    }
    next();
});

app.get('/health', async (req: Request, res: Response) => {
    logger.info(`Incoming request: ${req.method} ${req.url}`);
    const packageJSONPath = path.join(__dirname, '..', 'package.json');

    try {
        const data = await fs.promises.readFile(packageJSONPath, 'utf-8');
        const { version } = JSON.parse(data);
        res.json({ version });
    } catch (error) {
        const err = error as Error;
        logger.error(`Error - ${err.message}`);
    }
});

app.post('/signup', async (req: Request<{}, {}, SignupBody>, res: Response) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        const users = await User.getUsers();

        if (users.some((user: User) => user.email === email)) {
            return res.status(400).send('Email already registered.');
        }

        const hash = await bcrypt.hash(password, 12);

        const newUser = new User(firstName, lastName, email, hash);
        users.push(newUser);

        await User.addUser(newUser);

        res.status(201).json({ message: 'user added successfully!' });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server error');
    }
});

app.post('/login', (req: Request<{}, {}, LoginBody>, res) => {
    const { email, password } = req.body;

    let loadedUser: User;
    User.getUserByEmail(email)
        .then((user) => {
            if (!user) {
                const error: HttpError = new Error(
                    'A user with this email could not be found'
                );
                error.statusCode = 401;
                throw error;
            }

            loadedUser = user;
            return bcrypt.compare(password, user.passwordHash);
        })
        .then((isEqual) => {
            if (!isEqual) {
                const error: HttpError = new Error('Wrong Password');
                error.statusCode = 401;
                throw error;
            }

            const token = jwt.sign(
                {
                    email: loadedUser.email,
                    userId: loadedUser.id,
                },
                'somesecretkey',
                { expiresIn: '1h' }
            );

            res.status(200).json({ token, userId: loadedUser.id });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            console.log(err);
            res.status(err.statusCode).json({ message: err.message });
        });
});

app.use('/user', isAuth, Router);

app.listen(port);
