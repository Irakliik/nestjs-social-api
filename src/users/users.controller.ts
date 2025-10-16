import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.guards';
import { GetUser } from 'src/auth/get-user.decorator';
import type { JwtPayload } from 'src/auth/jwt-payload.interface';
import { UpdateUserDto } from './users.dtos';
import type { FirstPostsReqQuery } from './users.dtos';
import { Logger } from 'winston';
import * as winston from 'winston';
import { winstonConfig } from 'logger/winston.config';

import nodemailer from 'nodemailer';
import sendgridTransports from 'nodemailer-sendgrid-transport';
import { UsersService } from './users.service';
import {
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiQuery,
} from '@nestjs/swagger';
import {
  UserProfileResponse,
  NotFoundResponse,
  InternalServerErrorResponse,
} from './users-respnse.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  private readonly logger: Logger;
  private nodemailer: nodemailer.Transporter;

  constructor(private usersService: UsersService) {
    this.logger = winston.createLogger(winstonConfig);

    // NODEMAILER
    this.nodemailer = nodemailer.createTransport(
      sendgridTransports({
        auth: {
          api_key: process.env.SENDGRID_API_KEY,
        },
      }) as unknown as nodemailer.TransportOptions,
    );
    // NODEMAILER --------------
  }

  @Get('/profile')
  @ApiOkResponse({
    description: 'User profile retrieved successfully',
    type: UserProfileResponse,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: NotFoundResponse,
  })
  async getUserProfile(@GetUser() userPayload: JwtPayload) {
    const userId = userPayload.userId;

    const user = await this.usersService.getUserById(userId);

    if (!user) {
      this.logger.error(`User with ID ${userId} not found`);

      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    this.logger.info('user sent successfully');
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
  }

  @Put('/profile')
  @ApiOkResponse({
    description: 'user updated successfully',
    schema: {
      example: {
        message: 'user updated successfully',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to update user',
    type: InternalServerErrorResponse,
  })
  async updateUserProfile(
    @Body() updatedUser: UpdateUserDto,
    @GetUser() userPayload: JwtPayload,
  ) {
    const { firstName, lastName } = updatedUser;
    const { userId } = userPayload;

    try {
      const result = await this.usersService.updateUser(
        userId,
        firstName,
        lastName,
      );

      if (!result.affected) {
        throw new Error();
      }
    } catch {
      this.logger.error('Failed to update user');
      throw new InternalServerErrorException('Failed to update user');
    }

    // NODEMAILER
    try {
      await this.nodemailer.sendMail({
        to: userPayload.email,
        from: process.env.ORG_EMAIL,
        subject: 'Update Succeded!',
        html: '<h1>You successfully updated!</h1>',
      });
    } catch (err) {
      console.log(err);
    }
    // ---------------

    this.logger.info('user updated successfully');

    return { message: 'user updated successfully' };
  }

  @Get('/first-posts')
  @ApiOkResponse({
    description: 'first posts of each user sent successfully',
    schema: {
      example: {
        message: 'first posts of each user sent successfully',
      },
    },
  })
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
  async getFirstPost(@Query() query: FirstPostsReqQuery) {
    const { page, limit, order, filter } = query;

    const res = await this.usersService.getPaginatedFirstPosts(
      parseInt(page || '1'),
      parseInt(limit || '5'),
      order || 'ASC',
      filter,
    );

    this.logger.info('first posts of each user sent successfully');

    return res;
  }
}
