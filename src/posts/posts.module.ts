import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModel } from './posts.entity';
import { User } from 'src/users/user.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([PostModel, User])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
