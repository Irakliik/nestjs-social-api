import jwt, { type JwtPayload } from 'jsonwebtoken';

import type { Request, Response, NextFunction } from 'express';

interface HttpError extends Error {
    statusCode?: number;
}

interface AuthRequest extends Request {
    userId?: string;
}

interface DecodedToken extends JwtPayload {
    email: string;
    userId: string;
}

export default (req: AuthRequest, res: Response, next: NextFunction) => {
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

    req.userId = decodedToken.userId;
    next();
};
