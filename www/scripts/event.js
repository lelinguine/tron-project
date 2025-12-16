let ws = new WebSocket('ws://localhost:9898');

ws.onopen = function () {
    view.updateStatus('<p>Serveur connecté</p>');
};

// Gestionnaire global des messages WebSocket
ws.onmessage = function (e) {
    const data = JSON.parse(e.data);

    // Événement: Réponse de login
    if (data.type === 'login') {
        if (data.ok) {
            // Stockage du nom d'utilisateur
            username = data.user.username;
            localStorage.setItem('username', username);
            // Mise à jour de l'interface
            onConnected();
        } else {
            view.updateStatus(`<p>${data.error}</p>`, true);
        }
    }

    // Événement: Reçu du classement
    if (data.type === 'rank') {
        if (data.ok) {
            // Stockage du nom d'utilisateur
            username = data.user.username;
            localStorage.setItem('username', username);
            // Mise à jour de l'interface
            onConnected();
        } else {
            view.updateStatus(`<p>${data.error}</p>`, true);
        }
    }

    //  Événement: attente je joueur
    else if (data.state === GameState.Waiting) {
        view.updateStatus(`<p>${data.success}</p>`);
        view.waitingState.textContent = `En attente de joueurs (${data.message})`;
        goTo('waiting-section');
    }

    //  Événement: partie prête
    else if (data.state === GameState.Ready) {
        if (!listenetSet) {
            document.addEventListener('keydown', handleKeydown);
            listenetSet = true;
        }

        view.updateStatus(`<p>${data.message}</p>`);
        goTo('game-section');

        view.updateStatus(data.message);
        updateGame(data.players);
    }

    // Événement: La partie démarre
    else if (data.state === GameState.Playing) {
        goTo('game-section');
        updateGame(data.players);
    }

    // Événement: La partie est terminée
    else if (data.state === GameState.Finished) {
        document.removeEventListener('keydown', handleKeydown);
        listenetSet = false;

        view.updateStatus('<p>Partie terminée !</p>');
        view.displayResultList(data.players);
        view.quitBtn.style.display = 'block';
        goTo('result-section');
    } else {
        console.warn('Type de message inconnu:', data);
    }
};

ws.onerror = function (error) {
    console.error('WebSocket Error:', error);
    view.updateStatus('<p>Erreur de connexion</p>', true);
};
