import { createServer } from 'http';
import { login } from './src/controllers/authController';
import { server as WebSocketServer } from 'websocket';

// File d’attente temporaire (tableau JS)
const queue = []; 

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

// HTTP server avec API file d’attente et login
const server = createServer((req, res) => {
    if (req.url === '/login') {
        login(req, res);
        return;
    }

    // Ajout à la file d’attente (POST /join-queue)
    if (req.url === '/join-queue' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { playerName } = JSON.parse(body);
                const playerId = genId(8);
                queue.push({ id: playerId, name: playerName, joinedAt: Date.now() });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, playerId }));
            } catch (err) {
                res.writeHead(400);
                res.end('Bad JSON');
            }
        });
        return;
    }

    // Lire la file d’attente (GET /queue-status)
    if (req.url === '/queue-status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(queue));
        return;
    }

    res.writeHead(404);
    res.end('Not found.');
});
const PORT = process.env.PORT || 9898;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));

// WebSocket Server
const wsServer = new WebSocketServer({
    httpServer: server
});

wsServer.on('request', function (request) {
    const connection = request.accept(null, request.origin);
    console.log('New connection accepted');

    connection.on('message', function (message) {
        console.log('Received Message:', message.utf8Data);
        if (message.type !== 'utf8') return;
        let msg;
        try {
            msg = JSON.parse(message.utf8Data);
        } catch (e) {
            console.warn('Invalid JSON from client:', message.utf8Data);
            send(connection, { type: 'error', reason: 'invalid_json' });
            return;
        }

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

                // AR de la connexion avec les joueurs actuels
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
                // msg: { type:'changerDirection', direction: ... }
                const meta = connMeta.get(connection);
                if (!meta) { send(connection, { type: 'error', reason: 'not_joined' }); return; }
                const game = games.get(meta.gameId);
                if (!game) return;
                const player = game.players.get(meta.playerId);
                if (!player) return;
                const dir = msg.direction;
                const allowed = new Set(['haut', 'bas', 'gauche', 'droite', null]);
                if (!allowed.has(dir)) { send(connection, { type: 'error', reason: 'invalid_direction' }); return; }
                player.direction = dir;
                broadcastToGame(meta.gameId, { type: 'playerDirection', playerId: player.id, direction: dir }, player.id);
                break;
            }

            case 'positionUpdate': {
                const meta = connMeta.get(connection);
                if (!meta) { send(connection, { type: 'error', reason: 'not_joined' }); return; }
                const game = games.get(meta.gameId);
                if (!game) return;
                const player = game.players.get(meta.playerId);
                if (!player) return;
                const pos = msg.position;
                if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') { send(connection, { type: 'error', reason: 'invalid_position' }); return; }
                player.position = pos;
                broadcastToGame(meta.gameId, { type: 'playerPosition', playerId: player.id, position: pos }, player.id);
                break;
            }

            default:
                console.log('Unknown message type:', msg.type);
                send(connection, { type: 'error', reason: 'unknown_type' });
        }
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
                games.delete(gameId); // Partie perdue, on la supprime simplement
                console.log(`Deleted empty (lost) game ${gameId}`);
            }
        }
        connMeta.delete(connection);
    });
});
