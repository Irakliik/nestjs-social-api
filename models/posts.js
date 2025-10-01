import fs from 'fs';
export default class User {
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

    static storePosts(post) {
        return fs.promises.writeFile(
            this.postsDBPath,
            JSON.stringify(post),
            'utf8'
        );
    }
}
