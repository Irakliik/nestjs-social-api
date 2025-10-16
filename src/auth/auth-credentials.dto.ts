import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInCredentialsDto {
  @ApiProperty({ example: 'john123', description: 'User password' })
  @IsEmail()
  email: string;
  @ApiProperty({ example: 'john123', description: 'User password' })
  @IsNotEmpty()
  password: string;
}

export class SignUpCredentialsDto {
  @ApiProperty({
    example: 'John',
    description: "User's first name",
  })
  @IsNotEmpty()
  firstName: string;
  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @IsNotEmpty()
  lastName: string;
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @ApiProperty({ example: 'john@example.com', description: 'User password' })
  @IsNotEmpty()
  password: string;
}
