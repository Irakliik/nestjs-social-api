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
