import express from 'express';
import {
    deletePost,
    getPosts,
    getUserProfile,
    postPost,
    putPost,
    putUserProfile,
} from '../controllers/users.js';

const Router = express.Router();

Router.get('/profile', getUserProfile);
Router.put('/profile', putUserProfile);
Router.post('/post', postPost);
Router.get('/posts', getPosts);
Router.delete('/post/:postId', deletePost);
Router.put('/post/:postId', putPost);

export default Router;
