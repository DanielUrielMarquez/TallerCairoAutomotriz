const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const hostname = 'localhost';

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end('<h1>Hello, World!</h1><p>Welcome to my Node.js server.</p>');
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});