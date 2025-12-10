function join() {
    // Récupère le username depuis le localStorage
    const username = localStorage.getItem('username');
    ws.send(JSON.stringify({
        type: 'joinGame',
        username: username
    }));
    document.getElementById('ready').textContent = 'Ready';
    document.getElementById('play-button').style.display = 'none';
    // document.getElementById('cancel-button').style.display = 'block';
}

function cancelJoin() {
    // ws.send(JSON.stringify({
    //     type: 'cancelJoin',
    //     username: username
    // }));
    document.getElementById('status').innerHTML = '<p>Utilisateur connecté.</p>';
    document.getElementById('ready').textContent = 'Not ready';
    document.getElementById('play-button').style.display = 'block';
    document.getElementById('cancel-button').style.display = 'none';
}