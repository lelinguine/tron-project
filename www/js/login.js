const ws = new WebSocket('ws://localhost:9898');

ws.onopen = function () {
    document.getElementById('status').innerHTML = '<p>Serveur connecté.</p>';
};

let username = '';

function connect() {
    username = document.getElementById('user_username').value;
    const password = document.getElementById('user_password').value;

    ws.send(JSON.stringify({
        type: 'login',
        username: username,
        password: password
    }));

    ws.onmessage = function (e) {
        const data = JSON.parse(e.data);
        if (data.ok) {
            document.getElementById('status').innerHTML = `<p>${data.success}</p>`;
            document.getElementById('status').classList.remove('failed');
            goTo('login-section', 'lobby-section');
        } else {
            document.getElementById('status').innerHTML = `<p>${data.error}</p>`;
            document.getElementById('status').classList.add('failed');
        }
    };

    ws.onerror = function (error) {
        console.error('WebSocket Error:', error);
        document.getElementById('status').innerHTML = `<p>${error}</p>`;
        document.getElementById('status').classList.add('failed');
    }
}

function logout() {
    ws.close();
    document.getElementById('WebSocketStatus').innerHTML = '<p>WebSocket disconnected.</p>';
    document.getElementById('WebSocketStatus').classList.remove('failed');
}






function join() {

    ws.send(JSON.stringify({
        type: 'joinGame',
        username: username
    }));

    ws.onmessage = function (e) {
        const data = JSON.parse(e.data);
        if (data.ok) {
            document.getElementById('status').innerHTML = `<p>${data.success} ${data.nbPlayers}/2</p>`;
            document.getElementById('status').classList.remove('failed');
            goTo('login-section', 'lobby-section');
        } else {
            document.getElementById('status').innerHTML = `<p></p>`;
            document.getElementById('status').classList.add('failed');
        }
    };

    ws.onerror = function (error) {

    }
}