import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreatePostBody {
  @ApiProperty({ example: 'My first post' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'This is the content of my first post',
  })
  @IsNotEmpty()
  description: string;
}

export class UpdatePostBody {
  @ApiProperty({ example: 'updated post' })
  @IsNotEmpty()
  title: string;
  @ApiProperty({ example: 'some updated post' })
  @IsNotEmpty()
  description: string;
}

export class FeedReqQuery {
  page: string;
  limit: string;
  order: 'ASC' | 'DESC';
  filter: string | undefined;
}
