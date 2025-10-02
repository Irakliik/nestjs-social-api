import fs from 'fs';
import crypto from 'crypto';

export default class Post {
    constructor(
        title,
        description,
        authorId,
        dateCreated = new Date().toUTCString(),
        id = crypto.randomUUID()
    ) {
        this.title = title;
        this.description = description;
        this.authorId = authorId;
        this.dateCreated = dateCreated;
        this.id = id;
    }

    static postsDBPath = './database/posts.json';

    static async getPosts() {
        try {
            const dataStr = await fs.promises.readFile(
                this.postsDBPath,
                'utf8'
            );
            return dataStr.trim() ? JSON.parse(dataStr) : [];
        } catch (err) {
            if (err.code === 'ENOENT') return [];
            throw err;
        }
    }

    static storePosts(posts) {
        return fs.promises.writeFile(
            this.postsDBPath,
            JSON.stringify(posts),
            'utf8'
        );
    }

    static addPost(newPost) {
        return this.getPosts()
            .then((posts) => [...posts, newPost])
            .then((newPosts) => this.storePosts(newPosts));
    }

    static getPostsByAuthorId(userId) {
        return this.getPosts().then((posts) =>
            posts.filter((post) => post.authorId === userId)
        );
    }

    static getPostById(postId) {
        return this.getPosts().then((posts) =>
            posts.find((post) => post.id === postId)
        );
    }

    static deletePost(postId) {
        return this.getPosts()
            .then((posts) => posts.filter((post) => post.id !== postId))
            .then((posts) => this.storePosts(posts));
    }
}
