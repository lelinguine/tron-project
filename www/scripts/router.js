let currentPage = document.getElementById('enter-section');

async function goTo(target) {
    currentPage.style.display = 'none';
    currentPage = document.getElementById(target);
    currentPage.style.display = 'flex';
}

view.startBtn.addEventListener('click', () => {
    goTo(username ? 'lobby-section' : 'login-section');
});
