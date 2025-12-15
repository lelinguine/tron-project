const ws = new WebSocket('ws://localhost:9898');

ws.onopen = function () {
    document.getElementById('status').innerHTML = '<p>Serveur connecté.</p>';
};

// Gestionnaire global des messages WebSocket
ws.onmessage = function (e) {
    const data = JSON.parse(e.data);
    console.log('Message reçu:', data);

    // Événement: Réponse de login
    if (data.type === 'login') {
        if (data.ok) {
            document.getElementById('status').innerHTML = `<p>Utilisateur connecté.</p>`;
            document.getElementById('status').classList.remove('failed');
            if (data.success && data.success.includes('connecté')) {
                goTo('login-section', 'lobby-section');
            }
        } else {
            document.getElementById('status').innerHTML = `<p>${data.error}</p>`;
            document.getElementById('status').classList.add('failed');
        }
    }

    // Événement: En attente d'autres joueurs
    else if (data.type === 'waiting_for_players') {
        document.getElementById('status').innerHTML = `<p>${data.success}</p>`;
        document.getElementById('status').classList.remove('failed');
    }

    //  Événement: En attente de la partie
    else if (data.state === 'waiting') {
        document.getElementById('status').innerHTML = `<p>${data.message}</p>`;
        document.getElementById('status').classList.remove('failed');
        goTo('lobby-section', 'game-section');
        updateGame(data.players);
    }

    // Événement: La partie démarre
    else if (data.state === 'playing') {
        document.getElementById('status').innerHTML = `<p></p>`;
        document.getElementById('status').classList.remove('failed');
        goTo('lobby-section', 'game-section');
        updateGame(data.players);
    }

    // Événement: La partie est terminée
    else if (data.state === 'finished') {
        document.getElementById('status').innerHTML = `<p>Partie terminée !</p>`;
        document.getElementById('status').classList.add('failed');
        document.getElementById('quit-button').style.display = 'block';
    }
    
    else {
        console.warn('Type de message inconnu:', data);
    }
};

ws.onerror = function (error) {
    console.error('WebSocket Error:', error);
    document.getElementById('status').innerHTML = `<p>Erreur de connexion.</p>`;
    document.getElementById('status').classList.add('failed');
};