import { userEvent } from '../app.js';
import Post from '../models/posts.js';
import User from '../models/users.js';
import type {
    AuthRequest,
    CreatePostRequestBody,
    HttpError,
    PutPostBody,
    PutUserProfileRequestBody,
} from '../types/interfaces.js';
import logger from '../util.js';
import type { Request, Response } from 'express';

const getUserProfile = (req: Request, res: Response) => {
    const userId = (req as AuthRequest).userId;

    User.getUserById(userId)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            });
        })
        .catch((err) => {
            logger.error(`Error - ${err.message}`);
            res.status(500).json({ message: 'Server error' });
        });
};

const putUserProfile = (
    req: Request<{}, {}, PutUserProfileRequestBody>,
    res: Response
) => {
    const { firstName, lastName, email } = req.body;
    const userId = (req as AuthRequest).userId;

    User.updateUser(userId, firstName, lastName)
        .then(() => {
            userEvent.emit('profileUpdated', email);
            logger.info('updated successfully');
            res.status(201).json({ message: 'updated successfully' });
        })
        .catch((err) => {
            logger.error(`Error - ${err.message}`);
            res.status(500).json({ message: 'Server error' });
        });
};

const postPost = (
    req: Request<{}, {}, CreatePostRequestBody>,
    res: Response
) => {
    const { title, description } = req.body;
    const authorId = (req as AuthRequest).userId;

    if (!title || !description) {
        return res
            .status(400)
            .json({ message: 'Title and description are required.' });
    }

    const newPost = new Post(title, description, authorId);
    Post.addPost(newPost)
        .then(() => {
            logger.info('posted successfully');
            res.status(201).json({ message: 'posted successfully' });
        })
        .catch((err) => {
            logger.error(`Error - ${err.message}`);
            res.status(500).json({ message: 'Server error' });
        });
};

const getPosts = async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).userId;

    try {
        const user = await User.getUserById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const postsArr = await Post.getPostsByAuthorId(userId);

        const posts = postsArr.map((post) => {
            const { title, description, dateCreated } = post;
            const authorName = user.firstName + ' ' + user.lastName;

            return { title, description, dateCreated, authorName };
        });

        if (posts.length === 0) {
            logger.info('No posts found for this user');
        } else {
            logger.info('Posts sent successfully!');
        }
        res.status(200).json(posts);
    } catch (error) {
        const err = error as HttpError;
        logger.error(`Error - ${err.message}`);
        res.status(500).json({ errMessage: err.message });
    }
};

const deletePost = async (req: Request<{ postId: string }>, res: Response) => {
    const userId = (req as unknown as AuthRequest).userId;

    const postId = req.params.postId;

    try {
        const post = await Post.getPostById(postId);

        if (!post) {
            const error = new Error('No Post found');
            throw error;
        }

        if (post.authorId !== userId) {
            logger.error('Not authorized to delete this post!');

            return res
                .status(403)
                .json({ message: 'Not authorized to delete this post!' });
        }

        await Post.deletePost(postId);
        res.status(200).json({ message: 'Post deleted successfully' });
        logger.info('Post deleted successfully');
    } catch (error) {
        const err = error as HttpError;
        logger.error(`Error - ${err.message}`);
        res.status(500).json({ message: 'Server error' });
        logger.error(`Error - ${err.message}`);
    }
};

const putPost = async (
    req: Request<{ postId: string }, {}, PutPostBody>,
    res: Response
) => {
    const userId = (req as unknown as AuthRequest).userId;
    const postId = req.params.postId;
    const { title: newTitle, description: newDescription } = req.body;

    try {
        const post = await Post.getPostById(postId);

        if (!post) {
            const error = new Error(
                `Could not find Post with the id ${postId} `
            );
            throw error;
        }

        if (post.authorId !== userId) {
            logger.error('Not authorized to update this post!');

            return res
                .status(403)
                .json({ message: 'Not authorized to update this post!' });
        }

        await Post.updatePost(postId, newTitle, newDescription);

        res.status(200).json({ message: 'Post updated successfully' });
        logger.info('Post updated successfully');
    } catch (error) {
        const err = error as HttpError;
        res.status(500).json({ message: 'Server error' });
        logger.error(`Error - ${err.message}`);
    }
};

export {
    getUserProfile,
    putUserProfile,
    postPost,
    getPosts,
    deletePost,
    putPost,
};
