let currentPage = document.getElementById('enter-section');

async function goTo(target) {
    if (target === 'login-section' && username) {
        target = 'lobby-section';
    }

    currentPage.style.display = 'none';
    currentPage = document.getElementById(target);
    currentPage.style.display = 'flex';
}
