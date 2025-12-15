let username;

function connect() {
    username = document.getElementById('user_username').value;
    const password = document.getElementById('user_password').value;

    ws.send(JSON.stringify({
        type: 'login',
        username: username,
        password: password
    }));
    document.getElementById('username').textContent = username;
}

function logout() {
    ws.close();
    document.getElementById('WebSocketStatus').innerHTML = '<p>WebSocket disconnected.</p>';
    document.getElementById('WebSocketStatus').classList.remove('failed');
}