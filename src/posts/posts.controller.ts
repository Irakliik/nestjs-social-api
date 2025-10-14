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
import { Logger } from 'winston';
import * as winston from 'winston';
import { winstonConfig } from 'logger/winston.config';
import { PostsService } from './posts.service';

@UseGuards(JwtAuthGuard)
@Controller('users/posts')
export class PostsController {
  private readonly logger: Logger;
  constructor(private postsService: PostsService) {
    this.logger = winston.createLogger(winstonConfig);
  }

  @Get('/feed')
  async getFeed(@GetUser() userPayload: JwtPayload) {
    const userId = userPayload.userId;
    const posts = this.postsService.getFeed(userId);

    this.logger.info('Sent posts successfully');
    return posts;
  }

  @Get()
  async getPosts(@GetUser() userPayload: JwtPayload) {
    const userId = userPayload.userId;

    const posts = await this.postsService.getPosts(userId);

    this.logger.info('Posts Sent successfully');

    return posts;
  }

  @Post()
  async createPost(
    @GetUser() user: JwtPayload,
    @Body() createPostBody: CreatePostBody,
  ) {
    await this.postsService.addPost(user.userId, createPostBody);

    this.logger.info('Post added successfully');
    return { message: 'Post added successfully' };
  }

  @Put('/:postId')
  async updatePost(
    @GetUser() userPayload: JwtPayload,
    @Param('postId') postId: string,
    @Body() updatedPost: UpdatePostBody,
  ) {
    await this.postsService.updatePost(postId, userPayload.userId, updatedPost);

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
