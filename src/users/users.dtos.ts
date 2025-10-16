import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Johnny',
  })
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
  @ApiProperty({
    example: 'Doy',
  })
  lastName: string;
}

export class CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserPostWithLikes {
  firstName: string;
  lastName: string;
  title: string;
  description: string;
  numLikes: number;
}

export class FirstPostsReqQuery {
  page?: string;

  limit?: string;

  order?: 'ASC' | 'DESC';

  filter?: string;
}
