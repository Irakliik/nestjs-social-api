import fs from 'fs';
import crypto from 'crypto';
export default class User {
    constructor(
        firstName,
        lastName,
        email,
        passwordHash,
        id = crypto.randomUUID()
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.id = id;
    }

    static usersDBPath = './database/users.json';

    static async getUsers() {
        try {
            const dataStr = await fs.promises.readFile(
                this.usersDBPath,
                'utf8'
            );
            return dataStr.trim() ? JSON.parse(dataStr) : [];
        } catch (err) {
            if (err.code === 'ENOENT') return [];
            throw err;
        }
    }

    static addUsers(users) {
        return fs.promises.writeFile(
            this.usersDBPath,
            JSON.stringify(users),
            'utf8'
        );
    }

    static getUserByEmail(email) {
        return this.getUsers().then((users) =>
            users.find((user) => user.email === email)
        );
    }

    static getUserById(id) {
        return this.getUsers().then((users) =>
            users.find((user) => user.id === id)
        );
    }

    static updateUser(id, newFirstName, newLastName) {
        return this.getUsers()
            .then((users) => {
                const updatedUsers = users.map((user) => {
                    if (user.id === id) {
                        return {
                            ...user,
                            firstName: newFirstName,
                            lastName: newLastName,
                        };
                    } else {
                        return user;
                    }
                });

                return updatedUsers;
            })
            .then((updatedUsers) => this.addUsers(updatedUsers));
    }
}
