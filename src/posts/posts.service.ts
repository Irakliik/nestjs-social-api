import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostModel } from './posts.entity';
import { Repository } from 'typeorm';
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

  async getFeed(
    userId: string,
    page = 1,
    limit = 10,
    order: 'ASC' | 'DESC' = 'ASC',
  ) {
    const pagRes = await this.getPaginatedPosts(page, limit, order);

    const { total, totalPages, next, previous, data } = pagRes;
    console.log(data);

    const mappedPosts = data.map((post: PostModel) => {
      const {
        title,
        description,
        dateCreated,
        id: postId,
        author: { firstName, lastName },
      } = post;

      const res = {
        title,
        description,
        dateCreated,
        postId,
        authroName: firstName + ' ' + lastName,
      };

      return res;
    });

    const result = {
      total,
      totalPages,
      next,
      previous,
      data: mappedPosts,
    };
    return result;
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

  async deletePost(postId: string, userId: string) {
    try {
      const post = await this.postsRepository.findOne({
        where: { id: postId },
        relations: ['author'],
      });

      if (!post) {
        this.logger.error(`Post with id ${postId} not found`);
        throw new NotFoundException(`Post with id ${postId} not found`);
      }

      if (post.author.id !== userId) {
        this.logger.error('You do not have permission to delete this post');
        throw new ForbiddenException(
          'You do not have permission to delete this post',
        );
      }

      const res = await this.postsRepository.delete({ id: postId });

      return res;
    } catch {
      throw new InternalServerErrorException('Failed to delete the post');
    }
  }

  async getPaginatedPosts(page = 1, limit = 10, order: 'ASC' | 'DESC' = 'ASC') {
    const [posts, total] = await this.postsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { dateCreated: order },
    });

    const totalPages = Math.ceil(total / limit);

    const nextPage = page < totalPages ? page + 1 : null;
    const previousPage = page > 1 ? page - 1 : null;

    const pagination = {
      total,
      limit,
      page,
      totalPages,
      next: nextPage,
      previous: previousPage,
      data: posts,
    };

    return pagination;
  }
}
