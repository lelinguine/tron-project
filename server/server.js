import { createServer } from 'http';
import { login } from './src/controllers/authController';
import { server as WebSocketServer } from 'websocket';

const server = createServer((req, res) => {
    if (req.url === '/login') {
        login(req, res);
    } else {
        res.writeHead(404);
        res.end('Not found.');
    }
});
server.listen(9898);

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
