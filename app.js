import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';
import express from 'express';
import bcrypt from 'bcrypt';
import User from './models/users.js';
import jwt from 'jsonwebtoken';
import isAuth from './middleware/is-auth.js';
import EventEmitter from 'events';
import nodemailer from 'nodemailer';
import sendgridTransports from 'nodemailer-sendgrid-transport';
import Post from './models/posts.js';
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const port = process.env.PORT;

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

const transporter = nodemailer.createTransport(
    sendgridTransports({
        auth: {
            api_key: process.env.SENDGRID_API_KEY,
        },
    })
);

const event = new EventEmitter();

event.on('profileUpdated', (email) => {
    transporter.sendMail({
        to: email,
        from: process.env.ORG_EMAIL,
        subject: 'Update Succeded!',
        html: '<h1>You successfully updated!</h1>',
    });
});

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
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

app.get('/health', async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.url}`);
    const packageJSONPath = path.join(__dirname, 'package.json');

    try {
        const data = await fs.promises.readFile(packageJSONPath, 'utf-8');
        const { version } = JSON.parse(data);
        res.json({ version });
    } catch (err) {
        logger.error(`Error - ${err.message}`);
    }
});

app.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        const users = await User.getUsers();

        if (users.some((user) => user.email === email)) {
            return res.status(400).send('Email already registered.');
        }

        const hash = await bcrypt.hash(password, 12);

        const newUser = new User(firstName, lastName, email, hash);
        users.push(newUser);

        await User.addUser(users);

        res.status(201).json({ message: 'user added successfully!' });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server error');
    }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    let loadedUser;
    User.getUserByEmail(email)
        .then((user) => {
            if (!user) {
                const error = new Error(
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
                const error = new Error('Wrong Password');
                error.statusCode = 401;
                throw error;
            }

            const token = jwt.sign(
                {
                    fullname: loadedUser.firstName + ' ' + loadedUser.lastName,
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

app.get('/user/profile', isAuth, (req, res) => {
    const userId = req.userId;
    User.getUserById(userId)
        .then((user) => {
            res.status(200).json({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            });
        })
        .catch(() => {
            res.status(500).json({ message: 'Server error' });
        });
});

app.put('/user/profile', isAuth, (req, res) => {
    const { firstName, lastName, email } = req.body;
    const userId = req.userId;

    User.updateUser(userId, firstName, lastName)
        .then(() => {
            event.emit('profileUpdated', email);
            logger.info('updated successfully');
            res.status(201).json({ message: 'updated successfully' });
        })
        .catch((err) => {
            logger.error(`Error - ${err.message}`);
        });
});

app.post('/user/posts', isAuth, (req, res) => {
    const { title, description } = req.body;
    const authorId = req.userId;

    const newPost = new Post(title, description, authorId);
    Post.storePosts(newPost)
        .then(() => {
            logger.info('posted successfully');
            res.status(201).json({ message: 'posted successfully' });
        })
        .catch((err) => {
            logger.error(`Error - ${err.message}`);
        });
});

app.get('/user/posts', isAuth, (req, res) => {
    const userId = req.userId;
    const fullName = req.fullName;

    Post.getPostsById(userId)
        .then((posts) => {
            const { title, description, createdDate } = posts;
            if (posts.length > 0) {
                res.status(200).json({
                    title,
                    description,
                    createdDate,
                    author: fullName,
                });
                logger.info('Posts sent successfully!');
            } else {
                const error = new error('No posts Found!');
                error.statusCode = 204;
                throw error;
            }
        })
        .catch((err) => {
            const status = err.statusCode || 500;
            logger.error(`Error - ${err.message}`);
            res.status(status).json({ errMessage: err.message });
        });
});

app.listen(port);
