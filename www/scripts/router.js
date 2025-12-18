let currentPage = document.getElementById('enter-section');

/**
 * Change de section.
 *
 * @param {string} target - L'ID de la section cible.
 */
function goTo(target) {
    currentPage.style.display = 'none';
    currentPage = document.getElementById(target);
    currentPage.style.display = 'flex';
}

view.startBtn.addEventListener('click', () => {
    goTo(username ? 'lobby-section' : 'login-section');
});
