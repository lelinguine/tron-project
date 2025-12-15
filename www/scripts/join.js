function join() {
    ws.send(JSON.stringify({
        type: 'joinGame',
        MAX_PLAYERS: selectedMode,
        username: username
    }));
    document.getElementById('ready').textContent = 'Ready';
    document.getElementById('play-button').style.display = 'none';
    document.getElementById('cancel-button').style.display = 'block';
    document.getElementById('select-button').classList.add('disabled');
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

// function restart() {

// }

function quit() {
    document.getElementById('status').innerHTML = '<p>Utilisateur connecté.</p>';
    document.getElementById('status').classList.remove('failed');
    document.getElementById('ready').textContent = 'Not ready';
    document.getElementById('play-button').style.display = 'block';
    document.getElementById('cancel-button').style.display = 'none';
    document.getElementById('select-button').classList.remove('disabled');
    goTo('game-section', 'lobby-section');
}

function cancelJoin() {
    // ws.send(JSON.stringify({
    //     type: 'cancelJoin',
    //     username: username
    // }));
//     document.getElementById('status').innerHTML = '<p>Utilisateur connecté.</p>';
// document.getElementById('select-button').classList.remove('disabled');
//     document.getElementById('ready').textContent = 'Not ready';
//     document.getElementById('play-button').style.display = 'block';
//     document.getElementById('cancel-button').style.display = 'none';
}