import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceFilePath = path.join(__dirname, 'database', 'users.json');
const backupFilePath = path.join(__dirname, 'database', 'users-backup.json');

const readerFile = fs.createReadStream(sourceFilePath, { encoding: 'utf8' });
const backupFile = fs.createWriteStream(backupFilePath, { encoding: 'utf8' });

readerFile.pipe(backupFile);

readerFile.on('error', (err) => {
    console.log(`Error reading reader file: ${err.message}`);
});

backupFile.on('error', (err) => {
    console.log(`Error writing backup file: ${err.message}`);
});

backupFile.on('finish', () => {
    console.log('Backup completed successfully');
});
