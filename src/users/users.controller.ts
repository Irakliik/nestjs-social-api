import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.guards';
import { GetUser } from 'src/auth/get-user.decorator';
import type { JwtPayload } from 'src/auth/jwt-payload.interface';
import { UpdateUserDto, UserPostWithLikes } from './users.dtos';
import { Logger } from 'winston';
import * as winston from 'winston';
import { winstonConfig } from 'logger/winston.config';

import nodemailer from 'nodemailer';
import sendgridTransports from 'nodemailer-sendgrid-transport';
import { UsersService } from './users.service';

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
  async getFirstPost(): Promise<UserPostWithLikes[]> {
    const res = await this.usersService.getFirstPost();

    this.logger.info('first posts of each user sent successfully');

    return res;
  }
}
