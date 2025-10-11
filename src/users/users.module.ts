import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PostsController } from './posts.controller';
import { LikesController } from './likes.controller';

@Module({
  imports: [AuthModule],
  controllers: [UsersController, PostsController, LikesController],
  providers: [],
})
export class UsersModule {}
