import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  SignInCredentialsDto,
  SignUpCredentialsDto,
} from './auth-credentials.dto';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { Logger } from 'winston';
import * as winston from 'winston';
import { winstonConfig } from 'logger/winston.config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  private readonly logger: Logger;

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {
    this.logger = winston.createLogger(winstonConfig);
  }

  async signUp(signUpCredentialsDto: SignUpCredentialsDto) {
    const { firstName, lastName, email, password } = signUpCredentialsDto;

    const user = await this.usersService.getUserByEmail(email);
    if (user) {
      this.logger.error('User with this email already exists');
      throw new ConflictException('User with this email already exists');
    }
    const hash = await bcrypt.hash(password, 12);
    const newUser = { firstName, lastName, email, passwordHash: hash };
    await this.usersService.addUser(newUser);

    this.logger.info('User created successfully');

    return { message: 'User created successfully' };
  }

  async signIn(
    signInCredentialsDto: SignInCredentialsDto,
  ): Promise<{ accessToken: string; userId: string }> {
    const { email, password } = signInCredentialsDto;

    const user = await this.usersService.getUserByEmail(email);

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const payload: JwtPayload = { email, userId: user.id };
      const accessToken: string = await this.jwtService.signAsync(payload);

      this.logger.info('sent accessToken and userId successfully');
      return { accessToken, userId: user.id };
    } else {
      this.logger.error('credentials incorrect');

      throw new UnauthorizedException('Please check your login credentials');
    }
  }
}
