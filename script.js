// Initialize Firebase (Using your Firebase project's configuration)
var firebaseConfig = {
  apiKey: "AIzaSyApXW3PWhqhQ0mXeIG1oo5mdawQD29Xxjs", // Replace with your actual API key
  authDomain: "wordle-upgrade-c055f.firebaseapp.com",
  databaseURL: "https://wordle-upgrade-c055f-default-rtdb.firebaseio.com",
  projectId: "wordle-upgrade-c055f",
  appId: "1:683362789332:web:e3aeb537a5f96773e85841",
  // Add other Firebase config parameters as needed
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var database = firebase.database();
var auth = firebase.auth();

// Initialize i18next for Localization
i18next.init({
  lng: 'en', // default language
  debug: true,
  resources: {
    en: {
      translation: {
        "title": "Wordle Upgrade",
        "daily_mode": "Word of the Day",
        "random_mode": "Random Word",
        "six_letter_mode": "6-Letter Word",
        "view_leaderboard": "View Leaderboard",
        "feedback": "Feedback",
        "get_suggestions": "Get Suggestions",
        "statistics": "Your Statistics",
        "enter_name": "Enter Your Name",
        "save": "Save",
        "leaderboard": "Leaderboard",
        "daily_word": "Daily Word",
        "random_word": "Random Word",
        "six_letter_word": "6-Letter Word",
        "global": "Global",
        "daily_word_leaderboard": "Daily Word Leaderboard",
        "random_word_leaderboard": "Random Word Leaderboard",
        "six_letter_word_leaderboard": "6-Letter Word Leaderboard",
        "global_leaderboard": "Global Leaderboard",
        "congratulations": "Congratulations!",
        "share": "Share on Twitter",
        "close": "Close",
        "login_signup": "Login / Sign Up",
        "email_signin": "Email Sign-In",
        "signin": "Sign In",
        "signup": "Sign Up",
        "achievements": "Achievements",
        "profile": "Your Profile"
        // Add more translations as needed
      }
    },
    es: {
      translation: {
        "title": "Wordle Mejorado",
        "daily_mode": "Palabra del Día",
        "random_mode": "Palabra Aleatoria",
        "six_letter_mode": "Palabra de 6 Letras",
        "view_leaderboard": "Ver Tabla de Líderes",
        "feedback": "Comentarios",
        "get_suggestions": "Obtener Sugerencias",
        "statistics": "Tus Estadísticas",
        "enter_name": "Ingresa Tu Nombre",
        "save": "Guardar",
        "leaderboard": "Tabla de Líderes",
        "daily_word": "Palabra Diaria",
        "random_word": "Palabra Aleatoria",
        "six_letter_word": "Palabra de 6 Letras",
        "global": "Global",
        "daily_word_leaderboard": "Tabla de Líderes de la Palabra Diaria",
        "random_word_leaderboard": "Tabla de Líderes de Palabra Aleatoria",
        "six_letter_word_leaderboard": "Tabla de Líderes de Palabra de 6 Letras",
        "global_leaderboard": "Tabla de Líderes Global",
        "congratulations": "¡Felicidades!",
        "share": "Compartir en Twitter",
        "close": "Cerrar",
        "login_signup": "Iniciar Sesión / Registrarse",
        "email_signin": "Inicio de Sesión por Correo",
        "signin": "Iniciar Sesión",
        "signup": "Registrarse",
        "achievements": "Logros",
        "profile": "Tu Perfil"
        // Add more translations as needed
      }
    }
    // Add more languages as needed
  }
}, function(err, t) {
  updateContent();
});

// Update content based on selected language
function updateContent() {
  document.querySelectorAll('[data-i18n]').forEach(function(element) {
    var key = element.getAttribute('data-i18n');
    element.innerHTML = i18next.t(key);
  });
}

// Language Selection
const languageSelect = document.getElementById('language-select');
languageSelect.addEventListener('change', (event) => {
  const selectedLang = event.target.value;
  i18next.changeLanguage(selectedLang, () => {
    updateContent();
  });
});

// Theme Toggle
const themeToggleBtn = document.getElementById('theme-toggle');
themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  document.body.classList.toggle('high-contrast-theme');
  // Save user preference in localStorage
  const currentTheme = document.body.classList.contains('light-theme') ? 'light' :
                       document.body.classList.contains('high-contrast-theme') ? 'high-contrast' : 'dark';
  localStorage.setItem('theme', currentTheme);
});

// Load saved theme on page load
window.addEventListener('load', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  } else if (savedTheme === 'high-contrast') {
    document.body.classList.add('high-contrast-theme');
  }
});

// Variables to store game state
let targetWord = '';
let currentGuess = '';
let guesses = [];
let maxGuesses = 6;
let wordLength = 5;
let gameActive = false;
let startTime;
let playerName = '';
let validWordsSet = new Set();
let currentMode = 'daily'; // Track current game mode

// User ID for Firebase (after authentication)
let userId = null;

// Load word lists for different languages
const wordLists = {
  en: 'words_en.txt',
  es: 'words_es.txt'
  // Add more languages and their word lists
};

// Load word list based on current language and mode
async function loadWordList() {
  try {
    const language = i18next.language || 'en';
    const response = await fetch(wordLists[language]);
    const text = await response.text();
    const wordsArray = text.split('\n').map(word => word.trim().toLowerCase());
    validWordsSet = new Set(wordsArray);
    console.log('Word list loaded for language:', language);
  } catch (error) {
    console.error('Error loading word list:', error);
  }
}

// Start the game based on mode
async function startGame(mode) {
  await loadWordList();
  gameActive = true;
  currentGuess = '';
  guesses = [];
  startTime = new Date();
  currentMode = mode;

  getPlayerName();

  // Set word length and target word based on mode
  if (mode === 'daily') {
    wordLength = 5;
    const wordArray = Array.from(validWordsSet).filter(word => word.length === wordLength);

    // Use date as seed to select word
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const index = seed % wordArray.length;
    targetWord = wordArray[index];
  } else if (mode === 'random') {
    wordLength = 5;
    const wordArray = Array.from(validWordsSet).filter(word => word.length === wordLength);
    targetWord = wordArray[Math.floor(Math.random() * wordArray.length)];
  } else if (mode === 'six-letter') {
    wordLength = 6;
    const wordArray = Array.from(validWordsSet).filter(word => word.length === wordLength);
    targetWord = wordArray[Math.floor(Math.random() * wordArray.length)];
  }

  maxGuesses = 6;

  // Reset the game board and keyboard
  const gameBoard = document.getElementById('game-board');
  gameBoard.innerHTML = '';
  createBoard();

  const keyboard = document.getElementById('keyboard');
  keyboard.innerHTML = '';
  createKeyboard();

  // Update game board grid to match word length
  gameBoard.style.gridTemplateColumns = `repeat(${wordLength}, 1fr)`;
}

// Get player's name from Firebase or prompt for it
function getPlayerName() {
  if (userId) {
    database.ref(`users/${userId}/profile/name`).once('value').then(snapshot => {
      playerName = snapshot.val() || '';
      if (!playerName) {
        showNameModal();
      }
    });
  } else {
    // If not authenticated, use localStorage
    playerName = localStorage.getItem('playerName') || '';
    if (!playerName) {
      showNameModal();
    }
  }
}

// Show name entry modal
function showNameModal() {
  const nameModal = document.getElementById('name-modal');
  nameModal.style.display = 'block';
  nameModal.setAttribute('aria-hidden', 'false');

  // Automatically focus the input field when the modal opens
  const playerNameInput = document.getElementById('player-name-input');
  playerNameInput.focus();

  document.getElementById('save-name-button').onclick = function () {
    const nameInput = playerNameInput;
    if (nameInput.value.trim()) {
      playerName = nameInput.value.trim();
      if (userId) {
        // Save to Firebase
        database.ref(`users/${userId}/profile`).update({
          name: playerName
        });
      } else {
        // Save to localStorage
        localStorage.setItem('playerName', playerName);
      }
      nameModal.style.display = 'none';
      nameModal.setAttribute('aria-hidden', 'true');
      startGame(currentMode); // Restart the game after saving the name
    } else {
      alert(i18next.t('please_enter_name') || 'Please enter your name.');
    }
  };
}

// Close modals
document.querySelectorAll('.close').forEach(closeBtn => {
  closeBtn.onclick = function () {
    const modal = this.parentElement.parentElement;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  };
});

// Create game board
function createBoard() {
  const gameBoard = document.getElementById('game-board');
  gameBoard.innerHTML = '';
  gameBoard.style.gridTemplateColumns = `repeat(${wordLength}, 1fr)`;

  for (let i = 0; i < maxGuesses * wordLength; i++) {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    const tileText = document.createElement('span');
    tile.appendChild(tileText);
    gameBoard.appendChild(tile);
  }
}

// Create keyboard
function createKeyboard() {
  const keyboard = document.getElementById('keyboard');
  keyboard.innerHTML = '';

  const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
  rows.forEach((row) => {
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('keyboard-row');
    row.split('').forEach((key) => {
      const button = document.createElement('button');
      button.textContent = key;
      button.id = 'key-' + key;
      button.setAttribute('aria-label', key);
      button.addEventListener('click', () => handleKeyPress(key));
      rowDiv.appendChild(button);
    });
    keyboard.appendChild(rowDiv);
  });

  const lastRow = document.createElement('div');
  lastRow.classList.add('keyboard-row');
  const enterButton = document.createElement('button');
  enterButton.textContent = 'Enter';
  enterButton.classList.add('wide-button');
  enterButton.setAttribute('aria-label', 'Enter');
  enterButton.addEventListener('click', () => handleKeyPress('Enter'));
  lastRow.appendChild(enterButton);

  const backspaceButton = document.createElement('button');
  backspaceButton.textContent = '←';
  backspaceButton.classList.add('wide-button');
  backspaceButton.setAttribute('aria-label', 'Backspace');
  backspaceButton.addEventListener('click', () => handleKeyPress('Backspace'));
  lastRow.appendChild(backspaceButton);

  keyboard.appendChild(lastRow);
}

// Handle key presses
function handleKeyPress(key) {
  if (!gameActive) return;

  key = key.toLowerCase();

  if (key === 'enter') {
    if (currentGuess.length === wordLength) {
      if (validWordsSet.has(currentGuess.toLowerCase())) {
        submitGuess();
      } else {
        showInvalidGuess();
      }
    }
  } else if (key === 'backspace') {
    currentGuess = currentGuess.slice(0, -1);
    updateBoard();
  } else if (/^[a-z]$/.test(key)) {
    if (currentGuess.length < wordLength) {
      currentGuess += key;
      updateBoard();
    }
  }
}

// Update game board
function updateBoard() {
  const gameBoard = document.getElementById('game-board');
  const tiles = gameBoard.querySelectorAll('.tile');
  const rowStart = guesses.length * wordLength;

  for (let i = 0; i < wordLength; i++) {
    const tile = tiles[rowStart + i];
    const tileText = tile.querySelector('span');
    tileText.textContent = currentGuess[i] ? currentGuess[i].toUpperCase() : '';
    tile.classList.remove('invalid');
  }
}

function displayAchievements() {
  if (!userId) return;

  const achievementsList = document.getElementById('achievements-list');
  achievementsList.innerHTML = '';

  const achievementsRef = database.ref(`users/${userId}/achievements`);
  achievementsRef.once('value').then(snapshot => {
    const userAchievements = snapshot.val() || {};
    achievements.forEach(achievement => {
      const achiv = document.createElement('div');
      achiv.classList.add('achievement');
      achiv.innerHTML = `
        <img src="icons/${achievement.id}.png" alt="${achievement.name} Icon">
        <strong>${achievement.name}</strong>: ${achievement.description} - ${userAchievements[achievement.id] ? '✅' : '❌'}
      `;
      achievementsList.appendChild(achiv);
    });
  });
}


// Submit guess and update keyboard
function submitGuess() {
  const gameBoard = document.getElementById('game-board');
  const tiles = gameBoard.querySelectorAll('.tile');
  const rowStart = guesses.length * wordLength;
  const guessArray = currentGuess.split('');
  const targetArray = targetWord.split('');
  const matchedIndices = new Array(wordLength).fill(false); // To track matched positions in target word

  // First pass: Check for correct letters in the correct position (Green)
  for (let i = 0; i < wordLength; i++) {
    const tile = tiles[rowStart + i];
    const keyButton = document.getElementById('key-' + guessArray[i].toUpperCase());

    if (guessArray[i] === targetArray[i]) {
      tile.classList.add('correct');
      if (!keyButton.classList.contains('key-correct')) {
        keyButton.classList.add('key-correct');
      }
      matchedIndices[i] = true;
    }
  }

  // Second pass: Check for correct letters in the wrong position (Yellow) and incorrect letters (Grey)
  for (let i = 0; i < wordLength; i++) {
    const tile = tiles[rowStart + i];
    const keyButton = document.getElementById('key-' + guessArray[i].toUpperCase());

    if (!tile.classList.contains('correct')) {
      let found = false;
      for (let j = 0; j < wordLength; j++) {
        if (!matchedIndices[j] && guessArray[i] === targetArray[j]) {
          found = true;
          matchedIndices[j] = true; // Mark this position as matched
          break;
        }
      }
      if (found) {
        tile.classList.add('present');
        if (
          !keyButton.classList.contains('key-correct') &&
          !keyButton.classList.contains('key-present')
        ) {
          keyButton.classList.add('key-present');
        }
      } else {
        tile.classList.add('absent');
        if (
          !keyButton.classList.contains('key-correct') &&
          !keyButton.classList.contains('key-present') &&
          !keyButton.classList.contains('key-absent')
        ) {
          keyButton.classList.add('key-absent');
        }
      }
    }
  }

  guesses.push(currentGuess);

  if (currentGuess === targetWord) {
    gameActive = false;
    setTimeout(() => {
      showWinningAnimation();
      logResult(true, currentMode); // Log result by mode
      updateAchievements();
    }, 500);
  } else if (guesses.length === maxGuesses) {
    gameActive = false;
    setTimeout(() => {
      alert(`Game Over! The word was ${targetWord.toUpperCase()}.`);
      logResult(false, currentMode); // Log result by mode
      updateAchievements();
    }, 500);
  }

  currentGuess = '';
}

// Function to log the result to Firebase
function logResult(won, mode) {
  const endTime = new Date();
  cons
