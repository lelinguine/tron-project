const view = {
    // Global
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
    loginForm: document.getElementById('login'),
    usernameInput: document.getElementById('user_username'),
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
     * @type {HTMLButtonElement}
     */
    quitBtn: document.getElementById('quit-button'),

    // Result
    /**
     * @type {HTMLElement}
     */
    resultList: document.getElementById('result-list'),

    /**
     * Met à jour le statut affiché à l'utilisateur.
     *
     * @param {string} inner - Le contenu HTML à afficher.
     * @param {boolean} [error=false] - Indique si le message est une erreur.
     */
    updateStatus(inner, error = false) {
        this.status.innerHTML = inner;
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
        const orderedPlayers = players.sort((a, b) => a.rank - b.rank);
        // Vider la liste actuelle
        this.resultList.innerHTML = '';
        // Ajouter chaque joueur à la liste
        for (let i = 0; i < orderedPlayers.length; i++) {
            this.resultList.innerHTML += `<li>${orderedPlayers[i].username}</li>`;
        }
    }
};
