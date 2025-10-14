import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './likes.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { PostModel } from 'src/posts/posts.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like) private likesRepository: Repository<Like>,
    @InjectRepository(PostModel) private postsRepository: Repository<PostModel>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async setLike(userId: string, postId: string) {
    const existingLike = await this.likesRepository.findOne({
      where: {
        user: { id: userId },
        post: { id: postId },
      },
    });

    if (existingLike) {
      throw new ConflictException('You already liked this post');
    }

    console.log(existingLike);

    const newLike = this.likesRepository.create({
      user: { id: userId },
      post: { id: postId },
    });

    const res = await this.likesRepository.save(newLike);
    return res;
  }

  async removeLike(userId: string, postId: string) {
    const existingLike = await this.likesRepository.findOne({
      where: {
        user: { id: userId },
        post: { id: postId },
      },
    });

    if (!existingLike) {
      throw new ConflictException('No such like exists');
    }

    const res = await this.likesRepository.delete(existingLike.id);

    return res;
  }
}
