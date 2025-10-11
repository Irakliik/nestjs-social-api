import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInCredentialsDto {
  @IsEmail()
  email: string;
  password: string;
}

export class SignUpCredentialsDto {
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
  lastName: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  password: string;
}
