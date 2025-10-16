import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponse {
  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;
}

export class NotFoundResponse {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'User with this ID not found' })
  message: string;

  @ApiProperty({ example: 'Not Found' })
  error: string;
}

export class InternalServerErrorResponse {
  @ApiProperty({ example: 500 })
  statusCode: number;

  @ApiProperty({ example: 'Failed to update user' })
  message: string;

  @ApiProperty({ example: 'Internal Server Error' })
  error: string;
}
