let username = localStorage.getItem('username');

if (username) {
    view.welcomeMessage.textContent = `Bienvenue ${username}`;
    onConnected();
}

function connect() {
    // Envoi des informations de connexion au serveur
    ws.send(
        JSON.stringify({
            type: RequestType.Login,
            username: view.usernameInput.value,
            password: view.passwordInput.value
        })
    );
}

view.loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    connect();
});

function onConnected() {
    view.updateStatus('<p>Utilisateur connecté</p>');
    view.welcomeMessage.textContent = `Bienvenue ${username}`;
    view.logoutBtn.style.display = 'block';
    goTo('lobby-section');
}

function logout() {
    // Fermeture de la connexion
    ws.close();
    ws = new WebSocket('ws://localhost:9898');
    view.updateStatus('<p>Déconnecté</p>');
    view.logoutBtn.style.display = 'none';
    // Suppression du nom d'utilisateur stocké
    username = null;
    localStorage.removeItem('username');
    // Retour à l'écran d'accueil
    goTo('enter-section');
}

view.logoutBtn.addEventListener('click', logout);
