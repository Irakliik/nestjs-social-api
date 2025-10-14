import { Module } from '@nestjs/common';
import { LikesController } from './likes.controller';
import { AuthModule } from 'src/auth/auth.module';
import { LikesService } from './likes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './likes.entity';
import { User } from 'src/users/user.entity';
import { PostModel } from 'src/posts/posts.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Like, User, PostModel])],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
