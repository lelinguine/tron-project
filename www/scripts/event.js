let ws = new WebSocket('ws://localhost:9898');

/**
 * Création d'une nouvelle connexion WebSocket.
 */
function newWebSocket() {
    ws = new WebSocket('ws://localhost:9898');
    ws.onopen = onConnected;
    ws.onmessage = onMessage;
    ws.onerror = onError;
}

/**
 * Gestionnaire de la connexion WebSocket établie.
 */
function onConnected() {
    view.updateStatus('Serveur connecté');
}

/**
 * Gestionnaire des messages WebSocket.
 *
 * @param {MessageEvent<string>} m - L'Événement de message.
 */
function onMessage(m) {
    const data = JSON.parse(m.data);

    // Événement: Réponse de login
    if (data.type === 'login') {
        if (data.ok) {
            // Stockage du nom d'utilisateur
            username = data.user.username;
            localStorage.setItem('username', username);
            // Mise à jour de l'interface
            onConnected();
        } else {
            view.updateStatus(data.error, true);
        }
    }

    // Événement: Reçu du classement
    if (data.type === 'rank') {
        view.displayRank(data.ranks);
    }

    //  Événement: attente je joueur
    else if (data.state === GameState.Waiting) {
        view.updateStatus(data.success);
        view.waitingState.textContent = `En attente de joueurs (${data.message})`;
        goTo('waiting-section');
    }

    //  Événement: partie prête
    else if (data.state === GameState.Ready) {
        if (!listenerSet) {
            document.addEventListener('keydown', handleKeydown);
            listenerSet = true;
        }
        view.updateStatus('Partie en cours...');
        // Affichage du conmpteur
        view.gameCounter.textContent = data.message;
        if (currentPage.id !== 'game-section') {
            view.gameCounter.style.display = 'block';
            goTo('game-section');
            updateGame(data.players);
        }
    }

    // Événement: La partie démarre
    else if (data.state === GameState.Playing) {
        view.gameCounter.style.display = 'none';
        updateGame(data.players);
    }

    // Événement: La partie est terminée
    else if (data.state === GameState.Finished) {
        document.removeEventListener('keydown', handleKeydown);
        listenerSet = false;

        view.updateStatus('Partie terminée !');
        view.displayResultList(data.players);
        view.quitBtn.style.display = 'block';
        goTo('result-section');
    }

    // Erreur
    else if (data.type === 'error' || data.ok === false) {
        console.error('WebSocket Error:', error);
        view.updateStatus('Erreur serveur', true);
    } else {
        console.warn('Type de message inconnu:', data);
    }
}

/**
 * Gestionnaire des erreurs WebSocket.
 *
 * @param {unknown} error - L'Erreur.
 */
function onError(error) {
    console.error('WebSocket Error:', error);
    view.updateStatus('Erreur de connexion', true);
}

newWebSocket();
