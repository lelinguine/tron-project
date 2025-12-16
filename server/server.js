import 'dotenv/config';
import { createServer } from 'http';
import { server as WebSocketServer } from 'websocket';
import { PORT } from './src/config.js';
import { handleLogin } from './src/controllers/authController.js';
import {
    handleChangeDirection,
    handleDisconnect,
    handleJoinGame,
    handleLeaveQueue
} from './src/controllers/gamesController.js';
import { handleGetDashboard } from './src/controllers/statsController.js';
import RequestType from './src/enums/RequestType.js';

const server = createServer((_, res) => {
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

wsServer.on('request', (request) => {
    const connection = request.accept(null, request.origin);

    connection.on('message', async (message) => {
        let result;

        try {
            const data = JSON.parse(message.utf8Data);

            switch (data.type) {
                case RequestType.Login:
                    result = await handleLogin(data);
                    break;

                case RequestType.JoinGame:
                    result = handleJoinGame(data, connection);
                    break;

                case RequestType.LeaveQueue:
                    result = handleLeaveQueue(connection);
                    break;

                case RequestType.ChangeDirection:
                    result = handleChangeDirection(data, connection);
                    break;

                case RequestType.GetDashboard:
                    result = handleGetDashboard();
                    break;

                default:
                    result = { error: "Type d'action invalide" };
                    break;
            }
        } catch (error) {
            console.error(error);
            result = { error: 'Message invalide' };
        }

        if (result) {
            connection.sendUTF(JSON.stringify(result));
        }
    });

    connection.on('close', () => {
        handleDisconnect(connection);
    });
});
