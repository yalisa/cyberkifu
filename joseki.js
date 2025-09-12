// Joseki display functionality
const JOSEKI_BOARD_SIZE = 7; // Smaller board for joseki display
const JOSEKI_CELL_SIZE = 40;
const JOSEKI_STONE_RADIUS = JOSEKI_CELL_SIZE * 0.4;

function createJosekiCanvas(joseki) {
    const canvas = document.createElement('canvas');
    canvas.width = JOSEKI_BOARD_SIZE * JOSEKI_CELL_SIZE + JOSEKI_CELL_SIZE;
    canvas.height = JOSEKI_BOARD_SIZE * JOSEKI_CELL_SIZE + JOSEKI_CELL_SIZE;
    canvas.className = 'joseki-canvas';
    
    const ctx = canvas.getContext('2d');
    
    // Draw grid
    ctx.strokeStyle = document.body.classList.contains('night-mode') ? '#eee' : '#333';
    for (let i = 1; i <= JOSEKI_BOARD_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(JOSEKI_CELL_SIZE, i * JOSEKI_CELL_SIZE);
        ctx.lineTo(JOSEKI_BOARD_SIZE * JOSEKI_CELL_SIZE, i * JOSEKI_CELL_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(i * JOSEKI_CELL_SIZE, JOSEKI_CELL_SIZE);
        ctx.lineTo(i * JOSEKI_CELL_SIZE, JOSEKI_BOARD_SIZE * JOSEKI_CELL_SIZE);
        ctx.stroke();
    }
    
    // Draw hoshi points
    const hoshiPoints = [[2, 2], [2, 4], [4, 2], [4, 4]];
    ctx.fillStyle = document.body.classList.contains('night-mode') ? '#eee' : '#222';
    hoshiPoints.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x * JOSEKI_CELL_SIZE, y * JOSEKI_CELL_SIZE, JOSEKI_CELL_SIZE * 0.1, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Draw stones
    joseki.moves.forEach((move, index) => {
        const x = (move.x + 1) * JOSEKI_CELL_SIZE;
        const y = (move.y + 1) * JOSEKI_CELL_SIZE;
        
        // Draw stone
        ctx.beginPath();
        ctx.arc(x, y, JOSEKI_STONE_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = move.color;
        ctx.shadowColor = '#333';
        ctx.shadowBlur = 3;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Draw move number
        ctx.fillStyle = move.color === 'black' ? 'white' : 'black';
        ctx.font = `${JOSEKI_CELL_SIZE * 0.3}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((index + 1).toString(), x, y);
    });
    
    return canvas;
}

function displayJoseki() {
    const grid = document.getElementById('joseki-grid');
    grid.innerHTML = '';
    
    josekiDatabase.forEach(joseki => {
        const item = document.createElement('div');
        item.className = 'joseki-item';
        
        const title = document.createElement('div');
        title.className = 'joseki-title';
        title.textContent = currentLanguage === 'be' ? joseki.name_be : joseki.name;
        
        const description = document.createElement('div');
        description.className = 'joseki-description';
        description.textContent = currentLanguage === 'be' ? joseki.description_be : joseki.description;
        
        const canvas = createJosekiCanvas(joseki);
        
        item.appendChild(title);
        item.appendChild(description);
        item.appendChild(canvas);
        
        grid.appendChild(item);
    });
}

// Language and night mode functionality
let currentLanguage = 'en'; // 'en' or 'be'

function updateLanguage() {
    // Update all elements with data attributes
    document.querySelectorAll('[data-en][data-be]').forEach(element => {
        element.textContent = element.getAttribute(`data-${currentLanguage}`);
    });
    
    // Update night mode button text
    const nightModeToggle = document.getElementById('night-mode-toggle');
    if (currentLanguage === 'be') {
        nightModeToggle.textContent = document.body.classList.contains('night-mode') ? 'Дзённы рэжым' : 'Начны рэжым';
    } else {
        nightModeToggle.textContent = document.body.classList.contains('night-mode') ? 'Day Mode' : 'Night Mode';
    }
    
    // Update language toggle button
    const languageToggle = document.getElementById('language-toggle');
    languageToggle.textContent = currentLanguage === 'en' ? 'Беларуская мова' : 'English';
    
    // Update joseki display
    displayJoseki();
}

function toggleNightMode() {
    document.body.classList.toggle('night-mode');
    updateLanguage();
    
    // Update all joseki canvases
    displayJoseki();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Start in night mode by default
    document.body.classList.add('night-mode');
    
    const nightModeToggle = document.getElementById('night-mode-toggle');
    const languageToggle = document.getElementById('language-toggle');
    
    // Add event listeners
    nightModeToggle.addEventListener('click', toggleNightMode);
    languageToggle.addEventListener('click', () => {
        currentLanguage = currentLanguage === 'en' ? 'be' : 'en';
        updateLanguage();
    });
    
    // Initialize display first, then language
    displayJoseki();
    updateLanguage();
});
