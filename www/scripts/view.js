const view = {
    // Global
    /**
     * @type {HTMLElement}
     */
    status: document.getElementById('status'),

    // Lobby
    /**
     * @type {HTMLInputElement}
     */
    gameIdInput: document.getElementById('game-id'),
    /**
     * @type {HTMLButtonElement}
     */
    selectModeBtn: document.getElementById('select-button'),

    // Waiting
    /**
     * @type {HTMLElement}
     */
    waitingState: document.getElementById('waiting-state'),

    //  Game
    /**
     * @type {HTMLElement}
     */
    gameBoard: document.getElementById('game-board'),

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
