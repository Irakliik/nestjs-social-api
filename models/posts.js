import fs from 'fs';
export default class Post {
    constructor(
        title,
        description,
        authorId,
        dateCreated = new Date().toUTCString()
    ) {
        this.title = title;
        this.description = description;
        this.authorId = authorId;
        this.dateCreated = dateCreated;
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
}
