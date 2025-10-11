import fs from 'fs';
import crypto from 'crypto';
import { join } from 'path';
import srcFolderPath from 'src-folder-path';

export default class PostModel {
  constructor(
    readonly title: string,
    readonly description: string,
    readonly authorId: string,
    readonly dateCreated: string = new Date().toUTCString(),
    readonly id: string = crypto.randomUUID(),
  ) {}

  static postsDBPath = join(srcFolderPath, 'database', 'posts.json');

  static async getPosts(): Promise<PostModel[]> {
    try {
      const dataStr = await fs.promises.readFile(this.postsDBPath, 'utf8');
      return dataStr.trim() ? (JSON.parse(dataStr) as PostModel[]) : [];
    } catch (err) {
      if (
        err instanceof Error &&
        (err as NodeJS.ErrnoException).code === 'ENOENT'
      )
        return [];
      throw err;
    }
  }

  static storePosts(posts: PostModel[]) {
    return fs.promises.writeFile(
      this.postsDBPath,
      JSON.stringify(posts),
      'utf8',
    );
  }

  static addPost(newPost: PostModel) {
    return this.getPosts()
      .then((posts) => [...posts, newPost])
      .then((newPosts) => this.storePosts(newPosts));
  }

  static getPostsByAuthorId(userId: string) {
    return this.getPosts().then((posts) =>
      posts.filter((post: PostModel) => post.authorId === userId),
    );
  }

  static getPostById(postId: string) {
    return this.getPosts().then((posts) =>
      posts.find((post: PostModel) => post.id === postId),
    );
  }

  static deletePost(postId: string) {
    return this.getPosts()
      .then((posts) => posts.filter((post: PostModel) => post.id !== postId))
      .then((posts) => this.storePosts(posts));
  }

  static async updatePost(
    postId: string,
    newTitle: string,
    newDescription: string,
  ) {
    const posts = await this.getPosts();
    // prettier-ignore
    const updatedPosts: PostModel[] = posts.map((post: PostModel) =>
            post.id === postId
                ? new PostModel(
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
