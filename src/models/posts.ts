import fs from 'fs';
import crypto from 'crypto';

export default class Post {
    constructor(
        readonly title: string,
        readonly description: string,
        readonly authorId: string,
        readonly dateCreated: string = new Date().toUTCString(),
        readonly id: string = crypto.randomUUID()
    ) {}

    static postsDBPath = './database/posts.json';

    static async getPosts(): Promise<Post[]> {
        try {
            const dataStr = await fs.promises.readFile(
                this.postsDBPath,
                'utf8'
            );
            return dataStr.trim() ? JSON.parse(dataStr) : [];
        } catch (err) {
            if (
                err instanceof Error &&
                (err as NodeJS.ErrnoException).code === 'ENOENT'
            )
                return [];
            throw err;
        }
    }

    static storePosts(posts: Post[]) {
        return fs.promises.writeFile(
            this.postsDBPath,
            JSON.stringify(posts),
            'utf8'
        );
    }

    static addPost(newPost: Post) {
        return this.getPosts()
            .then((posts) => [...posts, newPost])
            .then((newPosts) => this.storePosts(newPosts));
    }

    static getPostsByAuthorId(userId: string) {
        return this.getPosts().then((posts) =>
            posts.filter((post: Post) => post.authorId === userId)
        );
    }

    static getPostById(postId: string) {
        return this.getPosts().then((posts) =>
            posts.find((post: Post) => post.id === postId)
        );
    }

    static deletePost(postId: string) {
        return this.getPosts()
            .then((posts) => posts.filter((post: Post) => post.id !== postId))
            .then((posts) => this.storePosts(posts));
    }

    static async updatePost(
        postId: string,
        newTitle: string,
        newDescription: string
    ) {
        const posts = await this.getPosts();
        // prettier-ignore
        const updatedPosts: Post[] = posts.map((post: Post) =>
            post.id === postId
                ? new Post(
                    newTitle,
                    newDescription,
                    post.authorId,
                    post.dateCreated,
                    post.id
                )
                : post
        );

        await this.storePosts(updatedPosts);
    }
}
