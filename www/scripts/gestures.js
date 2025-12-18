let xDown = null;
let yDown = null;
const MIN_DISTANCE = 30; // px, seuil pour considérer un swipe

/**
 * Gestionnaire du début du touch.
 *
 * @param {TouchEvent} evt - L'événement touch.
 */
function handleTouchStart(evt) {
    console.log('Touch start detected');
    const firstTouch = evt.touches[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

/**
 * Gestionnaire de la fin du touch.
 *
 * @param {TouchEvent} evt - L'événement touch.
 */
function handleTouchEnd(evt) {
    console.log('Touch end detected');
    if (xDown === null || yDown === null) return;

    const lastTouch = evt.changedTouches[0];
    const xUp = lastTouch.clientX;
    const yUp = lastTouch.clientY;

    const xDiff = xUp - xDown;
    const yDiff = yUp - yDown;

    // swipe horizontal
    if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > MIN_DISTANCE) {
        if (xDiff > 0) {
            handleArrowRight();
        } else {
            handleArrowLeft();
        }
    }
    // swipe vertical
    else if (Math.abs(yDiff) > MIN_DISTANCE) {
        if (yDiff > 0) {
            // équivaut à flèche bas
            handleArrowDown();
        } else {
            // équivaut à flèche haut
            handleArrowUp();
        }
    }

    xDown = null;
    yDown = null;
}

/**
 * Envoie une direction au serveur via WebSocket.
 *
 * @param {string} direction - La direction à envoyer.
 */
function sendDirection(direction) {
    console.log(`Sending direction: ${direction}`);
    if (ws && ws.readyState === WebSocket.OPEN && username) {
        ws.send(
            JSON.stringify({
                type: RequestType.ChangeDirection,
                username,
                newDirection: direction
            })
        );
    }
}

function handleArrowLeft() {
    sendDirection(Direction.Left);
}

function handleArrowRight() {
    sendDirection(Direction.Right);
}

function handleArrowUp() {
    sendDirection(Direction.Up);
}

function handleArrowDown() {
    sendDirection(Direction.Down);
}
