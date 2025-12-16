function updateGame(players) {
    view.gameBoard.innerHTML = '';

    const gridSize = 50; // Taille de la grille par défaut

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${gridSize} ${gridSize}`);

    // Créer un defs pour le pattern
    const defs = document.createElementNS(svgNS, 'defs');

    // Créer un pattern qui affiche seulement la portion 192x192 de la tileset
    const pattern = document.createElementNS(svgNS, 'pattern');
    pattern.setAttribute('id', 'tilesetPattern');
    pattern.setAttribute('x', '0');
    pattern.setAttribute('y', '0');
    pattern.setAttribute('width', gridSize.toString());
    pattern.setAttribute('height', gridSize.toString());
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');

    // Wrapper pour clipper la zone
    const svgWrapper = document.createElementNS(svgNS, 'svg');
    svgWrapper.setAttribute('x', '0');
    svgWrapper.setAttribute('y', '0');
    svgWrapper.setAttribute('width', gridSize.toString());
    svgWrapper.setAttribute('height', gridSize.toString());
    svgWrapper.setAttribute('viewBox', '0 0 192 192'); // Ne montrer que les 192x192 premiers pixels

    const image = document.createElementNS(svgNS, 'image');
    image.setAttribute('x', '0');
    image.setAttribute('y', '0');
    image.setAttribute('width', '576');
    image.setAttribute('height', '384');
    image.setAttribute('href', 'assets/Tileset/Tilemap_color5.png');

    svgWrapper.appendChild(image);
    pattern.appendChild(svgWrapper);
    defs.appendChild(pattern);
    svg.appendChild(defs);

    // Créer un rectangle de fond avec le pattern
    const background = document.createElementNS(svgNS, 'rect');
    background.setAttribute('x', '0');
    background.setAttribute('y', '0');
    background.setAttribute('width', gridSize.toString());
    background.setAttribute('height', gridSize.toString());
    background.setAttribute('fill', 'url(#tilesetPattern)');
    svg.appendChild(background);

    // Dessiner la grille
    for (let i = 0; i <= gridSize; i++) {
        // Ligne verticale
        const vLine = document.createElementNS(svgNS, 'line');
        vLine.setAttribute('x1', i);
        vLine.setAttribute('y1', 0);
        vLine.setAttribute('x2', i);
        vLine.setAttribute('y2', gridSize);
        vLine.setAttribute('stroke', '#2A2D37');
        vLine.setAttribute('stroke-width', '0.1');
        svg.appendChild(vLine);

        // Ligne horizontale
        const hLine = document.createElementNS(svgNS, 'line');
        hLine.setAttribute('x1', 0);
        hLine.setAttribute('y1', i);
        hLine.setAttribute('x2', gridSize);
        hLine.setAttribute('y2', i);
        hLine.setAttribute('stroke', '#2A2D37');
        hLine.setAttribute('stroke-width', '0.1');
        svg.appendChild(hLine);
    }

    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        
        if (!player.isAlive) continue;

        const color = player.color;

        // Dessiner la traînée (trail)
        if (player.trail && player.trail.length > 0) {
            const polyline = document.createElementNS(svgNS, 'polyline');

            // On construit la liste des points (centrés dans les cases)
            let points = player.trail.map((p) => `${p.x + 0.5},${p.y + 0.5}`).join(' ');

            // On ajoute la position actuelle si elle n'est pas déjà le dernier point
            const lastPoint = player.trail[player.trail.length - 1];
            if (lastPoint.x !== player.position.x || lastPoint.y !== player.position.y) {
                points += ` ${player.position.x + 0.5},${player.position.y + 0.5}`;
            }

            polyline.setAttribute('points', points);
            polyline.setAttribute('fill', 'none');
            polyline.setAttribute('stroke', color);
            polyline.setAttribute('stroke-width', '1');
            polyline.setAttribute('stroke-linecap', 'square');
            polyline.setAttribute('stroke-linejoin', 'round');
            svg.appendChild(polyline);
        }

        // Dessiner la tête du joueur avec la première frame du mouton
        const clipId = `sheep-clip-${player.username}`;
        const defs = document.createElementNS(svgNS, 'defs');
        const clipPath = document.createElementNS(svgNS, 'clipPath');
        clipPath.setAttribute('id', clipId);
        const clipRect = document.createElementNS(svgNS, 'rect');
        clipRect.setAttribute('x', player.position.x - 1.5);
        clipRect.setAttribute('y', player.position.y - 1.5);
        clipRect.setAttribute('width', '4');
        clipRect.setAttribute('height', '4');
        clipPath.appendChild(clipRect);
        defs.appendChild(clipPath);
        svg.appendChild(defs);

        // Appliquer un flip horizontal si le joueur va vers la gauche
        const group = document.createElementNS(svgNS, 'g');
        if (player.direction === 'left') {
            group.setAttribute(
                'transform',
                `scale(-1, 1) translate(${-(player.position.x + 0.5) * 2}, 0)`
            );
        }

        const image = document.createElementNS(svgNS, 'image');
        image.setAttribute('x', player.position.x - 1.5);
        image.setAttribute('y', player.position.y - 1.5);
        image.setAttribute('width', '48');
        image.setAttribute('height', '4');
        image.setAttribute('href', 'assets/Resources/Sheep/Sheep_Grass.png');
        image.setAttribute('clip-path', `url(#${clipId})`);
        group.appendChild(image);
        svg.appendChild(group);

        // Afficher le nom du joueur
        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', player.position.x + 0.5);
        text.setAttribute('y', player.position.y - 0.5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', color);
        text.setAttribute('font-size', '1.4');
        text.style.textShadow = `0 0 1px ${color}, 0 0 2px ${color}, 0 0 2px ${color}`;
        text.textContent = player.username;
        svg.appendChild(text);
    }

    view.gameBoard.appendChild(svg);
}

function handleKeydown(event) {
    // Récupère le username depuis le localStorage
    const username = localStorage.getItem('username');
    if (!username) return;

    let direction = null;

    switch (event.key) {
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

    if (direction) {
        ws.send(
            JSON.stringify({
                type: 'changeDirection',
                username: username,
                newDirection: direction
            })
        );
    }
}

let listenetSet = false;
