// Variables pour le chronomètre
let startTime = null;

// Fonction pour formater le temps en mm:ss
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Fonction pour mettre à jour le chronomètre
function updateChrono() {
    if (startTime) {
        const elapsed = Date.now() - startTime;
        view.updateStatus(`<p>${formatTime(elapsed)}</p>`);
    }
}