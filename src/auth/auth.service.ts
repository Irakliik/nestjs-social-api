import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  SignInCredentialsDto,
  SignUpCredentialsDto,
} from './auth-credentials.dto';
import User from 'src/models/users';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { Logger } from 'winston';
import * as winston from 'winston';
import { winstonConfig } from 'logger/winston.config';

@Injectable()
export class AuthService {
  private readonly logger: Logger;

  constructor(private jwtService: JwtService) {
    this.logger = winston.createLogger(winstonConfig);
  }

  async signUp(signUpCredentialsDto: SignUpCredentialsDto) {
    const { firstName, lastName, email, password } = signUpCredentialsDto;

    const users = await User.getUsers();
    if (users.some((user: User) => user.email === email)) {
      this.logger.error('User with this email already exists');
      throw new ConflictException('User with this email already exists');
    }
    const hash = await bcrypt.hash(password, 12);
    const newUser = new User(firstName, lastName, email, hash);
    await User.addUser(newUser);

    this.logger.info('User created successfully');

    return { message: 'User created successfully' };
  }

  async signIn(
    signInCredentialsDto: SignInCredentialsDto,
  ): Promise<{ accessToken: string; userId: string }> {
    const { email, password } = signInCredentialsDto;

    const user = await User.getUserByEmail(email);

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
