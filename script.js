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
let difficulty = 'easy';
let gameLoopId = null;
let hasWon = false;

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
const statusMessage = document.getElementById('status-message');
const shopItems = document.querySelectorAll('.building');
const infoBtn = document.querySelector('.info-btn');
const closeBtn = document.querySelector('.close-btn');
const resetBtn = document.getElementById('reset-btn');
const victoryModal = document.getElementById('victory-modal');
const victoryCloseBtn = document.getElementById('victory-close-btn');
const victorySound = new Audio('sound/706753__xkeril__victory-short-sting.wav');
const placementSound = new Audio('sound/59988__qubodup__swosh-01-44.flac');

const buildings = [
    { name: 'Water', cost: 15, water: 10, health: 0, emoji: '💧' },
    { name: 'Medic', cost: 25, water: 0, health: 20, emoji: '❤️' },
    { name: 'Well', cost: 50, water: 20, health: 10, emoji: '🚰' },
    { name: 'Filter', cost: 75, water: 30, health: 20, emoji: '🪣' }
];

const difficultySettings = {
    easy: { interval: 3000, waterDecrease: 1, label: 'Easy' },
    hard: { interval: 1800, waterDecrease: 2, label: 'Hard' }
};

const normalizeDifficulty = value => {
    const normalizedValue = value && value.toLowerCase();
    return difficultySettings[normalizedValue] ? normalizedValue : 'easy';
};

const setStatusMessage = message => {
    if (statusMessage) {
        statusMessage.textContent = message;
    }
};

const playPlacementSound = () => {
    placementSound.currentTime = 0;
    placementSound.play().catch(() => {});
};

const playVictorySound = () => {
    victorySound.currentTime = 0;
    victorySound.play().catch(() => {});
};

const showVictoryModal = () => {
    if (hasWon) return;

    hasWon = true;
    if (victoryModal) {
        victoryModal.classList.add('open');
    }
    playVictorySound();
};

const closeVictoryModal = () => {
    if (victoryModal) {
        victoryModal.classList.remove('open');
    }
};

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

    if (health >= maxHealth && !hasWon) {
        showVictoryModal();
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
        setStatusMessage('Select a village tile first.');
        alert('Select a village tile first.');
        return;
    }

    if (!selectedBuilding || money < selectedBuilding.cost) {
        setStatusMessage('Not enough money for that building.');
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

    playPlacementSound();
    setStatusMessage(`${selectedBuilding.name} placed on the village.`);
    resetShop();
    updateUI();
};

const handleTileClick = tile => {
    if (tile.dataset.occupied === 'true') {
        setStatusMessage('That tile is already occupied.');
        return;
    }

    selectedTile = tile;
    tiles.forEach(t => t.style.outline = 'none');
    tile.style.outline = '4px solid #FFC907';
    setShopSide(tile);
    shop.classList.add('open');
    setStatusMessage('Choose a building from the shop.');
};

const startGameLoop = () => {
    if (gameLoopId) {
        clearInterval(gameLoopId);
    }

    const settings = difficultySettings[difficulty];

    gameLoopId = setInterval(() => {
        water = Math.max(0, water - settings.waterDecrease);
        if (water < 30) {
            health = Math.max(0, health - 1);
        }

        const healthBonus = Math.max(0, health - 20);
        const passiveIncome = 1 + Math.floor(healthBonus / 10);
        money += passiveIncome;

        updateUI();
        checkGameOver();
    }, settings.interval);
};

const resetGame = (selectedDifficulty = difficulty) => {
    difficulty = normalizeDifficulty(selectedDifficulty);
    health = 10;
    water = 20;
    money = 150;
    selectedTile = null;
    selectedBuilding = null;
    hasWon = false;
    closeVictoryModal();

    tiles.forEach(tile => {
        tile.textContent = '';
        tile.dataset.occupied = 'false';
        tile.style.outline = 'none';
    });

    shop.classList.remove('open');
    setStatusMessage(`The village has been reset on ${difficultySettings[difficulty].label} difficulty.`);
    updateUI();
    startGameLoop();
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
        setStatusMessage(`${buildings[index].name} selected.`);
        placeBuilding();
    });
});

resetBtn.addEventListener('click', () => {
    const chosenDifficulty = window.prompt('Choose a difficulty: easy or hard', difficulty);
    resetGame(chosenDifficulty);
});

victoryCloseBtn.addEventListener('click', () => {
    closeVictoryModal();
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

updateUI();
startGameLoop();