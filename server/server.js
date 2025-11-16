import { createServer } from 'http';
import { login } from './src/controllers/authController';
import { server as WebSocketServer } from 'websocket';

<<<<<<< Updated upstream
const server = createServer((req, res) => {
    if (req.url === '/login') {
        login(req, res);
    } else {
        res.writeHead(404);
        res.end('Not found.');
    }
});
server.listen(9898);
=======
const PORT = process.env.PORT || 9898;
const server = http.createServer();
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
>>>>>>> Stashed changes

const wsServer = new WebSocketServer({
    httpServer: server
});

// In-memory games storage: gameId -> { players: Map(playerId->player) }
const games = new Map();
// Map connection -> { gameId, playerId }
const connMeta = new Map();

function genId(length = 6) {
    return Math.random().toString(36).slice(2, 2 + length);
}

function send(conn, obj) {
    try {
        conn.sendUTF(JSON.stringify(obj));
    } catch (e) {
        console.error('Send error', e);
    }
}

function broadcastToGame(gameId, obj, exceptPlayerId) {
    const game = games.get(gameId);
    if (!game) return;
    for (const [pid, p] of game.players.entries()) {
        if (pid === exceptPlayerId) continue;
        send(p.connection, obj);
    }
}

wsServer.on('request', function (request) {
    const connection = request.accept(null, request.origin);
    console.log('New connection accepted');

    connection.on('message', function (message) {
<<<<<<< Updated upstream
        console.log('Received Message:', message.utf8Data);
        request.send('Hi this is WebSocket server!');
=======
        if (message.type !== 'utf8') return;
        let msg;
        try {
            msg = JSON.parse(message.utf8Data);
        } catch (e) {
            console.warn('Invalid JSON from client:', message.utf8Data);
            send(connection, { type: 'error', reason: 'invalid_json' });
            return;
        }

        // Simple protocol based on msg.type
        switch (msg.type) {
            case 'join': {
                // msg: { type: 'join', gameId?: string, playerName?: string, position?: {x,y} }
                const requestedGame = msg.gameId || genId(4);
                let game = games.get(requestedGame);
                if (!game) {
                    game = { players: new Map() };
                    games.set(requestedGame, game);
                    console.log(`Created new game ${requestedGame}`);
                }

                const playerId = genId(8);
                const player = {
                    id: playerId,
                    name: msg.playerName || `p_${playerId}`,
                    connection: connection,
                    position: msg.position || { x: 0, y: 0 },
                    direction: msg.direction || null
                };

                game.players.set(playerId, player);
                connMeta.set(connection, { gameId: requestedGame, playerId });

                // Send joined acknowledgement with current players
                const playersList = [];
                for (const [pid, p] of game.players.entries()) {
                    playersList.push({ id: pid, name: p.name, position: p.position, direction: p.direction });
                }

                send(connection, { type: 'joined', gameId: requestedGame, playerId, players: playersList });

                // Notifie les autres joueurs
                broadcastToGame(requestedGame, { type: 'playerJoined', player: { id: playerId, name: player.name, position: player.position, direction: player.direction } }, playerId);
                console.log(`Player ${playerId} joined game ${requestedGame}`);
                break;
            }

            case 'changerDirection': {
                // msg: { type:'changerDirection', direction: 'haut'|'bas'|'gauche'|'droite' }
                const meta = connMeta.get(connection);
                if (!meta) { send(connection, { type: 'error', reason: 'not_joined' }); return; }
                const game = games.get(meta.gameId);
                if (!game) return;
                const player = game.players.get(meta.playerId);
                if (!player) return;
                const dir = msg.direction;
                // validation de la direction 
                const allowed = new Set(['haut', 'bas', 'gauche', 'droite', null]);
                if (!allowed.has(dir)) { send(connection, { type: 'error', reason: 'invalid_direction' }); return; }
                player.direction = dir;
                // notifie les autres
                broadcastToGame(meta.gameId, { type: 'playerDirection', playerId: player.id, direction: dir }, player.id);
                break;
            }

            case 'positionUpdate': {
                // msg: { type:'positionUpdate', position: {x,y} }
                const meta = connMeta.get(connection);
                if (!meta) { send(connection, { type: 'error', reason: 'not_joined' }); return; }
                const game = games.get(meta.gameId);
                if (!game) return;
                const player = game.players.get(meta.playerId);
                if (!player) return;
                const pos = msg.position;
                if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') { send(connection, { type: 'error', reason: 'invalid_position' }); return; }
                player.position = pos;
                // transmission de la position aux autres joueurs
                broadcastToGame(meta.gameId, { type: 'playerPosition', playerId: player.id, position: pos }, player.id);
                break;
            }

            default:
                console.log('Unknown message type:', msg.type);
                send(connection, { type: 'error', reason: 'unknown_type' });
        }
>>>>>>> Stashed changes
    });

    connection.on('close', function () {
        console.log('Connection closed, cleaning state');
        const meta = connMeta.get(connection);
        if (!meta) return;
        const { gameId, playerId } = meta;
        const game = games.get(gameId);
        if (game) {
            game.players.delete(playerId);
            broadcastToGame(gameId, { type: 'playerLeft', playerId });
            if (game.players.size === 0) {
                games.delete(gameId);
                console.log(`Deleted empty game ${gameId}`);
            }
        }
        connMeta.delete(connection);
    });
});
