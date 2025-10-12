import { Module } from '@nestjs/common';
import { LikesController } from './likes.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [LikesController],
  providers: [],
})
export class LikesModule {}
