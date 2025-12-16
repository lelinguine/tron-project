let username = localStorage.getItem('username');

if (username) {
    document.getElementById('username').textContent = `Bienvenue ${username}`;
}

function connect() {
    username = document.getElementById('user_username').value;
    const password = document.getElementById('user_password').value;

    ws.send(
        JSON.stringify({
            type: 'login',
            username,
            password
        })
    );
    document.getElementById('username').textContent = `Bienvenue ${username}`;
}

function logout() {
    ws.close();
    document.getElementById('WebSocketStatus').innerHTML = '<p>WebSocket déonnecté.</p>';
    document.getElementById('WebSocketStatus').classList.remove('failed');
}
