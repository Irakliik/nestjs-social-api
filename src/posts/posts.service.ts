import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostModel } from './posts.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { CreatePostBody } from './posts.dtos';
import winston, { Logger } from 'winston';
import { winstonConfig } from 'logger/winston.config';

@Injectable()
export class PostsService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(PostModel) private postsRepository: Repository<PostModel>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {
    this.logger = winston.createLogger(winstonConfig);
  }

  async addPost(userId: string, createPostBody: CreatePostBody) {
    const { title, description } = createPostBody;
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const newPost = this.postsRepository.create({
      title,
      description,
    });

    newPost.author = user;

    const res = await this.postsRepository.save(newPost);

    return res;
  }

  async getPosts(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['posts'],
    });
    if (!user) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    try {
      const postsArr = user.posts;
      console.log(postsArr);

      const posts = postsArr.map((post) => {
        const { title, description, dateCreated } = post;
        const authorName = user.firstName + ' ' + user.lastName;

        return { title, description, dateCreated, authorName };
      });

      return posts;
    } catch {
      this.logger.error('failed to fetch posts');

      throw new InternalServerErrorException('failed to fetch posts');
    }
  }
}
