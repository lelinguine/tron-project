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
        view.updateStatus(`<p>${formatTime(elapsed)}</p>`);
    }
}