import RequestType from './enums/RequestType.js';

let username = localStorage.getItem('username');

if (username) {
    view.welcomeMessage.textContent = `Bienvenue ${username}`;
}

function connect() {
    // Récupération des valeurs des champs de saisie
    username = view.usernameInput.value;
    const password = view.passwordInput.value;

    // Envoi des informations de connexion au serveur
    ws.send(
        JSON.stringify({
            type: RequestType.Login,
            username,
            password
        })
    );

    // Affichage du message de bienvenue
    view.welcomeMessage.textContent = `Bienvenue ${username}`;
}

function logout() {
    // Fermeture de la connexion
    ws.close();
    view.updateStatus('<p>WebSocket déonnecté.</p>');
    // Suppression du nom d'utilisateur stocké
    username = null;
    localStorage.removeItem('username');
    // Retour à l'écran d'accueil
    goTo('enter-section');
}

view.loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    connect();
});
