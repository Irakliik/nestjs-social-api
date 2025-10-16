import { Body, Controller, Post } from '@nestjs/common';
import {
  SignInCredentialsDto,
  SignUpCredentialsDto,
} from './auth-credentials.dto';
import { AuthService } from './auth.service';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ConflictResponse, UnauthorizedResponse } from './resonse.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @ApiCreatedResponse({
    description: 'User created successfully',
    schema: {
      example: {
        message: 'User created successfully',
      },
    },
  })
  @ApiConflictResponse({
    description: 'User with this email already exists',
    type: ConflictResponse,
  })
  signUp(@Body() signUpCredentialsDto: SignUpCredentialsDto) {
    return this.authService.signUp(signUpCredentialsDto);
  }

  @Post('/signin')
  @ApiOkResponse({
    description: 'sent accessToken and userId successfully',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbW...',
        userId: 'uuid1',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'credentials incorrect',
    type: UnauthorizedResponse,
  })
  signIn(
    @Body() signInCredentialsDto: SignInCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(signInCredentialsDto);
  }
}
