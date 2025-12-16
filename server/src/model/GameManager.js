import { MAX_PLAYERS } from '../config.js';
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
        this._playerGameMap = new Map();
        this._connectionUserMap = new Map();

        this.onGameEnd = this.onGameEnd.bind(this);

        this._waitingGame = new Game(this.onGameEnd);
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
        const game = this._waitingGame;
        // Ajoute le joueur
        game.addPlayer(connection, username);
        // Mappe le joueur à la partie
        this._playerGameMap.set(username, game.id);
        // Mappe la connexion au nom d'utilisateur
        this._connectionUserMap.set(connection, username);

        // Si la partie est pleine
        if (game.nbPlayers === MAX_PLAYERS) {
            // Ajoute la partie pleine à la liste des parties
            this._games.set(game.id, game);
            // Création d'une nouvelle partie en attente
            this._waitingGame = new Game(this.onGameEnd);
            // Démarre la partie (change state à 'playing' et lance la boucle)
            game.start();
        } else {
            game.broadcastToPlayers(`${game.nbPlayers}/${MAX_PLAYERS}`);
        }
    }

    /**
     * Retire un joueur de la file d'attente.
     *
     * @param {import('websocket').connection} connection - La connexion WebSocket du joueur.
     * @memberof GameManager
     */
    removePlayerFromQueue(connection) {
        // Récupération du nom d'utilisateur associé à la connexion
        const username = this._connectionUserMap.get(connection);
        if (!username) {
            return;
        }

        // Vérification que le joueur est dans la partie en attente
        const gameId = this._playerGameMap.get(username);
        if (gameId !== this._waitingGame.id) {
            return;
        }

        // Retire le joueur de la partie
        this._waitingGame.removePlayer(username);

        // Nettoyage des mappings
        this._connectionUserMap.delete(connection);
        this._playerGameMap.delete(username);

        // Notifie les autres joueurs du changement du nombre de joueurs
        if (this._waitingGame.nbPlayers > 0) {
            this._waitingGame.broadcastToPlayers(`${this._waitingGame.nbPlayers}/${MAX_PLAYERS}`);
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

        if (game.id === this._waitingGame.id) {
            // Le joueur était dans la file d'attente
            this.removePlayerFromQueue(connection);
            return;
        }

        // Retire le joueur de la partie
        game.removePlayer(username);

        // Nettoyage des mappings
        this._connectionUserMap.delete(connection);
        this._playerGameMap.delete(username);

        // Si la partie est vide, on la supprime
        if (game.nbPlayers === 0 && this._waitingGame.id !== game.id) {
            // Suppression de la partie
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

        // Suppression des mappings pour tous les joueurs de cette partie
        for (const [username, id] of this._playerGameMap.entries()) {
            if (id === game.id) {
                this._playerGameMap.delete(username);
            }
        }

        // Suppression des mappings pour toutes les connexions de cette partie
        for (const [connection, username] of this._connectionUserMap.entries()) {
            const playerGameId = this._playerGameMap.get(username);
            if (playerGameId === game.id) {
                this._connectionUserMap.delete(connection);
            }
        }

        // Suppression de la partie
        this._games.delete(game.id);
    }
}

export default GameManager;
