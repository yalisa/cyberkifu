let BOARD_SIZE = 9;
let CELL_SIZE = 600 / (BOARD_SIZE + 1);
let STONE_RADIUS = CELL_SIZE * 0.4;

const canvas = document.getElementById('go-board');
const ctx = canvas.getContext('2d');
const boardSizeSelect = document.getElementById('board-size');
const startButton = document.getElementById('start-game');
const nightModeToggle = document.getElementById('night-mode-toggle');
const moveTreeDiv = document.getElementById('move-tree');
const deleteLastMoveBtn = document.getElementById('delete-last-move');
const clearAllMovesBtn = document.getElementById('clear-all-moves');
const scoreGameBtn = document.getElementById('score-game');
const scoreResultDiv = document.getElementById('score-result');
const exportSgfBtn = document.getElementById('export-sgf');
const currentPlayerSpan = document.getElementById('current-player');
const languageToggle = document.getElementById('language-toggle');
const josekiBtn = document.getElementById('joseki-btn');
let moveHistory = [];
let board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
let currentPlayer = 'black';
let lastMove = null;
let boardHistory = new Set();
let koPoint = null;
const undoBtn = document.getElementById('undo-move');
const redoBtn = document.getElementById('redo-move');
const firstMoveBtn = document.getElementById('first-move');
const prevMoveBtn = document.getElementById('prev-move');
const nextMoveBtn = document.getElementById('next-move');
const lastMoveBtn = document.getElementById('last-move');
let redoStack = [];
let currentMoveIndex = -1; // -1 means at the beginning, moveHistory.length means at the end
let currentLanguage = 'en'; // 'en' or 'be'

function coordsToLabel(x, y) {
    // Go columns: A, B, C, ... (skip I)
    const letters = 'ABCDEFGHJKLMNOPQRST';
    return letters[x] + (y + 1);
}

function renderMoveTree() {
    if (moveHistory.length === 0) {
        const noMovesText = currentLanguage === 'be' ? 'Яшчэ няма хадоў.' : 'No moves yet.';
        moveTreeDiv.textContent = noMovesText;
        return;
    }
    let html = '<ul style="padding-left: 1em;">';
    moveHistory.forEach((move, i) => {
        const player = move.player.charAt(0).toUpperCase() + move.player.slice(1);
        const isCurrentMove = i === currentMoveIndex;
        const highlightClass = isCurrentMove ? 'style="background-color: #ffeb3b; padding: 2px 4px; border-radius: 3px;"' : '';
        html += `<li><span class="move-item" data-move-index="${i}" ${highlightClass}>${i + 1}. ${player}: ${coordsToLabel(move.x, move.y)}</span></li>`;
    });
    html += '</ul>';
    moveTreeDiv.innerHTML = html;
    
    // Add click event listeners to move items
    moveTreeDiv.querySelectorAll('.move-item').forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', (e) => {
            const moveIndex = parseInt(e.target.getAttribute('data-move-index'));
            jumpToMove(moveIndex);
        });
    });
}

function jumpToMove(moveIndex) {
    if (moveIndex < -1 || moveIndex >= moveHistory.length) return;
    
    currentMoveIndex = moveIndex;
    rebuildBoardFromHistory();
    drawBoard();
    renderMoveTree();
    updateCurrentPlayerDisplay();
    updateNavigationButtons();
}

function boardToHash(board) {
    // Simple string representation for hashing
    return board.map(row => row.map(cell => cell ? cell[0] : '.').join('')).join('|');
}

function isKo(board) {
    return boardHistory.has(boardToHash(board));
}

function saveBoardState(board) {
    boardHistory.add(boardToHash(board));
}

function cloneBoard(board) {
    return board.map(row => row.slice());
}

function resetBoardHistory() {
    boardHistory = new Set();
    saveBoardState(board);
}

function updateCurrentPlayerDisplay() {
    const stone = `<span class="stone ${currentPlayer}"></span>`;
    let playerName;
    if (currentLanguage === 'be') {
        playerName = currentPlayer === 'black' ? 'Чорныя ходзяць' : 'Белыя ходзяць';
    } else {
        playerName = currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1);
        const toPlayText = 'to play';
        currentPlayerSpan.innerHTML = `${stone} ${playerName} ${toPlayText}`;
        return;
    }
    currentPlayerSpan.innerHTML = `${stone} ${playerName}`;
}

function initBoard(size) {
    BOARD_SIZE = size;
    CELL_SIZE = 600 / (BOARD_SIZE + 1);
    STONE_RADIUS = CELL_SIZE * 0.4;
    board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    currentPlayer = 'black';
    moveHistory = [];
    lastMove = null;
    koPoint = null;
    currentMoveIndex = -1;
    redoStack = [];
    drawBoard();
    renderMoveTree();
    updateCurrentPlayerDisplay();
    updateNavigationButtons();
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Set grid line color based on night mode
    ctx.strokeStyle = document.body.classList.contains('night-mode') ? '#eee' : '#333';
    // Draw grid
    for (let i = 1; i <= BOARD_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(CELL_SIZE, i * CELL_SIZE);
        ctx.lineTo(BOARD_SIZE * CELL_SIZE, i * CELL_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, CELL_SIZE);
        ctx.lineTo(i * CELL_SIZE, BOARD_SIZE * CELL_SIZE);
        ctx.stroke();
    }
    // Draw hoshi (star) points
    let hoshiPoints = [];
    if (BOARD_SIZE === 9) {
        hoshiPoints = [
            [3, 3], [3, 7], [7, 3], [7, 7], [5, 5]
        ];
    } else if (BOARD_SIZE === 13) {
        hoshiPoints = [
            [4, 4], [4, 10], [10, 4], [10, 10], [7, 7]
        ];
    } else if (BOARD_SIZE === 19) {
        hoshiPoints = [
            [4, 4], [4, 10], [4, 16],
            [10, 4], [10, 10], [10, 16],
            [16, 4], [16, 10], [16, 16]
        ];
    }
    if (hoshiPoints.length) {
        ctx.fillStyle = document.body.classList.contains('night-mode') ? '#eee' : '#222';
        hoshiPoints.forEach(([i, j]) => {
            ctx.beginPath();
            ctx.arc(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE * 0.13, 0, 2 * Math.PI);
            ctx.fill();
        });
    }
    // Draw stones
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (board[y][x]) {
                drawStone(x, y, board[y][x]);
            }
        }
    }
    // Draw last move highlight
    if (lastMove) {
        const x = lastMove.x;
        const y = lastMove.y;
        const centerX = (x + 1) * CELL_SIZE;
        const centerY = (y + 1) * CELL_SIZE;
        const radius = CELL_SIZE * 0.15;
        
        // Draw red dot
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Reset fill style for other drawing
        ctx.fillStyle = document.body.classList.contains('night-mode') ? '#eee' : '#222';
    }
}

function drawStone(x, y, color) {
    ctx.beginPath();
    ctx.arc((x + 1) * CELL_SIZE, (y + 1) * CELL_SIZE, STONE_RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.shadowColor = '#333';
    ctx.shadowBlur = 5;
    ctx.fill();
    ctx.shadowBlur = 0;
}

// Helper to get neighbors
function getNeighbors(x, y) {
    return [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
    ].filter(([nx, ny]) => nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE);
}

// Find all stones in the same group as (x, y)
function getGroup(x, y, color, visited = new Set()) {
    const key = (x, y) => `${x},${y}`;
    let group = [];
    let stack = [[x, y]];
    visited.add(key(x, y));
    while (stack.length) {
        const [cx, cy] = stack.pop();
        group.push([cx, cy]);
        for (const [nx, ny] of getNeighbors(cx, cy)) {
            if (!visited.has(key(nx, ny)) && board[ny][nx] === color) {
                visited.add(key(nx, ny));
                stack.push([nx, ny]);
            }
        }
    }
    return group;
}

// Check if a group has any liberties
function hasLiberty(group) {
    for (const [x, y] of group) {
        for (const [nx, ny] of getNeighbors(x, y)) {
            if (!board[ny][nx]) return true;
        }
    }
    return false;
}

// Remove stones in a group
function removeGroup(group) {
    for (const [x, y] of group) {
        board[y][x] = null;
    }
}

function scoreTerritory() {
    let visited = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(false));
    let blackTerritory = 0;
    let whiteTerritory = 0;
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (!board[y][x] && !visited[y][x]) {
                // Flood fill from this empty point
                let queue = [[x, y]];
                let territory = [[x, y]];
                visited[y][x] = true;
                let borderColors = new Set();
                while (queue.length) {
                    const [cx, cy] = queue.pop();
                    for (const [nx, ny] of getNeighbors(cx, cy)) {
                        if (board[ny][nx]) {
                            borderColors.add(board[ny][nx]);
                        } else if (!visited[ny][nx]) {
                            visited[ny][nx] = true;
                            queue.push([nx, ny]);
                            territory.push([nx, ny]);
                        }
                    }
                }
                if (borderColors.size === 1) {
                    if (borderColors.has('black')) {
                        blackTerritory += territory.length;
                    } else if (borderColors.has('white')) {
                        whiteTerritory += territory.length;
                    }
                }
                // If borderColors.size !== 1, it's dame (neutral), do not count
            }
        }
    }
    return { black: blackTerritory, white: whiteTerritory };
}

function rebuildBoardFromHistory() {
    board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    currentPlayer = 'black';
    koPoint = null;
    lastMove = null;
    
    // Replay moves up to currentMoveIndex
    for (let i = 0; i <= currentMoveIndex && i < moveHistory.length; i++) {
        const move = moveHistory[i];
        board[move.y][move.x] = move.player;
        // Remove captured stones
        const opponent = move.player === 'black' ? 'white' : 'black';
        let capturedGroups = [];
        for (const [nx, ny] of getNeighbors(move.x, move.y)) {
            if (board[ny][nx] === opponent) {
                const group = getGroup(nx, ny, opponent);
                if (!hasLiberty(group)) {
                    capturedGroups.push(group);
                }
            }
        }
        let totalCaptured = 0;
        for (const group of capturedGroups) {
            removeGroup(group);
            totalCaptured += group.length;
        }
        if (totalCaptured === 1 && capturedGroups.length === 1 && capturedGroups[0].length === 1) {
            koPoint = capturedGroups[0][0];
        } else {
            koPoint = null;
        }
        currentPlayer = move.player === 'black' ? 'white' : 'black';
    }
    
    // Set last move to the current position
    if (currentMoveIndex >= 0 && currentMoveIndex < moveHistory.length) {
        const currentMove = moveHistory[currentMoveIndex];
        lastMove = { x: currentMove.x, y: currentMove.y };
    } else {
        lastMove = null;
    }
}

function updateNavigationButtons() {
    firstMoveBtn.disabled = currentMoveIndex <= -1;
    prevMoveBtn.disabled = currentMoveIndex <= -1;
    nextMoveBtn.disabled = currentMoveIndex >= moveHistory.length - 1;
    lastMoveBtn.disabled = currentMoveIndex >= moveHistory.length - 1;
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / CELL_SIZE - 1);
    const y = Math.round((e.clientY - rect.top) / CELL_SIZE - 1);
    if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && !board[y][x]) {
        redoStack = [];
        // Basic ko rule: forbid immediate recapture at koPoint
        if (koPoint && koPoint[0] === x && koPoint[1] === y) {
            alert('Ko rule: Immediate recapture is not allowed!');
            return;
        }
        board[y][x] = currentPlayer;
        const opponent = currentPlayer === 'black' ? 'white' : 'black';
        let capturedGroups = [];
        for (const [nx, ny] of getNeighbors(x, y)) {
            if (board[ny][nx] === opponent) {
                const group = getGroup(nx, ny, opponent);
                if (!hasLiberty(group)) {
                    capturedGroups.push(group);
                }
            }
        }
        // Remove captured stones
        let totalCaptured = 0;
        for (const group of capturedGroups) {
            removeGroup(group);
            totalCaptured += group.length;
        }
        // Check for suicide (remove own group if no liberties and no capture)
        const myGroup = getGroup(x, y, currentPlayer);
        if (!hasLiberty(myGroup) && totalCaptured === 0) {
            // Undo move (illegal)
            board[y][x] = null;
            return;
        }
        // Set ko point if exactly one stone was captured and the group size is 1
        if (totalCaptured === 1 && capturedGroups.length === 1 && capturedGroups[0].length === 1) {
            koPoint = capturedGroups[0][0];
        } else {
            koPoint = null;
        }
        moveHistory.push({ player: currentPlayer, x, y });
        currentMoveIndex = moveHistory.length - 1;
        lastMove = { x, y };
        currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
        drawBoard();
        renderMoveTree();
        updateCurrentPlayerDisplay();
        updateNavigationButtons();
    }
});

deleteLastMoveBtn.addEventListener('click', () => {
    if (moveHistory.length === 0) return;
    // Remove last move
    const lastMove = moveHistory.pop();
    currentMoveIndex = moveHistory.length - 1;
    rebuildBoardFromHistory();
    drawBoard();
    renderMoveTree();
    updateCurrentPlayerDisplay();
    updateNavigationButtons();
});

clearAllMovesBtn.addEventListener('click', () => {
    moveHistory = [];
    board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    currentPlayer = 'black';
    lastMove = null;
    koPoint = null;
    currentMoveIndex = -1;
    redoStack = [];
    drawBoard();
    renderMoveTree();
    updateCurrentPlayerDisplay();
    updateNavigationButtons();
});

undoBtn.addEventListener('click', () => {
    if (moveHistory.length === 0) return;
    const lastMove = moveHistory.pop();
    redoStack.push(lastMove);
    currentMoveIndex = moveHistory.length - 1;
    rebuildBoardFromHistory();
    drawBoard();
    renderMoveTree();
    updateCurrentPlayerDisplay();
    updateNavigationButtons();
});

redoBtn.addEventListener('click', () => {
    if (redoStack.length === 0) return;
    const move = redoStack.pop();
    moveHistory.push(move);
    currentMoveIndex = moveHistory.length - 1;
    rebuildBoardFromHistory();
    drawBoard();
    renderMoveTree();
    updateCurrentPlayerDisplay();
    updateNavigationButtons();
});

// Navigation buttons
firstMoveBtn.addEventListener('click', () => {
    currentMoveIndex = -1;
    rebuildBoardFromHistory();
    drawBoard();
    renderMoveTree();
    updateCurrentPlayerDisplay();
    updateNavigationButtons();
});

prevMoveBtn.addEventListener('click', () => {
    if (currentMoveIndex > -1) {
        currentMoveIndex--;
        rebuildBoardFromHistory();
        drawBoard();
        renderMoveTree();
        updateCurrentPlayerDisplay();
        updateNavigationButtons();
    }
});

nextMoveBtn.addEventListener('click', () => {
    if (currentMoveIndex < moveHistory.length - 1) {
        currentMoveIndex++;
        rebuildBoardFromHistory();
        drawBoard();
        renderMoveTree();
        updateCurrentPlayerDisplay();
        updateNavigationButtons();
    }
});

lastMoveBtn.addEventListener('click', () => {
    currentMoveIndex = moveHistory.length - 1;
    rebuildBoardFromHistory();
    drawBoard();
    renderMoveTree();
    updateCurrentPlayerDisplay();
    updateNavigationButtons();
});

boardSizeSelect.addEventListener('change', () => {
    const size = parseInt(boardSizeSelect.value, 10);
    initBoard(size);
    redoStack = [];
});

nightModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('night-mode');
    nightModeToggle.textContent = document.body.classList.contains('night-mode') ? 'Day Mode' : 'Night Mode';
    drawBoard();
});

scoreGameBtn.addEventListener('click', () => {
    const score = scoreTerritory();
    let result;
    if (currentLanguage === 'be') {
        result = `Чорная тэрыторыя: ${score.black} | Белая тэрыторыя: ${score.white}`;
        if (score.black > score.white) {
            result += ' — Чорныя перамагаюць!';
        } else if (score.white > score.black) {
            result += ' — Белыя перамагаюць!';
        } else {
            result += ' — Нічыя!';
        }
    } else {
        result = `Black territory: ${score.black} | White territory: ${score.white}`;
        if (score.black > score.white) {
            result += ' — Black wins!';
        } else if (score.white > score.black) {
            result += ' — White wins!';
        } else {
            result += ' — Draw!';
        }
    }
    scoreResultDiv.textContent = result;
});

function coordsToSgf(x, y) {
    // Convert 0-based coordinates to SGF format (a-z for x, a-z for y)
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    return letters[x] + letters[y];
}

function generateSGF() {
    let sgf = '(;FF[4]CA[UTF-8]AP[Cyberkifu:1.0]SZ[' + BOARD_SIZE + ']';
    
    // Add game info
    sgf += 'GN[Cyberkifu Game]';
    sgf += 'DT[' + new Date().toISOString().split('T')[0] + ']';
    sgf += 'PB[Black]PW[White]';
    
    // Add moves
    for (const move of moveHistory) {
        const sgfCoord = coordsToSgf(move.x, move.y);
        const color = move.player === 'black' ? 'B' : 'W';
        sgf += ';' + color + '[' + sgfCoord + ']';
    }
    
    sgf += ')';
    return sgf;
}

function downloadSGF(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

exportSgfBtn.addEventListener('click', () => {
    if (moveHistory.length === 0) {
        const alertText = currentLanguage === 'be' ? 'Няма хадоў для экспарту!' : 'No moves to export!';
        alert(alertText);
        return;
    }
    
    const sgfContent = generateSGF();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `go-game-${BOARD_SIZE}x${BOARD_SIZE}-${timestamp}.sgf`;
    
    downloadSGF(sgfContent, filename);
});

function updateLanguage() {
    // Update all elements with data attributes
    document.querySelectorAll('[data-en][data-be]').forEach(element => {
        element.textContent = element.getAttribute(`data-${currentLanguage}`);
    });
    
    // Update night mode button text
    if (currentLanguage === 'be') {
        nightModeToggle.textContent = document.body.classList.contains('night-mode') ? 'Дзённы рэжым' : 'Начны рэжым';
    } else {
        nightModeToggle.textContent = document.body.classList.contains('night-mode') ? 'Day Mode' : 'Night Mode';
    }
    
    // Update language toggle button
    languageToggle.textContent = currentLanguage === 'en' ? 'Беларуская мова' : 'English';
    
    // Update current player display
    updateCurrentPlayerDisplay();
    
    // Update move tree
    renderMoveTree();
}

languageToggle.addEventListener('click', () => {
    currentLanguage = currentLanguage === 'en' ? 'be' : 'en';
    updateLanguage();
});

josekiBtn.addEventListener('click', () => {
    window.location.href = 'joseki.html';
});

// Start in night mode by default
window.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('night-mode');
    updateLanguage();
    drawBoard();
});

// Initialize with default size
initBoard(BOARD_SIZE);
