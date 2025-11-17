const ws = new WebSocket('ws://localhost:9898');

function connect() {


    //récupérer input user_username et user_password
    const username = document.getElementById('user_username').value;
    const password = document.getElementById('user_password').value;


    //utiliser fetch pour envoyer les données au serveur
    fetch('http://localhost:9898/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.ok) {
            document.getElementById('loginStatus').innerText = 'Login successful! Welcome, ' + data.user.username;
        } else {
            document.getElementById('loginStatus').innerText = 'Login failed: ' + data.error;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('loginStatus').innerText = 'An error occurred during login.';
    });



    
}






// // Create the Web socket !
// const ws = new WebSocket('ws://localhost:9898/');


// ws.onopen = function () {
//     console.log('WebSocket Client Connected');
//     ws.send('Hi this is web client.');
// };

// ws.onmessage = function (e) {
//     console.log("Received: '" + e.data + "'");
//     document.getElementById('WebSocketStatus').innerText = 'Received from server :' + e.data;
// };




// ws.onerror = function (e) {
//     console.error("WebSocket error:", e);
//     document.getElementById('WebSocketStatus').innerText = 'WebSocket error. See console for details.';
// }

// ws.onclose = function (e) {
//     console.log("WebSocket closed:", e);
//     document.getElementById('WebSocketStatus').innerText = 'WebSocket connection closed.';
// }