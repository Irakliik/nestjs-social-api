import { IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
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
