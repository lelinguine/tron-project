const ws = new WebSocket('ws://localhost:9898');

ws.onopen = function () {
    view.updateStatus('<p>Serveur connecté.</p>');
};

// Gestionnaire global des messages WebSocket
ws.onmessage = function (e) {
    const data = JSON.parse(e.data);
    console.log('Message reçu:', data);

    // Événement: Réponse de login
    if (data.type === 'login') {
        if (data.ok) {
            view.updateStatus('<p>Utilisateur connecté.</p>');
            localStorage.setItem('username', data.user.username);
            goTo('lobby-section');
        } else {
            view.updateStatus(`<p>${data.error}</p>`, true);
        }
    }

    //  Événement: attente je joueur
    else if (data.state === 'waiting') {
        view.updateStatus(`<p>${data.success}</p>`);
        view.waitingState.textContent = `En attente de joueurs (${data.message})`;
        goTo('waiting-section');
    }

    //  Événement: partie prête
    else if (data.state === 'ready') {
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
    else if (data.state === 'playing') {
        goTo('game-section');
        updateGame(data.players);
    }

    // Événement: La partie est terminée
    else if (data.state === 'finished') {
        document.removeEventListener('keydown', handleKeydown);
        listenetSet = false;

        view.updateStatus('<p>Partie terminée !</p>');
        view.displayResultList(data.players);
        goTo('result-section');
    } else {
        console.warn('Type de message inconnu:', data);
    }
};

ws.onerror = function (error) {
    console.error('WebSocket Error:', error);
    view.updateStatus('<p>Erreur de connexion.</p>', true);
};
