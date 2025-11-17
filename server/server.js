import 'dotenv/config';
import { createServer } from 'http';
import { server as WebSocketServer } from 'websocket';
import { PORT } from './src/config.js';
import authController from './src/controllers/authController.js';

const server = createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const handler = authController[req.url ?? ''];
    if (handler) {
        handler(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found.');
    }
});
server.listen(PORT, () => {
    console.log(`Serveur prêt`);
    console.log(`\t- HTTP : http://localhost:${PORT}`);
    console.log(`\t- Web Socket : ws://localhost:${PORT}`);
});

const wsServer = new WebSocketServer({
    httpServer: server
});

wsServer.on('request', function (request) {
    const connection = request.accept(null, request.origin);

    connection.on('message', function (message) {
        console.log('Received Message:', message.utf8Data);
        request.send('Hi this is WebSocket server!');
    });

    connection.on('close', function () {
        console.log('Client has disconnected.');
    });
});
