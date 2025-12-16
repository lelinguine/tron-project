import GameState from '../enums/GameState.js';
import GameManager from '../model/GameManager.js';

const gameManager = new GameManager();

/**
 * Gère la jonction d'un joueur à une partie.
 *
 * @export
 * @param {import('websocket').connection} connection - La connexion WebSocket du joueur.
 * @param {{ username: string; }} data - Les données du message.
 * @return {(object | undefined)} Le résultat de l'opération.
 *
 */
export function handleJoinGame(data, connection) {
    const { username, mode = 2 } = data;

    console.log(`User ${username} is trying to join a game.`);

    if (!username) {
        return {
            ok: false,
            error: 'Aucun nom utilisateur renseigné.'
        };
    }

    // Ajout du joueur dans la file d'attente
    gameManager.addPlayerToQueue(connection, username, mode);
}

export function handleLeaveQueue(connection) {
    // Retrait du joueur de la file d'attente
    gameManager.removePlayerFromQueue(connection);
}

/**
 * Gère le changement de direction d'un joueur.
 *
 * @export
 * @param {{ username: string; newDirection: import('../enums/Direction').default; }} data - Les données du message.
 * @return {(object | undefined)} Le résultat de l'opération.
 */
export function handleChangeDirection(data) {
    const { username, newDirection } = data;

    if (!username) {
        return {
            ok: false,
            error: 'Aucun utilisateur renseigné.'
        };
    }

    if (!newDirection) {
        return {
            ok: false,
            error: 'Aucune direction renseignée.'
        };
    }

    // Récupération de la partie
    const game = gameManager.getPlayerGame(username);
    if (!game) {
        return {
            ok: false,
            error: 'Partie introuvable.'
        };
    }
    if (game.state !== GameState.Playing) {
        return {
            ok: false,
            error: "La partie n'a pas encore commencé."
        };
    }

    // Modification de la direction du joueur
    game.changeDirection(username, newDirection);
}

/**
 * Gère la déconnexion d'un joueur.
 *
 * @export
 * @param {import('websocket').connection} connection - La connexion WebSocket du joueur.
 */
export function handleDisconnect(connection) {
    gameManager.handleDisconnect(connection);
}
