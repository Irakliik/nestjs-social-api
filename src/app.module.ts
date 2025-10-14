import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { HeadersMiddleware } from './headers/headers.middleware';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from 'logger/winston.config';
import { LikesModule } from './likes/likes.module';
import { PostsModule } from './posts/posts.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    WinstonModule.forRoot(winstonConfig),
    LikesModule,
    PostsModule,
    TypeOrmModule.forRoot(dataSourceOptions),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HeadersMiddleware).forRoutes('*');
  }
}
