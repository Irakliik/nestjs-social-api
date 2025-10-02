// import http from 'http';
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

const transporter = nodemailer.createTransport(
    sendgridTransports({
        auth: {
            api_key: process.env.SENDGRID_API_KEY,
        },
    })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJSONPath = path.join(__dirname, 'package.json');
const { version } = JSON.parse(fs.readFileSync(packageJSONPath, 'utf-8'));

const port = process.env.PORT;

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

app.get('/profile', isAuth, (req, res) => {
    const userId = req.body.id;
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

app.put('/update-user', isAuth, (req, res) => {
    const { id, firstName, lastName, email } = req.body;

    User.updateUser(id, firstName, lastName)
        .then(() => {
            event.emit('profileUpdated', email);
            logger.info('updated successfully');
            res.status(201).json({ message: 'updated successfully' });
        })
        .catch((err) => {
            logger.error(`Error - ${err.message}`);
        });
});

app.post('user/create-post', isAuth, (req, res) => {
    const { title, description, authorId } = req.body;

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

app.listen(port);
