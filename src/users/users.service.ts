import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, UserPostWithLikes } from './users.dtos';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private dataSource: DataSource,
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

  async getPaginatedFirstPosts(
    page = 1,
    limit = 5,
    order: 'ASC' | 'DESC' = 'ASC',
    filter?: string,
  ) {
    if (filter) page = 1;

    const offset = (page - 1) * limit;

    const keyword = `%${filter}%`;

    const fitleringPart = filter
      ? 'HAVING CONCAT(firstName, lastName, title, description) LIKE ?'
      : '';

    const res: UserPostWithLikes[] = await this.dataSource.query(
      `SELECT users.firstName, users.lastName, posts.title, posts.description, COUNT(likes.id) AS numLikes
FROM users
INNER JOIN posts ON users.id = posts.authorId
LEFT JOIN likes ON likes.postId = posts.id
WHERE posts.dateCreated = (
    SELECT MIN(posts2.dateCreated)
    FROM posts AS posts2
    WHERE posts2.authorId = users.id
)
GROUP BY users.firstName, users.lastName, posts.title, posts.description, posts.dateCreated ${fitleringPart} ORDER BY posts.dateCreated 
${order === 'ASC' ? 'ASC' : 'DESC'} LIMIT ? OFFSET ? 
;`,
      filter ? [keyword, limit, offset] : [limit, offset],
    );

    const total: { total: number }[] = await this.dataSource.query(`SELECT 
 COUNT(*) AS total 
FROM users
INNER JOIN posts 
  ON users.id = posts.authorId
WHERE posts.dateCreated = (
  SELECT MIN(posts.dateCreated)
  FROM posts
  WHERE posts.authorId = users.id
);`);

    const totalPages = Math.ceil(+total[0].total / limit);

    const nextPage = page < totalPages ? page + 1 : null;
    const previousPage = page > 1 ? page - 1 : null;

    const pagination = {
      total: +total[0].total,
      limit,
      page,
      totalPages,
      next: nextPage,
      previous: previousPage,
      data: res,
    };

    return pagination;
  }
}
