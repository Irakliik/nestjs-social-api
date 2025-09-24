import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT;

const server = http.createServer(function (request, response) {
    response.end('Hello World');
});

server.listen(port);
