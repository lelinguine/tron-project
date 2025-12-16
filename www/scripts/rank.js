let previousPage = null;

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

function displayRank(rank) {
    view.rankList.innerHTML = '';

    if (rank.length === 0) {
        view.rankList.innerHTML = "Aucune partie jouée pour l'instant";
        view.rankList.style.listStyle = 'none';
        return;
    }

    view.rankList.style.listStyle = 'number';
    for (let i = 0; i < rank.length; i++) {
        const player = rank[i];
        view.rankList.innerHTML += `<li>${player.username} : ${player.victories} victoire${
            player.victories > 1 ? 's' : ''
        }, ${player.totalScore} points</li>`;
    }
}
