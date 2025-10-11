import fs from 'fs';
import crypto from 'crypto';
import srcFolderPath from 'src-folder-path';
import { join } from 'path';
export default class User {
  constructor(
    readonly firstName: string,
    readonly lastName: string,
    public email: string,
    readonly passwordHash: string,
    readonly id: string = crypto.randomUUID(),
  ) {}

  static usersDBPath = join(srcFolderPath, 'database', 'users.json');

  static async getUsers(): Promise<User[]> {
    try {
      const dataStr = await fs.promises.readFile(this.usersDBPath, 'utf8');
      return dataStr.trim() ? (JSON.parse(dataStr) as User[]) : [];
    } catch (err) {
      if (
        err instanceof Error &&
        (err as NodeJS.ErrnoException).code === 'ENOENT'
      )
        return [];
      throw err;
    }
  }

  static storeUsers(users: User[]) {
    return fs.promises.writeFile(
      this.usersDBPath,
      JSON.stringify(users),
      'utf8',
    );
  }

  static addUser(newUser: User) {
    return this.getUsers()
      .then((users) => [...users, newUser])
      .then((newUsers) => this.storeUsers(newUsers));
  }

  static getUserByEmail(email: string) {
    return this.getUsers().then((users) =>
      users.find((user: User) => user.email === email),
    );
  }

  static getUserById(id: string) {
    return this.getUsers().then((users) =>
      users.find((user: User) => user.id === id),
    );
  }

  static updateUser(id: string, newFirstName: string, newLastName: string) {
    return this.getUsers()
      .then((users) => {
        const updatedUsers: User[] = users.map((user: User) => {
          if (user.id === id) {
            return new User(
              newFirstName,
              newLastName,
              user.email,
              user.passwordHash,
              user.id,
            );
          } else {
            return user;
          }
        });

        return updatedUsers;
      })
      .then((updatedUsers) => this.storeUsers(updatedUsers));
  }
}
