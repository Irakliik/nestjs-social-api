import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PostsController],
  providers: [],
})
export class PostsModule {}
