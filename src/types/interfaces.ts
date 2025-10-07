import type { Request } from 'express';

import type { JwtPayload } from 'jsonwebtoken';

export interface HttpError extends Error {
    statusCode?: number;
}

export interface AuthRequest extends Request {
    userId: string;
}

export interface PostActionRequest {
    postId: string;
}

export interface PutPostBody {
    title: string;
    description: string;
}

export interface PutUserProfileRequestBody {
    firstName: string;
    lastName: string;
    email: string;
}

export interface CreatePostRequestBody {
    title: string;
    description: string;
}

export interface HttpError extends Error {
    statusCode?: number;
}

export interface DecodedToken extends JwtPayload {
    email: string;
    userId: string;
}
