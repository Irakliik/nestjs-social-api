import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostModel } from './posts.entity';
import { Not, Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { CreatePostBody, UpdatePostBody } from './posts.dtos';
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
        const { title, description, dateCreated, id } = post;
        const authorName = user.firstName + ' ' + user.lastName;

        return { title, description, dateCreated, authorName, postId: id };
      });

      return posts;
    } catch {
      this.logger.error('failed to fetch posts');

      throw new InternalServerErrorException('failed to fetch posts');
    }
  }

  async getFeed(userId: string) {
    const posts = await this.postsRepository.find({
      where: {
        author: {
          id: Not(userId),
        },
      },
      relations: ['author'],
      order: { dateCreated: 'DESC' },
    });

    const mappedPosts = posts.map((post: PostModel) => {
      const {
        title,
        description,
        dateCreated,
        id: postId,
        author: { firstName, lastName },
      } = post;

      return {
        title,
        description,
        dateCreated,
        postId,
        authroName: firstName + ' ' + lastName,
      };
    });

    return mappedPosts;
  }

  async updatePost(
    postId: string,
    userId: string,
    updatedPost: UpdatePostBody,
  ) {
    try {
      const post = await this.postsRepository.findOne({
        where: { id: postId },
        relations: ['author'],
      });
      console.log(postId);

      if (!post) {
        this.logger.error(`Post with id ${postId} not found`);
        throw new NotFoundException(`Post with id ${postId} not found`);
      }

      if (post.author.id !== userId) {
        this.logger.error('You do not have permission to update this post');
        throw new ForbiddenException(
          'You do not have permission to update this post',
        );
      }

      const { title, description } = updatedPost;

      const res = await this.postsRepository.update(
        { id: postId },
        { title, description },
      );

      return res;
    } catch {
      throw new InternalServerErrorException('Failed to update the post');
    }
  }
}
