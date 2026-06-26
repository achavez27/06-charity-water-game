// ==============================
// GAME VARIABLES
// ==============================

let health = 10;
const maxHealth = 50;

let water = 20;
const maxWater = 100;

let money = 150;
let selectedTile = null;
let selectedBuilding = null;

// ==============================
// HTML ELEMENTS
// ==============================

const tiles = document.querySelectorAll('.tile');
const shop = document.getElementById('shop');
const info = document.getElementById('info');
const moneyDisplay = document.getElementById('money');
const healthBar = document.getElementById('health-bar');
const waterBar = document.getElementById('water-bar');
const healthText = document.getElementById('health-text');
const waterText = document.getElementById('water-text');
const shopItems = document.querySelectorAll('.building');
const infoBtn = document.querySelector('.info-btn');
const closeBtn = document.querySelector('.close-btn');

const buildings = [
    { name: 'Water', cost: 15, water: 10, health: 0, emoji: '💧' },
    { name: 'Medic', cost: 25, water: 0, health: 20, emoji: '❤️' },
    { name: 'Well', cost: 50, water: 20, health: 10, emoji: '🚰' },
    { name: 'Filter', cost: 75, water: 30, health: 20, emoji: '🪣' }
];

const updateUI = () => {
    moneyDisplay.textContent = money;
    healthText.textContent = `${health} / ${maxHealth}`;
    waterText.textContent = `${water} / ${maxWater}`;
    healthBar.style.width = `${(health / maxHealth) * 100}%`;
    waterBar.style.width = `${(water / maxWater) * 100}%`;

    if (health > 35) {
        healthBar.style.background = '#4FCB53';
    } else if (health > 15) {
        healthBar.style.background = '#FF902A';
    } else {
        healthBar.style.background = '#F5402C';
    }
};

const resetShop = () => {
    shop.classList.remove('open');
    selectedTile = null;
    tiles.forEach(tile => tile.style.outline = 'none');
};

const setShopSide = tile => {
    shop.classList.remove('left', 'right');
    const tileIndex = Array.from(tiles).indexOf(tile);
    const column = tileIndex % 4;
    const sideClass = column > 1 ? 'left' : 'right';
    shop.classList.add(sideClass);
};

const placeBuilding = () => {
    if (!selectedTile) {
        alert('Select a village tile first.');
        return;
    }

    if (!selectedBuilding || money < selectedBuilding.cost) {
        alert('Not enough money!');
        return;
    }

    money -= selectedBuilding.cost;
    health = Math.min(maxHealth, health + selectedBuilding.health);
    water = Math.min(maxWater, water + selectedBuilding.water);

    selectedTile.textContent = selectedBuilding.emoji;
    selectedTile.dataset.occupied = 'true';

    Object.assign(selectedTile.style, {
        fontSize: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        outline: 'none'
    });

    selectedTile.classList.add('pulse');
    setTimeout(() => selectedTile.classList.remove('pulse'), 400);

    resetShop();
    updateUI();
};

const handleTileClick = tile => {
    if (tile.dataset.occupied === 'true') return;
    selectedTile = tile;
    tiles.forEach(t => t.style.outline = 'none');
    tile.style.outline = '4px solid #FFC907';
    setShopSide(tile);
    shop.classList.add('open');
};

const resetGame = () => {
    health = 10;
    water = 20;
    money = 150;

    tiles.forEach(tile => {
        tile.textContent = '';
        tile.dataset.occupied = 'false';
        tile.style.outline = 'none';
    });

    updateUI();
};

const checkGameOver = () => {
    if (health <= 0) {
        alert("Game Over! Your village's health reached zero.");
        resetGame();
    }
};

shopItems.forEach((button, index) => {
    button.textContent = buildings[index].emoji;
    button.addEventListener('click', () => {
        selectedBuilding = buildings[index];
        placeBuilding();
    });
});

// Info button handler
infoBtn.addEventListener('click', () => {
    info.classList.add('open');
});

// Close info button handler
closeBtn.addEventListener('click', () => {
    info.classList.remove('open');
});

// Close info when clicking outside of it
info.addEventListener('click', (event) => {
    if (event.target === info) {
        info.classList.remove('open');
    }
});

tiles.forEach(tile => {
    tile.dataset.occupied = 'false';
    tile.addEventListener('click', () => handleTileClick(tile));
});

document.addEventListener('click', event => {
    const target = event.target;
    const clickedTile = target.closest('.tile');
    const clickedShop = target.closest('#shop');

    if (!clickedTile && !clickedShop && shop.classList.contains('open')) {
        resetShop();
    }
});

setInterval(() => {
    water -= 1;
    if (water < 30) {
        health -= 1;
    }
    water = Math.max(0, water);
    health = Math.max(0, health);
    updateUI();
    checkGameOver();
}, 3000);

updateUI();