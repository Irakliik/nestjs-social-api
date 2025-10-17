import { Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.guards';
import { GetUser } from 'src/auth/get-user.decorator';
import type { JwtPayload } from 'src/auth/jwt-payload.interface';

import { Logger } from 'winston';
import * as winston from 'winston';
import { winstonConfig } from 'logger/winston.config';
import { LikesService } from './likes.service';
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import {
  LikesConflictResponse,
  LikesNotFoundResponse,
} from './likes-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('users/posts/:postId/likes')
export class LikesController {
  private readonly logger: Logger;
  constructor(private likesService: LikesService) {
    this.logger = winston.createLogger(winstonConfig);
  }

  @ApiOkResponse({
    description: 'Like set successfully',
    schema: {
      example: {
        message: 'Like set successfully',
      },
    },
  })
  @Post()
  @ApiConflictResponse({
    description: 'You already liked this post',
    type: LikesConflictResponse,
  })
  @ApiParam({
    name: 'postId',
    description: 'ID of the post',
    example: '123abc',
  })
  async setLike(
    @GetUser() userPayload: JwtPayload,
    @Param('postId') postId: string,
  ) {
    const userId = userPayload.userId;
    await this.likesService.setLike(userId, postId);

    this.logger.info('Like set successfully');
    return { message: 'Like set successfully' };
  }

  @ApiParam({
    name: 'postId',
    description: 'ID of the post',
    example: '123abc',
  })
  @ApiOkResponse({
    description: 'Like removed successfully',
    schema: {
      example: {
        message: 'Like removed successfully',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'No such like exists',
    type: LikesNotFoundResponse,
  })
  @Delete()
  async removeLike(
    @GetUser() userPayload: JwtPayload,
    @Param('postId') postId: string,
  ) {
    const userId = userPayload.userId;

    await this.likesService.removeLike(userId, postId);

    this.logger.info('Like removed successfully');

    return { message: 'Like removed successfully' };
  }
}
