import fs from 'fs';
import crypto from 'crypto';
import { join } from 'path';
import srcFolderPath from 'src-folder-path';

export default class Like {
  constructor(
    readonly userId: string,
    readonly postId: string,
    readonly dateCreated: string = new Date().toUTCString(),
    readonly likeId: string = crypto.randomUUID(),
  ) {}

  static postsDBPath = join(srcFolderPath, 'database', 'likes.json');

  static async getLikes(): Promise<Like[]> {
    try {
      const dataStr = await fs.promises.readFile(this.postsDBPath, 'utf8');
      return dataStr.trim() ? (JSON.parse(dataStr) as Like[]) : [];
    } catch (err) {
      if (
        err instanceof Error &&
        (err as NodeJS.ErrnoException).code === 'ENOENT'
      )
        return [];
      throw err;
    }
  }

  static storeLikes(posts: Like[]) {
    return fs.promises.writeFile(
      this.postsDBPath,
      JSON.stringify(posts),
      'utf8',
    );
  }

  static async setLike(newLike: Like) {
    if (await this.checkLike(newLike.userId, newLike.postId)) {
      throw new Error(
        `User ${newLike.userId} already liked post ${newLike.postId}`,
      );
    }
    return this.getLikes()
      .then((likes) => [...likes, newLike])
      .then((newLikes) => this.storeLikes(newLikes));
  }

  static checkLike(userId: string, postId: string) {
    return this.getLikes().then((likes: Like[]) =>
      likes.some(
        (like: Like) => like.userId === userId && like.postId === postId,
      ),
    );
  }

  static async removeLike(userId: string, postId: string) {
    if (!(await this.checkLike(userId, postId))) {
      throw new Error(`No such like exists to remove`);
    }

    return this.getLikes()
      .then((likes) =>
        likes.filter(
          (like: Like) => like.userId !== userId || like.postId !== postId,
        ),
      )
      .then((likes) => this.storeLikes(likes));
  }
}
