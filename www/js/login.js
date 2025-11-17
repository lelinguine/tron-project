const ws = new WebSocket('ws://localhost:9898');

ws.onopen = function () {
    console.log('WebSocket Client Connected');
};

function connect() {
    const username = document.getElementById('user_username').value;
    const password = document.getElementById('user_password').value;

    ws.send(JSON.stringify({
        type: 'login',
        username: username,
        password: password
    }));

    ws.onmessage = function (e) {
        console.log('Received:', e.data);
        const data = JSON.parse(e.data);
        if (data.ok) {
            document.getElementById('status').innerHTML = '<p>Login successful!</p>';
            document.getElementById('status').classList.add('success');
        } else {
            document.getElementById('status').innerHTML = `<p>Login failed</p>`;
            document.getElementById('status').classList.add('failed');
        }
    };

    ws.onerror = function (error) {
        console.error('WebSocket Error:', error);
        document.getElementById('status').innerHTML = '<p>An error occurred.</p>';
        document.getElementById('status').classList.add('failed');
    }
}

function logout() {
    ws.close();
    document.getElementById('WebSocketStatus').innerHTML = '<p>WebSocket disconnected.</p>';
    document.getElementById('WebSocketStatus').classList.remove('success', 'failed');
}