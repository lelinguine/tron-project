function join() {
    ws.send(JSON.stringify({ type: 'joinGame', username, mode: selectedMode }));
}

view.playBtn.addEventListener('click', join);

/**
 * Le mode de jeu sélectionné (nombre de joueurs par partie).
 *
 * @type {number}
 */
let selectedMode = 2;

function switchMode() {
    if (selectedMode === 2) {
        selectedMode = 4;
        view.selectModeBtn.textContent = 'Mode : 4 joueurs';
    } else {
        selectedMode = 2;
        view.selectModeBtn.textContent = 'Mode : 1v1';
    }
}

view.selectModeBtn.addEventListener('click', switchMode);

function quit() {
    view.updateStatus('<p>Utilisateur connecté.</p>');
    goTo('lobby-section');
}

view.quitBtn.addEventListener('click', quit);

function cancelJoin() {
    ws.send(JSON.stringify({ type: 'leaveQueue' }));
    quit();
}

view.cancelBtn.addEventListener('click', cancelJoin);
