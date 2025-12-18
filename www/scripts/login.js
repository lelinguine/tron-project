/**
 * Le nom de l'utilisateur actuellement connecté.
 *
 * @type {(string | null)}
 */
let username = localStorage.getItem('username');

if (username) {
    onConnected(false);
}

// Connection
view.loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Vérification que les champs ne sont pas vides
    if (view.usernameInput.value === '' || view.passwordInput.value === '') {
        view.updateStatus('Veuillez saisir tous les champs.', true);
        return;
    }

    // Envoi des informations de connexion au serveur
    ws.send(
        JSON.stringify({
            type: RequestType.Login,
            username: view.usernameInput.value,
            password: view.passwordInput.value
        })
    );

    // Réinitialisation des champs du formulaire
    view.passwordInput.value = '';
});

/**
 * Actions à effectuer une fois connecté.
 *
 * @param {boolean} [goToLobby=true] - Indique si l'on doit aller au lobby.
 */
function onConnected(goToLobby = true) {
    view.updateStatus('Utilisateur connecté.');
    view.welcomeMessage.textContent = `Bienvenue ${username} 👋🏻`;
    view.logoutBtn.style.display = 'block';
    if (goToLobby) goTo('lobby-section');
}

view.logoutBtn.addEventListener('click', () => {
    // Fermeture de la connexion
    ws.close();
    view.updateStatus('Déconnecté');
    view.logoutBtn.style.display = 'none';
    // Suppression du nom d'utilisateur stocké
    username = null;
    localStorage.removeItem('username');
    // Retour à l'écran d'accueil
    goTo('enter-section');
    // Création d'une nouvelle connexion WebSocket
    newWebSocket();
});
