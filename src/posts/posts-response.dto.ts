import { ApiProperty } from '@nestjs/swagger';

export class PostDto {
  @ApiProperty({ example: 'My first post' })
  title: string;

  @ApiProperty({ example: 'This is a post description' })
  description: string;

  @ApiProperty({ example: '2025-10-17T00:00:00.000Z' })
  dateCreated: Date;

  @ApiProperty({ example: '123abc' })
  postId: string;

  @ApiProperty({ example: 'John Doe' })
  authorName: string;
}

export class PaginatedPostsResponse {
  @ApiProperty({ type: [PostDto] })
  data: PostDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: 2, nullable: true })
  next: number | null;

  @ApiProperty({ example: null, nullable: true })
  previous: number | null;
}

export class PostNotFoundResponse {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'Post with this ID not found' })
  message: string;

  @ApiProperty({ example: 'Not Found' })
  error: string;
}

export class UpdateForbiddenResponse {
  @ApiProperty({ example: 403 })
  statusCode: number;

  @ApiProperty({ example: 'You do not have permission to update this post' })
  message: string;

  @ApiProperty({ example: 'Forbidden' })
  error: string;
}
export class DeleteForbiddenResponse {
  @ApiProperty({ example: 403 })
  statusCode: number;

  @ApiProperty({ example: 'You do not have permission to delete this post' })
  message: string;

  @ApiProperty({ example: 'Forbidden' })
  error: string;
}
