document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tacticsCanvas');
    const ctx = canvas.getContext('2d');
    const clearBtn = document.getElementById('clearBtn');
    const addBoardBtn = document.getElementById('addBoardBtn'); // Below canvas
    const prevBoardBtn = document.getElementById('prevBoardBtn');
    const nextBoardBtn = document.getElementById('nextBoardBtn');
    const colorBtns = document.querySelectorAll('.color-btn'); // Get all color buttons
    const boardIndicator = document.getElementById('boardIndicator');
    const navbarBoardsList = document.getElementById('navbarBoardsList');
    // const colorInput = document.getElementById('colorInput'); // If using color input
    // --- Add reference to the new button ---
    const playBtn = document.getElementById('playBtn');
    
    // --- Configuration ---
    const playerRadius = 10;
    const pitchImageSrc = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Football_pitch_v.svg/1200px-Football_pitch_v.svg.png';
    const playbackInterval = 2000; // Time in milliseconds between board changes during playback
    
    const deleteBoardBtn = document.getElementById('deleteBoardBtn'); // Get delete button
    // Add other elements like color pickers, play button etc.

    // --- State Management ---
    let boardsData = [createNewBoardState()]; // Start with one empty board state
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
    // Function to create a default/empty state for a board
    function createNewBoardState() {
        // Store whatever data represents your board's state
        // Example: positions of players, drawn lines, etc.
        return {
            players: [],
            lines: [],
            // Add other properties as needed
            canvasState: null // To store canvas image data (optional, but good for performance)
        };
    }

    // --- Board Operations ---

    // Function to save the current canvas state to the boardsData array
    function saveCurrentBoardState() {
        if (boardsData[currentBoardIndex]) {
            // Example: Save drawn elements
            // boardsData[currentBoardIndex].players = currentPlayers;
            // boardsData[currentBoardIndex].lines = currentLines;

            // Or save the entire canvas image data
            boardsData[currentBoardIndex].canvasState = canvas.toDataURL();
        }
    }

    // Function to load a board's state onto the canvas
    function loadBoardState(index) {
        if (boardsData[index]) {
            const boardState = boardsData[index];
            clearCanvas(); // Clear before loading

            // Example: Restore drawn elements
            // currentPlayers = boardState.players;
            // currentLines = boardState.lines;
            // redrawEverything(); // Your function to draw players/lines

            // Or restore from saved image data
            if (boardState.canvasState) {
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                };
                img.src = boardState.canvasState;
            } else {
                // If no saved state, just ensure canvas is clear or draw default elements
                 redrawEverything(); // Make sure you have a function to draw the current state
            }
        }
    }

    // Function to add a new board
    window.addBoard = () => { // Make it global for the inline script or navbar listener
        saveCurrentBoardState(); // Save the state of the board we are leaving
        boardsData.push(createNewBoardState());
        currentBoardIndex = boardsData.length - 1; // Switch to the new board
        clearCanvas(); // Clear canvas for the new board
        updateUI();
    };

    // Function to switch to a specific board index
    window.switchToBoard = (index) => { // Make it global
        if (index >= 0 && index < boardsData.length && index !== currentBoardIndex) {
            saveCurrentBoardState(); // Save the state of the board we are leaving
            currentBoardIndex = index;
            loadBoardState(currentBoardIndex); // Load the state of the new board
            updateUI();
        }
    };

     // Function to delete the current board
     function deleteCurrentBoard() {
        if (boardsData.length <= 1) {
            alert("Cannot delete the last board.");
            return; // Don't delete if it's the only one
        }

        const boardNameToDelete = `Board ${currentBoardIndex + 1}`;
        if (!confirm(`Are you sure you want to delete ${boardNameToDelete}?`)) {
            return; // User cancelled
        }


        boardsData.splice(currentBoardIndex, 1); // Remove the current board's data

        // Adjust currentBoardIndex if necessary
        if (currentBoardIndex >= boardsData.length) {
            currentBoardIndex = boardsData.length - 1;
        }

        loadBoardState(currentBoardIndex); // Load the (new) current board
        updateUI();
    }


    // --- UI Updates ---

    // Function to update all relevant UI elements
    function updateUI() {
        updateBoardIndicator();
        updateNavbarBoardsList();
        updateNavigationButtons();
        // Potentially update active color button, etc.
    }

    // Update the "Board X of Y" indicator
    function updateBoardIndicator() {
        boardIndicator.textContent = `Board ${currentBoardIndex + 1} of ${boardsData.length}`;
    }

    // Update the list of boards in the navbar dropdown
    function updateNavbarBoardsList() {
        navbarBoardsList.innerHTML = ''; // Clear existing items
        boardsData.forEach((board, index) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.className = 'dropdown-item';
            a.href = '#';
            a.textContent = `Board ${index + 1}`;
            a.setAttribute('data-board-index', index);
            if (index === currentBoardIndex) {
                a.classList.add('active'); // Highlight the current board
            }
            // Event listener for switching is handled by the inline script or can be added here
            li.appendChild(a);
            navbarBoardsList.appendChild(li);
        });
    }

    // Enable/disable Prev/Next buttons based on current index
    function updateNavigationButtons() {
        prevBoardBtn.disabled = currentBoardIndex === 0;
        nextBoardBtn.disabled = currentBoardIndex === boardsData.length - 1;
        deleteBoardBtn.disabled = boardsData.length <= 1; // Disable delete if only one board
    }

    // --- Canvas Setup & Drawing ---

    function resizeCanvas() {
        // Make canvas responsive (adjust based on container size)
        const container = canvas.parentElement; // Or the .soccer-field div
        // Maintain aspect ratio (e.g., 4:3 or 16:9) or set fixed size
        const containerWidth = container.clientWidth - 40; // Account for padding
         // Simple fixed height for now, adjust as needed
        const fixedHeight = container.clientHeight - 150; // Estimate space taken by other elements

        canvas.width = containerWidth;
        // canvas.height = containerWidth * (3 / 4); // Example aspect ratio
        canvas.height = fixedHeight > 150 ? fixedHeight : 150; // Ensure minimum height


        // Redraw content after resizing
        loadBoardState(currentBoardIndex); // Reload state which includes drawing
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Maybe draw the basic field lines here if they are static
        // drawFieldLines();
    }

    function redrawEverything() {
        clearCanvas();
        // Add your logic here to draw players, lines, etc., based on
        // the current state (e.g., currentPlayers, currentLines)
        // which should have been loaded by loadBoardState.
        console.log("Redrawing board:", currentBoardIndex);

        // Example: if using saved image data, loadBoardState handles it.
        // If drawing elements:
        // drawPlayers(boardsData[currentBoardIndex].players);
        // drawLines(boardsData[currentBoardIndex].lines);
    }

    // --- Event Listeners ---
    addBoardBtn.addEventListener('click', addBoard); // Button below canvas
    deleteBoardBtn.addEventListener('click', deleteCurrentBoard); // Listener for delete

    prevBoardBtn.addEventListener('click', () => {
        if (currentBoardIndex > 0) {
            switchToBoard(currentBoardIndex - 1);
        }
    });

    nextBoardBtn.addEventListener('click', () => {
        if (currentBoardIndex < boardsData.length - 1) {
            switchToBoard(currentBoardIndex + 1);
        }
    });

    clearBtn.addEventListener('click', () => {
        if (confirm('Clear all drawings on the current board?')) {
             // Reset the state for the current board
             boardsData[currentBoardIndex] = createNewBoardState();
             clearCanvas(); // Clear visually
             // You might want to save this cleared state immediately
             saveCurrentBoardState();
        }
    });

    // Add listeners for canvas drawing (mousedown, mousemove, mouseup)
    // These listeners should modify the state in boardsData[currentBoardIndex]

    // Add listeners for color pickers, play button etc.

    // --- Initial Setup ---
    resizeCanvas(); // Size canvas initially
    window.addEventListener('resize', resizeCanvas); // Adjust canvas on window resize
    updateUI(); // Set initial UI state (indicator, buttons, navbar list)
    loadBoardState(currentBoardIndex); // Load the initial board state

}); // End DOMContentLoaded
