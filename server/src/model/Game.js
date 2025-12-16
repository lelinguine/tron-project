import { COLORS, GAME_SIZE, TICK_RATE } from '../config.js';
import Direction from '../enums/Direction.js';
import GameState from '../enums/GameState.js';
import Player from './Player.js';

/**
 * Représente une partie de jeu.
 *
 * @class Game
 */
class Game {
    /**
     * L'identifiant de la partie.
     *
     * @type {string}
     * @memberof Game
     */
    _id;
    /**
     * Les joueurs.
     *
     * @type {Map<string, Player>}
     * @memberof Game
     */
    _players;
    /**
     * L'état actuel de la partie.
     *
     * @type {GameState}
     * @memberof Game
     */
    _state;
    /**
     * Le nombre maximum de joueurs.
     *
     * @memberof Game
     */
    _maxPlayers;
    /**
     * La boucle de jeu.
     *
     * @type {(NodeJS.Timeout | null)}
     * @memberof Game
     */
    _loopInterval;
    /**
     * Les couleurs disponibles pour les joueurs.
     *
     * @memberof Game
     */
    _availableColors;
    /**
     * La fonction appelée à la fin de la partie.
     *
     * @type {(game: Game) => Promise}
     * @memberof Game
     */
    _onEnd;

    /**
     * Crée une nouvelle instance de {@link Game}.
     *
     * @param {number} maxPlayers - Le nombre maximum de joueurs.
     * @param {(game: Game) => Promise} onEnd - La fonction appelée à la fin de la partie.
     * @memberof Game
     */
    constructor(maxPlayers, onEnd) {
        this._id = Math.random().toString(36).substring(2, 9);
        this._players = new Map();
        this._state = GameState.Waiting;
        this._maxPlayers = maxPlayers;
        this._loopInterval = null;
        this._availableColors = [...COLORS];
        this._onEnd = onEnd;
    }

    /**
     * L'identifiant de la partie.
     *
     * @readonly
     * @type {string}
     * @memberof Game
     */
    get id() {
        return this._id;
    }

    /**
     * La liste des joueurs.
     *
     * @readonly
     * @type {Player[]}
     * @memberof Game
     */
    get playersArray() {
        return Array.from(this._players.values());
    }

    /**
     * La liste des joueurs en vie.
     *
     * @readonly
     * @type {Player[]}
     * @memberof Game
     */
    get alivePlayersArray() {
        return this.playersArray.filter((player) => player.isAlive);
    }

    /**
     * Le nombre de joueurs.
     *
     * @readonly
     * @type {number}
     * @memberof Game
     */
    get nbPlayers() {
        return this._players.size;
    }

    /**
     * Le nombre de joueurs en vie.
     *
     * @readonly
     * @type {number}
     * @memberof Game
     */
    get nbAlivePlayers() {
        return this.alivePlayersArray.length;
    }

    /**
     * L'état actuel de la partie.
     *
     * @readonly
     * @memberof Game
     */
    get state() {
        return this._state;
    }

    /**
     * Ajoute un joueur.
     *
     * @param {import('websocket').connection} connection - La connexion WebSocket du joueur.
     * @param {string} username - Le nom de l'utilisateur.
     * @memberof Game
     */
    addPlayer(connection, username) {
        // Vérifie si la partie est pleine
        if (this.nbPlayers >= this._maxPlayers) {
            return;
        }

        // Crée et ajoute le joueur
        const color = this._availableColors.splice(
            Math.floor(Math.random() * this._availableColors.length),
            1
        )[0];
        this._players.set(
            username,
            new Player(
                connection,
                username,
                color,
                this.nbPlayers % 2 === 0
                    ? {
                          x: Math.floor(GAME_SIZE / 5),
                          y: Math.floor(GAME_SIZE / 2)
                      }
                    : {
                          x: GAME_SIZE - Math.floor(GAME_SIZE / 5),
                          y: Math.floor(GAME_SIZE / 2)
                      },
                this.nbPlayers % 2 === 0 ? Direction.Right : Direction.Left
            )
        );
    }

    /**
     * Retire un joueur de la partie.
     *
     * @param {string} username - Le nom d'utilisateur du joueur à retirer.
     * @memberof Game
     */
    removePlayer(username) {
        const player = this._players.get(username);
        if (!player) {
            return;
        }

        // Si la partie est en cours
        if (this._state === GameState.Playing) {
            // Tue le joueur
            this.kill(player);
            // Assigne le rank
            this.assignRanks([player]);
            // Vérification si la partie est terminée
            this.checkEnd();
        } else if (this._state === GameState.Waiting) {
            // Si la partie est en attente, retire le joueur
            this._players.delete(username);
        }
    }

    /**
     * Démarre la pertie et la boucle de jeu.
     *
     * @memberof Game
     */
    async start() {
        this._state = GameState.Ready;

        const count = [3, 2, 1, 'Go!'];
        for (const c of count) {
            this.broadcastToPlayers(c);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // Mise à jour du statut
        this._state = GameState.Playing;

        // Envoie l'état de la partie aux joueurs
        this.broadcastToPlayers();

        // Démarrage de la boucle de jeu
        this._loopInterval = setInterval(this.tick.bind(this), 1000 / TICK_RATE);
    }

    /**
     * La boucle de jeu.
     *
     * @memberof Game
     */
    tick() {
        // Récupération des joueurs vivants
        const alivePlayers = this.alivePlayersArray;
        // Initialise la list des joueurs tués à ce tick
        const killedPlayers = [];

        // Déplacement de tous les joueurs
        for (let i = 0; i < alivePlayers.length; i++) {
            alivePlayers[i].move();
        }

        // Vérification des colisions
        for (let i = 0; i < alivePlayers.length; i++) {
            const firstPlayer = alivePlayers[i];
            for (let j = 0; j < alivePlayers.length; j++) {
                const secondPlayer = alivePlayers[j];
                // Si le joueur 2 est dans la trail du joueur 1
                if (firstPlayer.checkTrailCollision(secondPlayer, i === j)) {
                    // Ajout du kill (le tueur est undefined si collision avec sa propre trail)
                    this.kill(secondPlayer, i === j ? undefined : firstPlayer);
                    killedPlayers.push(secondPlayer);
                }
            }

            // Vérification des collisions avec les murs
            if (this.isOutOfBounds(firstPlayer)) {
                // Le joueur meurt
                this.kill(firstPlayer);
                killedPlayers.push(firstPlayer);
            }
        }

        // Assignation du rang aux joueurs tués lors de ce tick
        if (killedPlayers.length > 0) {
            this.assignRanks(killedPlayers);
        }

        // Vérification de la fin de la partie
        if (!this.checkEnd()) {
            // Envoie l'état de la partie aux joueurs
            this.broadcastToPlayers();
        }
    }

    /**
     * Met à jour la direction d'un joueur et sa trail.
     *
     * @param {string} username - Le nom d'utilisateur du joueur.
     * @param {Direction} direction - La nouvelle direction du joueur.
     * @memberof Game
     */
    changeDirection(username, direction) {
        // Récupère le joueur
        const player = this._players.get(username);
        if (!player) return;

        // Mise à jour la direction
        player.direction = direction;
    }

    /**
     * Gère la mot d'un joueour
     *
     * @param {Player} killed Le joueur tué.
     * @param {Player} [killer] Le joueur ayant tué (optionnel si collision avec un mur ou sa trail).
     */
    kill(killed, killer) {
        // Tue le joueur
        killed.die();

        // Si le jouer a été tué par un autre joueur
        if (killer) {
            // Ajoute un kill au tueur
            killer.addKill();
        }
    }

    /**
     * Assigne le rang aux joueurs morts sur le même tick.
     * Si plusieurs joueurs meurent, ils sont classés par score décroissant.
     * Si les scores sont identiques, ils ont le même rang.
     *
     * @param {Player[]} killedPlayers - Les joueurs tués lors de ce tick.
     * @memberof Game
     */
    assignRanks(killedPlayers) {
        // Calcul du rang pour ce tick (nombre de joueurs encore en vie + 1)
        const baseRank = this.nbAlivePlayers + 1;

        // Si un seul joueur mort, assigne directement le rang
        if (killedPlayers.length === 1) {
            killedPlayers[0].rank = baseRank;
            return;
        }

        // Tri des joueurs tués par score décroissant
        const sortedKilledPlayers = killedPlayers.sort((a, b) => b.score - a.score);

        // Assignation des rangs
        let currentRank = baseRank;
        for (let i = 0; i < sortedKilledPlayers.length; i++) {
            // Si ce n'est pas le premier joueur et que le score est différent du précédent
            if (i > 0 && sortedKilledPlayers[i].score !== sortedKilledPlayers[i - 1].score) {
                // On incrémente le rang
                currentRank = baseRank + i;
            }
            sortedKilledPlayers[i].rank = currentRank;
        }
    }

    /**
     * Vérifie si la partie est terminée et met à jour l'état en conséquence.
     *
     * @return {boolean} `true` si la partie est terminée, sinon `false`.
     * @memberof Game
     */
    checkEnd() {
        // Vérifie s'il ne reste qu'un seul joueur en vie
        const alivePlayers = this.alivePlayersArray;
        if (alivePlayers.length <= 1) {
            // Assignation du rang au dernier joueur en vie
            if (alivePlayers.length === 1) {
                alivePlayers[0].rank = 1;
            }
            // Met à jour l'état de la partie
            this._state = GameState.Finished;
            // Arrête la boucle de jeu
            if (this._loopInterval !== null) {
                clearInterval(this._loopInterval);
                this._loopInterval = null;
            }
            // Envoi de l'état de la partie aux joueurs
            this.broadcastToPlayers();
            // Exécution du callback
            this._onEnd(this);
            return true;
        }
        return false;
    }

    /**
     * Vérifie si un joueur est hors des limites du terrain.
     *
     * @param {Player} player - Le joueur à vérifier.
     * @return {boolean} `true` si le joueur est hors des limites, sinon `false`.
     * @memberof Game
     */
    isOutOfBounds(player) {
        return (
            player.position.x < 0 ||
            player.position.x >= GAME_SIZE ||
            player.position.y < 0 ||
            player.position.y >= GAME_SIZE
        );
    }

    /**
     * Envoie l'état de la partie à tous les joueurs.
     *
     * @memberof Game
     */
    broadcastToPlayers(message) {
        const playersArray = this.playersArray;
        const clientStr = this.toClient(message);

        for (let i = 0; i < playersArray.length; i++) {
            playersArray[i].connection.sendUTF(clientStr);
        }
    }

    /**
     * Convertit la partie en un format adapté pour le client.
     *
     * @return {string} La partie lisible pour le client.
     * @memberof Game
     */
    toClient(message) {
        return JSON.stringify({
            players: this.playersArray.map((player) => player.toClient()),
            state: this._state,
            message: message || 'none'
        });
    }
}

export default Game;
