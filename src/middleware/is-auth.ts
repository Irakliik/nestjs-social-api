import jwt from 'jsonwebtoken';

import type { Request, Response, NextFunction } from 'express';
import type {
    AuthRequest,
    DecodedToken,
    HttpError,
} from '../types/interfaces.js';

export default (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
        const error: HttpError = new Error('Not authenticated.');

        error.statusCode = 401;
        throw error;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        const error: HttpError = new Error('Token missing.');
        error.statusCode = 401;
        throw error;
    }

    let decodedToken;

    try {
        decodedToken = jwt.verify(token, 'somesecretkey') as DecodedToken;
    } catch (err) {
        (err as HttpError).statusCode = 500;
        throw err;
    }

    if (!decodedToken) {
        const error: HttpError = new Error('Not authenticated.');
        error.statusCode = 401;
        throw error;
    }

    (req as AuthRequest).userId = decodedToken.userId;
    next();
};
