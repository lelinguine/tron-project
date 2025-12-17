// Envoi de la requête pour rejoindre une partie
view.playBtn.addEventListener('click', () =>
    ws.send(JSON.stringify({ type: RequestType.JoinGame, username, mode: selectedMode, gameId: view.gameIdInput.value }))
);

/**
 * Le mode de jeu sélectionné (nombre de joueurs par partie).
 *
 * @type {number}
 */
let selectedMode = 2;

// Changement du mode de jeu entre 1v1 et 4 joueurs
view.selectModeBtn.addEventListener('click', () => {
    if (selectedMode === 2) {
        selectedMode = 4;
        view.selectModeBtn.textContent = 'Mode : 4 joueurs';
    } else {
        selectedMode = 2;
        view.selectModeBtn.textContent = 'Mode : 1v1';
    }
});

// Annulation de la recherche de partie
view.cancelBtn.addEventListener('click', () => {
    ws.send(JSON.stringify({ type: RequestType.LeaveQueue }));
    quit();
});

/**
 * Quitte la partie lorsqu'elle est finie.
 *
 */
function quit() {
    view.updateStatus('Utilisateur connecté');
    goTo('lobby-section');
}

view.quitBtn.addEventListener('click', quit);
