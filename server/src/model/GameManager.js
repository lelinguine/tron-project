import { MAX_PLAYERS } from '../config.js';
import GameEvent from '../enums/GameEvent.js';
import { saveGame } from '../lib/game.js';
import Game from './Game.js';

/**
 * Gère les parties du jeu.
 *
 * @class GameManager
 */
class GameManager {
    /**
     * La liste des parties (clé: id de la partie, valeur: instance de Game).
     *
     * @type {Map<string, Game>}
     * @memberof GameManager
     */
    _games;
    /**
     * La partie en attente de joueurs.
     *
     * @type {Game}
     * @memberof GameManager
     */
    _waitingGame;
    /**
     * La map des joueurs vers leurs parties (clé: username, valeur: id de la partie).
     *
     * @type {Map<string, string>}
     * @memberof GameManager
     */
    _playerGameMap;
    /**
     * La map des connexions vers les noms d'utilisateur (clé: connexion WebSocket, valeur: nom d'utilisateur).
     *
     * @type {Map<import('websocket').connection, string>}
     * @memberof GameManager
     */
    _connectionUserMap;

    /**
     * Crée une nouvelle instance de {@link GameManager}.
     *
     * @memberof GameManager
     */
    constructor() {
        this._games = new Map();
        this._waitingGame = new Game(this.onGameEnd.bind(this));
        this._playerGameMap = new Map();
        this._connectionUserMap = new Map();
    }

    /**
     * Récupère la partie d'un joueur par son nom d'utilisateur.
     *
     * @param {string} username - Le nom d'utilisateur du joueur.
     * @return {(Game | undefined)} La partie ou `undefined` si le joueur n'est dans aucune partie
     * @memberof GameManager
     */
    getPlayerGame(username) {
        // Récupération de l'identifiant de la partie
        const gameId = this._playerGameMap.get(username);
        if (!gameId) return undefined;

        // Envoi de la partie
        return this._waitingGame.id === gameId ? this._waitingGame : this._games.get(gameId);
    }

    /**
     * Ajoute un joueur à la file d'attente et démarre la partie si nécessaire.
     *
     * @param {import('websocket').connection} connection
     * @param {string} username
     * @memberof GameManager
     */
    addPlayerToQueue(connection, username) {
        // Ajoute le joueur
        this._waitingGame.addPlayer(connection, username);
        // Mappe le joueur à la partie
        this._playerGameMap.set(username, this._waitingGame.id);
        // Mappe la connexion au nom d'utilisateur
        this._connectionUserMap.set(connection, username);

        // Si la partie est pleine
        if (this._waitingGame.nbPlayers === MAX_PLAYERS) {
            const game = this._waitingGame;
            // Ajoute la partie pleine à la liste des parties
            this._games.set(this._waitingGame.id, game);
            // Crée une nouvelle partie en attente
            this._waitingGame = new Game();
            // Envoie un message de démarrage à tous les joueurs de la partie pleine
            game.broadcastToPlayers();
        } else {
            // Envoie un message d'attente au joueur
            connection.sendUTF(
                JSON.stringify({
                    ok: true,
                    success: "En attente d'autres joueurs...",
                    type: GameEvent.Waiting,
                    nbPlayers: this._waitingGame.nbPlayers
                })
            );
        }
    }

    /**
     * Retire un joueur lorsqu'il se déconnecte.
     *
     * @param {import('websocket').connection} connection - La connexion WebSocket du joueur.
     * @memberof GameManager
     */
    handleDisconnect(connection) {
        // Récupération du nom d'utilisateur associé à la connexion
        const username = this._connectionUserMap.get(connection);
        if (!username) {
            return;
        }

        // Récupération de la partie
        const game = this.getPlayerGame(username);
        if (!game) {
            return;
        }

        // Retire le joueur de la partie
        game.removePlayer(username);

        // Nettoyage des mappings
        this._connectionUserMap.delete(connection);
        this._playerGameMap.delete(username);

        // Si la partie est vide, on la supprime
        if (game.nbPlayers === 0 && this._waitingGame.id !== game.id) {
            this._games.delete(game.id);
        }
    }

    /**
     *
     *
     * @param {Game} game
     * @memberof GameManager
     */
    async onGameEnd(game) {
        // Sauvegarde de la partie
        await saveGame(game);
    }
}

export default GameManager;
