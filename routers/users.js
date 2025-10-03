import express from 'express';
import User from '../models/users';
import Post from '../models/posts';
import isAuth from '../middleware/is-auth';
import logger from '../utiil';
const Router = express().router;

Router.get('/profile', (req, res) => {
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
Router.put('/profile', (req, res) => {
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

Router.post('/post', (req, res) => {
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

Router.get('/posts', async (req, res) => {
    const userId = req.userId;

    try {
        const user = await User.getUserById(userId);
        const postsArr = await Post.getPostsByAuthorId(userId);

        const posts = postsArr.map((post) => {
            const { title, description, createdDate } = post;
            const authorName = user.firstName + ' ' + user.lastName;

            return { title, description, createdDate, authorName };
        });

        if (posts.length === 0) {
            logger.info('No posts found for this user');
        } else {
            logger.info('Posts sent successfully!');
        }
        res.status(200).json(posts);
    } catch (err) {
        logger.error(`Error - ${err.message}`);
        res.status(500).json({ errMessage: err.message });
    }
});

Router.delete('/post/:postId', isAuth, async (req, res) => {
    const userId = req.userId;
    const postId = req.params.postId;

    try {
        const post = await Post.getPostById(postId);

        if (post.authorId !== userId) {
            logger.error('Not authorized to delete this post!');

            return res
                .status(403)
                .json({ message: 'Not authorized to delete this post!' });
        }

        await Post.deletePost(postId);
        res.status(200).json({ message: 'Post deleted successfully' });
        logger.info('Post deleted successfully');
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
        logger.error(`Error - ${err.message}`);
    }
});

Router.put('/post/:postId', async (req, res) => {
    const userId = req.userId;
    const postId = req.params.postId;
    const { title: newTitle, description: newDescription } = req.body;

    try {
        const post = await Post.getPostById(postId);

        if (post.authorId !== userId) {
            logger.error('Not authorized to update this post!');

            return res
                .status(403)
                .json({ message: 'Not authorized to update this post!' });
        }

        await Post.updatePost(postId, newTitle, newDescription);

        res.status(200).json({ message: 'Post updated successfully' });
        logger.info('Post updated successfully');
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
        logger.error(`Error - ${err.message}`);
    }
});

export default Router;
