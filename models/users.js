import fs from 'fs';
export default class User {
    usersDBPath = './database/users.json';
    constructor(firstName, lastName, email, passwordHash) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    static getUsers() {
        return fs.promises
            .readFile(this.usersDBPath, 'utf8')
            .then((dataStr) => JSON.parse(dataStr));
    }

    static getUserByEmail(email) {
        return this.getUsers().then((users) =>
            users.find((user) => user.email === email)
        );
    }
}
