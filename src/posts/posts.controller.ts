import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.guards';
import { GetUser } from 'src/auth/get-user.decorator';
import type { JwtPayload } from 'src/auth/jwt-payload.interface';
import { CreatePostBody, FeedReqQuery, UpdatePostBody } from './posts.dtos';
import { Logger } from 'winston';
import * as winston from 'winston';
import { winstonConfig } from 'logger/winston.config';
import { PostsService } from './posts.service';
import {
  ApiBody,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  DeleteForbiddenResponse,
  PaginatedPostsResponse,
  PostNotFoundResponse,
  UpdateForbiddenResponse,
} from './posts-response.dto';
import {
  InternalServerErrorResponse,
  NotFoundResponse,
} from 'src/users/users-respnse.dto';

@UseGuards(JwtAuthGuard)
@Controller('users/posts')
export class PostsController {
  private readonly logger: Logger;
  constructor(private postsService: PostsService) {
    this.logger = winston.createLogger(winstonConfig);
  }

  @ApiQuery({
    name: 'page',
    required: false,
    example: '1',
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: '5',
    description: 'Posts per page',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    example: 'ASC',
    description: 'Sort order (ASC or DESC)',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    example: 'john',
    description: 'Filter posts by keyword',
  })
  @ApiOkResponse({
    description: 'Sent posts successfully',
    type: PaginatedPostsResponse,
  })
  @Get('/feed')
  async getFeed(
    @GetUser() userPayload: JwtPayload,
    @Query() query: FeedReqQuery,
  ) {
    // const userId = userPayload.userId;

    const { page, limit, order, filter } = query;

    const posts = this.postsService.getFeed(
      parseInt(page),
      parseInt(limit),
      order,
      filter,
    );

    this.logger.info('Sent posts successfully');
    return posts;
  }

  @ApiQuery({
    name: 'page',
    required: false,
    example: '1',
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: '5',
    description: 'Posts per page',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    example: 'ASC',
    description: 'Sort order (ASC or DESC)',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    example: 'john',
    description: 'Filter posts by keyword',
  })
  @ApiOkResponse({
    description: 'Sent posts successfully',
    type: PaginatedPostsResponse,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: NotFoundResponse,
  })
  @ApiInternalServerErrorResponse({
    description: 'failed to fetch posts',
    type: InternalServerErrorResponse,
  })
  @Get()
  async getPosts(
    @GetUser() userPayload: JwtPayload,
    @Query() query: FeedReqQuery,
  ) {
    const userId = userPayload.userId;
    const { page, limit, order, filter } = query;

    const posts = await this.postsService.getPosts(
      userId,
      parseInt(page),
      parseInt(limit),
      order,
      filter,
    );

    this.logger.info('Posts Sent successfully');

    return posts;
  }

  @ApiBody({ type: CreatePostBody })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: NotFoundResponse,
  })
  @ApiOkResponse({
    description: 'Post added successfully',
    schema: {
      example: {
        message: 'Post added successfully',
      },
    },
  })
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
  @ApiBody({ type: UpdatePostBody })
  @ApiParam({
    name: 'postId',
    description: 'ID of the post',
    example: '123abc',
  })
  @ApiOkResponse({
    description: 'Post updated successfully',
    schema: {
      example: {
        message: 'Post updated successfully',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: PostNotFoundResponse,
  })
  @ApiForbiddenResponse({
    description: 'You do not have permission to update this post',
    type: UpdateForbiddenResponse,
  })
  async updatePost(
    @GetUser() userPayload: JwtPayload,
    @Param('postId') postId: string,
    @Body() updatedPost: UpdatePostBody,
  ) {
    await this.postsService.updatePost(postId, userPayload.userId, updatedPost);

    this.logger.info('Post updated successfully');
    return { message: 'Post updated successfully' };
  }

  @ApiNotFoundResponse({
    description: 'User not found',
    type: PostNotFoundResponse,
  })
  @ApiParam({
    name: 'postId',
    description: 'ID of the post',
    example: '123abc',
  })
  @ApiOkResponse({
    description: 'Post deleted successfully',
    schema: {
      example: {
        message: 'Post deleted successfully',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'You do not have permission to delete this post',
    type: DeleteForbiddenResponse,
  })
  @Delete('/:postId')
  async deletePost(
    @GetUser() userPayload: JwtPayload,
    @Param('postId') postId: string,
  ) {
    await this.postsService.deletePost(postId, userPayload.userId);

    this.logger.info('Post Deleted Successfully');
    return { message: 'Post Deleted Successfully' };
  }
}
