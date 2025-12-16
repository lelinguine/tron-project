function join() {
    ws.send(JSON.stringify({ type: 'joinGame', username: username }));
}

let selectedMode = 2;

function select() {
    // if(document.getElementById('select-button').classList.contains('disabled')) {
    //     return;
    // }
    // if (selectedMode === 2) {
    //     selectedMode = 4;
    //     document.getElementById('select-button').textContent = "1v3";
    // } else {
    //     selectedMode = 2;
    //     document.getElementById('select-button').textContent = "1v1";
    // }
}

function quit() {
    view.updateStatus('<p>Utilisateur connecté.</p>');
    goTo('lobby-section');
}

function cancelJoin() {
    ws.send(JSON.stringify({ type: 'leaveQueue' }));
    quit();
}
