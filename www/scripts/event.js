const ws = new WebSocket('ws://localhost:9898');

// Variables pour le chronomètre
let startTime = null;

// Fonction pour formater le temps en mm:ss:ms
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10); // Centièmes de seconde
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
}

// Fonction pour mettre à jour le chronomètre
function updateChrono() {
    if (startTime) {
        const elapsed = Date.now() - startTime;
        document.getElementById('status').innerHTML = `<p>${formatTime(elapsed)}</p>`;
    }
}

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
        startTime = Date.now();
    }

    // Événement: La partie démarre
    else if (data.state === 'playing') {
        updateChrono();
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