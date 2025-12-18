/**
 * Objets contenant les références aux éléments de l'interface utilisateur.
 */
const view = {
    // Global
    /**
     * @type {HTMLButtonElement}
     */
    logoutBtn: document.getElementById('logout-button'),
    /**
     * @type {HTMLElement}
     */
    status: document.getElementById('status'),

    // Home
    /**
     * @type {HTMLButtonElement}
     */
    startBtn: document.getElementById('start'),

    // Login
    /**
     * @type {HTMLFormElement}
     */
    loginForm: document.getElementById('login'),
    /**
     * @type {HTMLInputElement}
     */
    usernameInput: document.getElementById('user_username'),
    /**
     * @type {HTMLInputElement}
     */
    passwordInput: document.getElementById('user_password'),

    // Lobby
    /**
     * @type {HTMLElement}
     */
    welcomeMessage: document.getElementById('welcome-message'),
    /**
     * @type {HTMLInputElement}
     */
    gameIdInput: document.getElementById('game-id'),
    /**
     * @type {HTMLButtonElement}
     */
    selectModeBtn: document.getElementById('select-button'),
    /**
     * @type {HTMLButtonElement}
     */
    playBtn: document.getElementById('play-button'),

    // Waiting
    /**
     * @type {HTMLElement}
     */
    waitingState: document.getElementById('waiting-state'),
    /**
     * @type {HTMLButtonElement}
     */
    cancelBtn: document.getElementById('cancel-button'),

    //  Game
    /**
     * @type {HTMLElement}
     */
    gameBoard: document.getElementById('game-board'),
    /**
     * @type {HTMLElement}
     */
    gameCounter: document.getElementById('game-counter'),

    // Result
    /**
     * @type {HTMLUListElement}
     */
    resultList: document.getElementById('result-list'),
    /**
     * @type {HTMLButtonElement}
     */
    quitBtn: document.getElementById('quit-button'),

    // Rank
    /**
     * @type {HTMLUListElement}
     */
    rankList: document.getElementById('rank-list'),
    /**
     * @type {HTMLButtonElement}
     */
    openRankBtn: document.getElementById('open-rank-button'),

    /**
     * Met à jour le statut affiché à l'utilisateur.
     *
     * @param {string} text - Le contenu HTML à afficher.
     * @param {boolean} [error=false] - Indique si le message est une erreur.
     */
    updateStatus(text, error = false) {
        this.status.innerHTML = `<p>${text}</p>`;
        if (error) {
            this.status.classList.add('failed');
        } else {
            this.status.classList.remove('failed');
        }
    },

    /**
     * Affiche la liste des résultats des joueurs.
     *
     * @param {({ username: string; rank: number; })[]} players - La liste des joueurs.
     */
    displayResultList(players) {
        // Trier les joueurs par rang
        const orderedPlayers = players.sort((a, b) => {
            return a.rank === b.rank ? a.score - b.score : a.rank - b.rank;
        });
        // Vider la liste actuelle
        this.resultList.innerHTML = '';
        // Ajouter chaque joueur à la liste
        for (let i = 0; i < orderedPlayers.length; i++) {
            const player = orderedPlayers[i];
            this.resultList.innerHTML += `<li>${player.rank}${player.rank === 1 ? 'er' : 'ème'} ${
                player.username
            } : ${player.score} points</li>`;
        }
    },

    /**
     * Affiche la liste des joueurs classés.
     *
     * @param {({ username: string; victories: number; totalScore: number; })[]} ranks - La liste des joueurs classés.
     */
    displayRank(ranks) {
        this.rankList.innerHTML = '';

        if (ranks.length === 0) {
            return;
        }

        for (let i = 0; i < ranks.length; i++) {
            const player = ranks[i];
            this.rankList.innerHTML += `<li>${i + 1}${i + 1 === 1 ? 'er' : 'ème'}. ${player.username}, ${
                player.victories
            } victoire${player.victories > 1 ? 's' : ''}, ${player.totalScore}pts</li>`;
        }
    }
};
