import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.guards';
import { GetUser } from 'src/auth/get-user.decorator';
import type { JwtPayload } from 'src/auth/jwt-payload.interface';
import type { CreatePostBody, UpdatePostBody } from './posts.dtos';
import PostModel from 'src/models/posts';
import User from 'src/models/users';
import { Logger } from 'winston';
import * as winston from 'winston';
import { winstonConfig } from 'logger/winston.config';

@UseGuards(JwtAuthGuard)
@Controller('users/posts')
export class PostsController {
  private readonly logger: Logger;
  constructor() {
    this.logger = winston.createLogger(winstonConfig);
  }

  @Get('/feed')
  async getFeed(@GetUser() userPayload: JwtPayload) {
    const userId = userPayload.userId;
    const postsArr = await PostModel.getPosts();
    const filderedPostsArr = postsArr.filter(
      (post: PostModel) => post.authorId !== userId,
    );

    const posts = await Promise.all(
      filderedPostsArr.map(async (post: PostModel) => {
        const { title, description, dateCreated, authorId, id } = post;

        const author = await User.getUserById(authorId);

        if (!author) {
          this.logger.error(`Author with id ${authorId} not found`);

          throw new NotFoundException(`Author with id ${authorId} not found`);
        }

        const authorName = author.firstName + ' ' + author.lastName;
        return { title, description, dateCreated, authorName, postId: id };
      }),
    );

    this.logger.info('Sent posts successfully');
    return posts;
  }

  @Get()
  async getPosts(@GetUser() userPayload: JwtPayload) {
    const userId = userPayload.userId;

    const user = await User.getUserById(userId);
    if (!user) {
      this.logger.error(`user with ID ${userId} not found`);
      throw new InternalServerErrorException(
        `user with ID ${userId} not found`,
      );
    }

    const postsArr = await PostModel.getPostsByAuthorId(userId);

    const posts = postsArr.map((post) => {
      const { title, description, dateCreated } = post;
      const authorName = user.firstName + ' ' + user.lastName;

      this.logger.info('Sent post successfully');
      return { title, description, dateCreated, authorName };
    });

    return posts;
  }

  @Post()
  async createPost(
    @GetUser() user: JwtPayload,
    @Body() createPostBody: CreatePostBody,
  ) {
    const userId = user.userId;

    const { title, description } = createPostBody;

    const newPost = new PostModel(title, description, userId);

    try {
      await PostModel.addPost(newPost);
    } catch {
      this.logger.error('Failed to add a post');
      throw new InternalServerErrorException('Failed to add a post');
    }

    this.logger.info('Post added successfully');
    return { message: 'Post added successfully' };
  }

  @Put('/:postId')
  async updatePost(
    @GetUser() userPayload: JwtPayload,
    @Param('postId') postId: string,
    @Body() updatedPost: UpdatePostBody,
  ) {
    const post = await PostModel.getPostById(postId);
    if (!post) {
      this.logger.error(`Post with id ${postId} not found`);
      throw new NotFoundException(`Post with id ${postId} not found`);
    }

    if (post.authorId !== userPayload.userId) {
      this.logger.error('You do not have permission to update this post');
      throw new ForbiddenException(
        'You do not have permission to update this post',
      );
    }

    const { title, description } = updatedPost;

    await PostModel.updatePost(postId, title, description).catch(() => {
      this.logger.error('Failed to update the post');

      throw new InternalServerErrorException('Failed to update the post');
    });

    this.logger.info('Post updated successfully');
    return { message: 'Post updated successfully' };
  }

  @Delete('/:postId')
  async deletePost(
    @GetUser() userPayload: JwtPayload,
    @Param('postId') postId: string,
  ) {
    const post = await PostModel.getPostById(postId);
    if (!post) {
      this.logger.error(`Post with id ${postId} not found`);

      throw new NotFoundException(`Post with id ${postId} not found`);
    }

    if (post.authorId !== userPayload.userId) {
      this.logger.error('You do not have permission to delete this post');

      throw new ForbiddenException(
        'You do not have permission to delete this post',
      );
    }

    await PostModel.deletePost(postId).catch(() => {
      this.logger.error('Failed to delete the post');
      throw new InternalServerErrorException('Failed to delete the post');
    });

    this.logger.info('Post Deleted Successfully');
    return { message: 'Post Deleted Successfully' };
  }
}
