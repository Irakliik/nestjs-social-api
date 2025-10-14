import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './users.dtos';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  getUsers(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async addUser(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create({
      ...createUserDto,
      passwordHash: createUserDto.password,
    });

    await this.usersRepository.save(user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: {
        email: email,
      },
    });

    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: {
        id: id,
      },
    });

    return user;
  }

  async updateUser(id: string, newFirstName: string, newLastName: string) {
    const result = await this.usersRepository.update(id, {
      firstName: newFirstName,
      lastName: newLastName,
    });

    return result;
  }
}
