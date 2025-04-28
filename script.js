const canvas = document.getElementById('tacticsCanvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');
const prevBoardBtn = document.getElementById('prevBoardBtn');
const nextBoardBtn = document.getElementById('nextBoardBtn');
const addBoardBtn = document.getElementById('addBoardBtn');
const boardIndicator = document.getElementById('boardIndicator');
const colorBtns = document.querySelectorAll('.color-btn'); // Get all color buttons
// const colorInput = document.getElementById('colorInput'); // If using color input
// --- Add reference to the new button ---
const playBtn = document.getElementById('playBtn');

// --- Configuration ---
const playerRadius = 10;
const pitchImageSrc = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Football_pitch_v.svg/1200px-Football_pitch_v.svg.png';
const playbackInterval = 2000; // Time in milliseconds between board changes during playback

// --- State ---
let boards = [
    { players: [] }
];
let currentBoardIndex = 0;
let pitchImage = new Image();
let pitchLoaded = false;
let selectedColor = 'blue';
let isPlaying = false; // Track playback state
let playIntervalId = null; // Store the interval ID for stopping

// --- Functions ---

// Function to draw the pitch background (no changes)
function drawPitch() { 
    // ... (keep existing code)
    if (pitchLoaded) {
        ctx.drawImage(pitchImage, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#008000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
        ctx.stroke();
    }}

// Function to draw a single player (no changes)
function drawPlayer(player) { 
    ctx.beginPath();
    ctx.arc(player.x, player.y, playerRadius, 0, Math.PI * 2);
    // Use the color stored in the player object
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.strokeStyle = 'black'; // Keep outline consistent or make it dynamic?
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();}

// Function to update the board indicator text and button states
function updateBoardUI() {
    boardIndicator.textContent = `Board ${currentBoardIndex + 1} of ${boards.length}`;
    // Disable navigation if playing, otherwise base on index
    prevBoardBtn.disabled = isPlaying || currentBoardIndex === 0;
    nextBoardBtn.disabled = isPlaying || currentBoardIndex === boards.length - 1;
    // Disable other controls during playback
    addBoardBtn.disabled = isPlaying;
    clearBtn.disabled = isPlaying;
    canvas.style.pointerEvents = isPlaying ? 'none' : 'auto'; // Disable drawing on canvas
    colorBtns.forEach(btn => btn.disabled = isPlaying);

    // Update Play button text/symbol
    playBtn.textContent = isPlaying ? '⏹ Stop' : '▶ Play';
    playBtn.title = isPlaying ? 'Stop Playback' : 'Play Boards';
}

// Function to redraw the entire canvas for the CURRENT board (no changes)
function redrawCanvas() { 
    // ... (keep existing code)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPitch();
    const currentBoard = boards[currentBoardIndex];
    if (currentBoard && currentBoard.players) {
        currentBoard.players.forEach(drawPlayer);
    }
    updateBoardUI();}

// Function to stop playback
function stopPlayback() {
    if (isPlaying) {
        clearInterval(playIntervalId); // Clear the interval timer
        playIntervalId = null;
        isPlaying = false;
        console.log("Playback stopped.");
        updateBoardUI(); // Re-enable controls and update button text
    }
}

// Function to switch to a specific board
function switchToBoard(index) {
    if (index >= 0 && index < boards.length) {
        // Stop playback if manually switching boards
        stopPlayback();
        currentBoardIndex = index;
        redrawCanvas(); // redrawCanvas calls updateBoardUI
    }
}

// Function to add a new empty board
function addBoard() {
    // Stop playback before adding a board
    stopPlayback();
    boards.push({ players: [] });
    switchToBoard(boards.length - 1);
}

// Function to get mouse position relative to the canvas (no changes)
function getMousePos(event) { 
    // ... (keep existing code)
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
    };}

// Function to update the visual selection state of color buttons (no changes)
function updateColorSelectionUI() {
    colorBtns.forEach(btn => {
        if (btn.dataset.color === selectedColor) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
    // If using color input:
    // if (colorInput) colorInput.value = selectedColor;
    }

// --- Event Listeners ---

// Handle clicks on the canvas
canvas.addEventListener('click', (event) => {
    if (isPlaying) return; // Don't draw if playing
    const pos = getMousePos(event);
    boards[currentBoardIndex].players.push({
        x: pos.x,
        y: pos.y,
        color: selectedColor
    });
    redrawCanvas();
});

// Handle clear button click
clearBtn.addEventListener('click', () => {
    // stopPlayback(); // Already handled by updateBoardUI disabling the button
    if (boards[currentBoardIndex]) {
        boards[currentBoardIndex].players = [];
        redrawCanvas();
    }
});

// Handle navigation button clicks (no changes needed, logic moved to switchToBoard/updateBoardUI)
prevBoardBtn.addEventListener('click', () => switchToBoard(currentBoardIndex - 1));
nextBoardBtn.addEventListener('click', () => switchToBoard(currentBoardIndex + 1));
addBoardBtn.addEventListener('click', addBoard);

// Handle color button clicks
colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // stopPlayback(); // Already handled by updateBoardUI disabling the buttons
        selectedColor = btn.dataset.color;
        console.log("Selected color:", selectedColor);
        updateColorSelectionUI();
    });
});

// --- NEW: Handle Play/Stop button click ---
playBtn.addEventListener('click', () => {
    if (isPlaying) {
        // If currently playing, stop it
        stopPlayback();
    } else {
        // If not playing, start playback (only if more than one board exists)
        if (boards.length <= 1) {
            console.log("Need more than one board to play.");
            // Optionally show a message to the user here
            return;
        }

        isPlaying = true;
        console.log("Playback started.");
        updateBoardUI(); // Disable controls and update button text

        let playbackIndex = currentBoardIndex; // Start from the current board

        // Immediately show the first board in the sequence
        switchToBoard(playbackIndex); // Call stopPlayback internally, then redraws

        // Need to re-enable isPlaying after switchToBoard call because it stops playback
        isPlaying = true;
        updateBoardUI(); // Update UI again to reflect playing state

        playIntervalId = setInterval(() => {
            playbackIndex++;
            if (playbackIndex >= boards.length) {
                playbackIndex = 0; // Loop back to the beginning
            }
            // Directly set index and redraw without calling stopPlayback
            currentBoardIndex = playbackIndex;
            redrawCanvas(); // redrawCanvas calls updateBoardUI which respects isPlaying state
        }, playbackInterval);
    }
});


// --- Initialization ---

pitchImage.onload = () => { 
    pitchLoaded = true;
    console.log("Pitch image loaded.");
    redrawCanvas();
};
pitchImage.onerror = () => {
    console.error("Failed to load pitch image. Drawing fallback green field.");
    redrawCanvas();
};
pitchImage.src = pitchImageSrc;

// Initial draw, UI setup, and color selection UI setup
redrawCanvas();
updateColorSelectionUI();

