import 'dotenv/config';
import { createServer } from 'http';
import { server as WebSocketServer } from 'websocket';
import { PORT } from './src/config.js';

import { handleLogin } from './src/controllers/authController.js';

const server = createServer((req, res) => {
    res.writeHead(426, { 'Content-Type': 'text/plain' });
    res.end('Upgrade Required: Use WebSocket');
});

server.listen(PORT, () => {
    console.log(`Serveur prêt`);
    console.log(`\t- Web Socket : ws://localhost:${PORT}`);
});

const wsServer = new WebSocketServer({
    httpServer: server
});

wsServer.on('request', function (request) {
    const connection = request.accept(null, request.origin);

    connection.on('message', async function (message) {
        try {
            const data = JSON.parse(message.utf8Data);
            
            if (data.type === 'login') {
                const result = await handleLogin(data.username, data.password);
                connection.send(JSON.stringify(result.data));
            }
        } catch (error) {
            connection.send(JSON.stringify({ error: 'Message invalide' }));
        }
    });

    connection.on('close', function () {
        console.log('Client has disconnected.');
    });
});
