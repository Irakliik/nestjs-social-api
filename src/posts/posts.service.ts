import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostModel } from './posts.entity';
import { Like, Repository } from 'typeorm';
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

  async getPosts(
    userId: string,
    page = 1,
    limit = 10,
    order: 'ASC' | 'DESC' = 'ASC',
    filter?: string,
  ) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    try {
      const pagRes = await this.getPaginatedPostsUser(
        userId,
        page,
        limit,
        order,
        filter,
      );

      const posts = pagRes.data.map((post) => {
        const {
          title,
          description,
          dateCreated,
          id,
          author: { firstName, lastName },
        } = post;
        const authorName = firstName + ' ' + lastName;

        return { title, description, dateCreated, authorName, postId: id };
      });

      return { ...pagRes, data: posts };
    } catch {
      this.logger.error('failed to fetch posts');

      throw new InternalServerErrorException('failed to fetch posts');
    }
  }

  async getFeed(
    page = 1,
    limit = 10,
    order: 'ASC' | 'DESC' = 'ASC',
    filter?: string,
  ) {
    const pagRes = await this.getPaginatedPostsFeed(page, limit, order, filter);

    const mappedPosts = pagRes.data.map((post: PostModel) => {
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

    return { ...pagRes, data: mappedPosts };
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

  async getPaginatedPostsUser(
    userId: string,
    page = 1,
    limit = 10,
    order: 'ASC' | 'DESC' = 'ASC',
    filter: string | undefined,
  ) {
    const keyword = `%${filter}%`;
    const condition = filter
      ? [
          { author: { id: userId }, title: Like(keyword) },
          { author: { id: userId }, description: Like(keyword) },
          { author: { id: userId, firstName: Like(keyword) } },
          { author: { id: userId, lastName: Like(keyword) } },
        ]
      : { author: { id: userId } };

    const [posts, total] = await this.postsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { dateCreated: order },
      relations: ['author'],
      where: condition,
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

  async getPaginatedPostsFeed(
    page = 1,
    limit = 10,
    order: 'ASC' | 'DESC' = 'ASC',
    filter: string | undefined,
  ) {
    const keyword = `%${filter}%`;
    const condition = filter
      ? [
          { title: Like(keyword) },
          { description: Like(keyword) },
          { author: { firstName: Like(keyword) } },
          { author: { lastName: Like(keyword) } },
        ]
      : [];

    const [posts, total] = await this.postsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { dateCreated: order },
      relations: ['author'],
      ...(filter && { where: condition }),
    });

    console.log(posts);

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
