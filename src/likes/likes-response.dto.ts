import { ApiProperty } from '@nestjs/swagger';

export class LikesConflictResponse {
  @ApiProperty({ example: 409 })
  statusCode: number;

  @ApiProperty({ example: 'You already liked this post' })
  message: string;

  @ApiProperty({ example: 'Conflict' })
  error: string;
}

export class LikesNotFoundResponse {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'No such like exists' })
  message: string;

  @ApiProperty({ example: 'Not Found' })
  error: string;
}
