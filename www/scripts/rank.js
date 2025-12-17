let previousPage = null;

// Ouverture et fermeture de la section du classement
view.openRankBtn.addEventListener('click', () => {
    if (previousPage === null) {
        previousPage = currentPage.id;
        ws.send(JSON.stringify({ type: RequestType.GetDashboard }));
        goTo('rank-section');
        view.openRankBtn.textContent = 'Retour';
    } else {
        goTo(previousPage);
        previousPage = null;
        view.openRankBtn.textContent = 'Classement';
    }
});
