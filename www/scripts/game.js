function updateGame(players) {
    const gameboard = document.getElementById('gameboard');
    if (!gameboard) return;
    
    gameboard.innerHTML = '';

    const gridSize = 50; // Taille de la grille par défaut

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${gridSize} ${gridSize}`);
    svg.style.backgroundColor = "#1a1a1a";

    // Dessiner la grille
    for (let i = 0; i <= gridSize; i++) {
        // Ligne verticale
        const vLine = document.createElementNS(svgNS, "line");
        vLine.setAttribute("x1", i);
        vLine.setAttribute("y1", 0);
        vLine.setAttribute("x2", i);
        vLine.setAttribute("y2", gridSize);
        vLine.setAttribute("stroke", "#2a2a2a");
        vLine.setAttribute("stroke-width", "0.1");
        svg.appendChild(vLine);

        // Ligne horizontale
        const hLine = document.createElementNS(svgNS, "line");
        hLine.setAttribute("x1", 0);
        hLine.setAttribute("y1", i);
        hLine.setAttribute("x2", gridSize);
        hLine.setAttribute("y2", i);
        hLine.setAttribute("stroke", "#2a2a2a");
        hLine.setAttribute("stroke-width", "0.1");
        svg.appendChild(hLine);
    }

    if (players) {
        players.forEach(player => {
            if (!player.isAlive) return;

            const color = player.color;

            // Dessiner la traînée (trail)
            if (player.trail && player.trail.length > 0) {
                const polyline = document.createElementNS(svgNS, "polyline");
                
                // On construit la liste des points (centrés dans les cases)
                let points = player.trail.map(p => `${p.x + 0.5},${p.y + 0.5}`).join(" ");
                
                // On ajoute la position actuelle si elle n'est pas déjà le dernier point
                const lastPoint = player.trail[player.trail.length - 1];
                if (lastPoint.x !== player.position.x || lastPoint.y !== player.position.y) {
                    points += ` ${player.position.x + 0.5},${player.position.y + 0.5}`;
                }

                polyline.setAttribute("points", points);
                polyline.setAttribute("fill", "none");
                polyline.setAttribute("stroke", color);
                polyline.setAttribute("stroke-width", "1");
                polyline.setAttribute("stroke-linecap", "square");
                polyline.setAttribute("stroke-linejoin", "round");
                svg.appendChild(polyline);
            }

            // Dessiner la tête du joueur avec la première frame du mouton
            const clipId = `sheep-clip-${player.username}`;
            const defs = document.createElementNS(svgNS, "defs");
            const clipPath = document.createElementNS(svgNS, "clipPath");
            clipPath.setAttribute("id", clipId);
            const clipRect = document.createElementNS(svgNS, "rect");
            clipRect.setAttribute("x", player.position.x - 1.5);
            clipRect.setAttribute("y", player.position.y - 1.5);
            clipRect.setAttribute("width", "4");
            clipRect.setAttribute("height", "4");
            clipPath.appendChild(clipRect);
            defs.appendChild(clipPath);
            svg.appendChild(defs);
            
            // Appliquer un flip horizontal si le joueur va vers la gauche
            const group = document.createElementNS(svgNS, "g");
            if (player.direction === 'left') {
                group.setAttribute("transform", `scale(-1, 1) translate(${-(player.position.x + 0.5) * 2}, 0)`);
            }
            
            const image = document.createElementNS(svgNS, "image");
            image.setAttribute("x", player.position.x - 1.5);
            image.setAttribute("y", player.position.y - 1.5);
            image.setAttribute("width", "48");
            image.setAttribute("height", "4");
            image.setAttribute("href", "assets/Resources/Sheep/Sheep_Grass.png");
            image.setAttribute("clip-path", `url(#${clipId})`);
            group.appendChild(image);
            svg.appendChild(group);

            // Afficher le nom du joueur
            const text = document.createElementNS(svgNS, "text");
            text.setAttribute("x", player.position.x + 0.5);
            text.setAttribute("y", player.position.y - 0.5);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("fill", color);
            text.setAttribute("font-size", "1.4");
            text.style.textShadow = `0 0 1px ${color}, 0 0 2px ${color}, 0 0 2px ${color}`;
            text.textContent = player.username;
            svg.appendChild(text);
        });
    }

    gameboard.appendChild(svg);
}

// Écoute les touches directionnelles pour changer de direction
document.addEventListener('keydown', function(event) {
    // Récupère le username depuis le localStorage
    const username = localStorage.getItem('username');
    if (!username) return;

    console.log('Touche appuyée:', event.key + ' par ' + username);

    let direction = null;

    switch(event.key) {
        case 'ArrowUp':
            direction = 'up';
            event.preventDefault();
            break;
        case 'ArrowDown':
            direction = 'down';
            event.preventDefault();
            break;
        case 'ArrowLeft':
            direction = 'left';
            event.preventDefault();
            break;
        case 'ArrowRight':
            direction = 'right';
            event.preventDefault();
            break;
    }

    if (direction && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'changeDirection',
            username: username,
            newDirection: direction
        }));
    }
});