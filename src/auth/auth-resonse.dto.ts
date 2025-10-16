import { ApiProperty } from '@nestjs/swagger';

export class UnauthorizedResponse {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({ example: 'Please check your login credentials' })
  message: string;

  @ApiProperty({ example: 'Unauthorized' })
  error: string;
}

export class ConflictResponse {
  @ApiProperty({ example: 409 })
  statusCode: number = 409;

  @ApiProperty({ example: 'User with this email already exists' })
  message: string = 'User with this email already exists';

  @ApiProperty({ example: 'Conflict' })
  error: string = 'Conflict';
}
