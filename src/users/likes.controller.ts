import {
  ConflictException,
  Controller,
  Delete,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.guards';
import { GetUser } from 'src/auth/get-user.decorator';
import type { JwtPayload } from 'src/auth/jwt-payload.interface';
import Like from 'src/models/likes';

import { Logger } from 'winston';
import * as winston from 'winston';
import { winstonConfig } from 'logger/winston.config';

@UseGuards(JwtAuthGuard)
@Controller('users/posts/:postId/likes')
export class LikesController {
  private readonly logger: Logger;
  constructor() {
    this.logger = winston.createLogger(winstonConfig);
  }

  @Post()
  async setLike(
    @GetUser() userPayload: JwtPayload,
    @Param('postId') postId: string,
  ) {
    const userId = userPayload.userId;

    const newLike = new Like(userId, postId);
    try {
      await Like.setLike(newLike); // wait for it
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('already liked')) {
          this.logger.error(err.message);
          throw new ConflictException(err.message);
        }

        this.logger.error('Failed to set a like');

        throw new InternalServerErrorException('Failed to set a like');
      }
    }

    this.logger.info('Like set successfully');
    return { message: 'Like set successfully' };
  }

  @Delete()
  async removeLike(
    @GetUser() userPayload: JwtPayload,
    @Param('postId') postId: string,
  ) {
    const userId = userPayload.userId;

    try {
      await Like.removeLike(userId, postId);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('No such like')) {
          this.logger.error(err.message);

          throw new NotFoundException(err.message);
        }

        this.logger.error('Failed to remove a like');

        throw new InternalServerErrorException('Failed to remove a like');
      }
    }

    this.logger.info('Like removed successfully');

    return { message: 'Like removed successfully' };
  }
}
