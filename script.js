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
        "profile": "Your Profile",
        "please_enter_name": "Please enter your name.",
        "definition": "Definition",
        "not_found": "Not found.",
        "definitions": "Definitions",
        "synonyms": "Synonyms",
        "antonyms": "Antonyms",
        "suggestions": "Suggestions",
        "games_played": "Games Played",
        "win_percentage": "Win Percentage",
        "average_attempts": "Average Attempts",
        "won": "Won",
        "lost": "Lost",
        "feedback_thank_you": "Thank you for your feedback!",
        "feedback_error": "There was an issue submitting your feedback. Please try again.",
        "feedback_auth_required": "Please sign in to submit feedback.",
        "please_enter_feedback": "Please enter your feedback.",
        "games_won": "Games Won",
        "games_lost": "Games Lost",
        "wordlist_submitted": "Word list submitted successfully!",
        "wordlist_error": "Error submitting word list. Please try again.",
        "please_enter_wordlist": "Please enter at least one word."
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
        "profile": "Tu Perfil",
        "please_enter_name": "Por favor, ingresa tu nombre.",
        "definition": "Definición",
        "not_found": "No encontrado.",
        "definitions": "Definiciones",
        "synonyms": "Sinónimos",
        "antonyms": "Antónimos",
        "suggestions": "Sugerencias",
        "games_played": "Juegos Jugados",
        "win_percentage": "Porcentaje de Victorias",
        "average_attempts": "Promedio de Intentos",
        "won": "Ganado",
        "lost": "Perdido",
        "feedback_thank_you": "¡Gracias por tus comentarios!",
        "feedback_error": "Hubo un problema al enviar tus comentarios. Por favor, intenta de nuevo.",
        "feedback_auth_required": "Por favor, inicia sesión para enviar comentarios.",
        "please_enter_feedback": "Por favor, ingresa tus comentarios.",
        "games_won": "Juegos Ganados",
        "games_lost": "Juegos Perdidos",
        "wordlist_submitted": "¡Lista de palabras enviada exitosamente!",
        "wordlist_error": "Error al enviar la lista de palabras. Por favor, intenta de nuevo.",
        "please_enter_wordlist": "Por favor, ingresa al menos una palabra."
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
  if (document.body.classList.contains('light-theme')) {
    document.body.classList.remove('light-theme');
    document.body.classList.remove('high-contrast-theme');
  } else if (document.body.classList.contains('high-contrast-theme')) {
    document.body.classList.remove('high-contrast-theme');
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.add('light-theme');
  }
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
  const timeTaken = Math.floor((endTime - startTime) / 1000); // in seconds
  const today = new Date().toLocaleDateString(); // e.g., "9/17/2024"

  const log = {
    player: playerName,
    time: new Date().toLocaleString(),
    timeTaken: timeTaken, // in seconds
    attempts: guesses.length,
    word: targetWord.toUpperCase(),
    won: won,
  };

  // Save the log to Firebase under the appropriate mode and date
  database.ref(`leaderboard/${mode}/${today}/` + Date.now()).set(log);
  
  // Update user statistics
  updateUserStats(won, guesses.length);
}

// Show invalid guess animation
function showInvalidGuess() {
  const gameBoard = document.getElementById('game-board');
  const tiles = gameBoard.querySelectorAll('.tile');
  const rowStart = guesses.length * wordLength;

  for (let i = 0; i < wordLength; i++) {
    const tile = tiles[rowStart + i];
    tile.classList.add('invalid');
  }

  setTimeout(() => {
    for (let i = 0; i < wordLength; i++) {
      const tile = tiles[rowStart + i];
      tile.classList.remove('invalid');
    }
  }, 500);
}

// Function to show the winning animation and modal
function showWinningAnimation() {
  const winningModal = document.getElementById('winning-modal');
  winningModal.style.display = 'block';
  winningModal.setAttribute('aria-hidden', 'false');

  // Fetch and display the word's definition
  fetchWordDefinition(targetWord)
    .then(definition => {
      const definitionDiv = document.getElementById('word-definition');
      definitionDiv.innerHTML = `<strong>${i18next.t('definition') || 'Definition'}:</strong> ${definition}`;
    })
    .catch(error => {
      const definitionDiv = document.getElementById('word-definition');
      definitionDiv.innerHTML = `<strong>${i18next.t('definition') || 'Definition'}:</strong> ${i18next.t('not_found') || 'Not found.'}`;
      console.error('Error fetching definition:', error);
    });

  // Confetti animation using canvas
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  // Confetti particles
  const confetti = [];
  for (let i = 0; i < 300; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * 10 + 10,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      tilt: Math.random() * 90 - 45,
    });
  }

  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti.forEach((c) => {
      ctx.beginPath();
      ctx.lineWidth = c.r;
      ctx.strokeStyle = c.color;
      ctx.moveTo(c.x + c.tilt + c.r / 2, c.y);
      ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r / 2);
      ctx.stroke();
    });
    updateConfetti();
    requestAnimationFrame(drawConfetti);
  }

  function updateConfetti() {
    confetti.forEach((c) => {
      c.tilt += Math.random() * 0.5 - 0.25;
      c.y += Math.cos(c.d) + 1 + c.r / 2;
      c.x += Math.sin(0);
      if (c.y > canvas.height) {
        c.x = Math.random() * canvas.width;
        c.y = -20;
      }
    });
  }

  drawConfetti();
}

// Fetch word definition from dictionary API
async function fetchWordDefinition(word) {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!response.ok) {
      throw new Error('Definition not found');
    }
    const data = await response.json();
    const definition = data[0].meanings[0].definitions[0].definition;
    return definition;
  } catch (error) {
    console.error('Error fetching word definition:', error);
    throw error;
  }
}

// Open leaderboard with tabs
function openLeaderboardTab(tabName) {
  const tabcontent = document.getElementsByClassName('tabcontent');
  const tablinks = document.getElementsByClassName('tablink');

  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = 'none';
  }

  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(' active', '');
  }

  document.getElementById(tabName).style.display = 'block';
  document.getElementById(tabName + '-tab').className += ' active';
}

document.getElementById('daily-tab').click(); // Default to open Daily tab

// View leaderboard data
function viewLeaderboard() {
  const today = new Date().toLocaleDateString();

  database.ref(`leaderboard/daily/${today}`).once('value', (snapshot) => {
    displayLeaderboard(snapshot.val(), 'leaderboard-daily');
  });

  database.ref(`leaderboard/random/${today}`).once('value', (snapshot) => {
    displayLeaderboard(snapshot.val(), 'leaderboard-random');
  });

  database.ref(`leaderboard/six-letter/${today}`).once('value', (snapshot) => {
    displayLeaderboard(snapshot.val(), 'leaderboard-sixLetter');
  });
  
  database.ref(`leaderboard/global/${today}`).once('value', (snapshot) => {
    displayLeaderboard(snapshot.val(), 'leaderboard-global');
  });

  const leaderboardModal = document.getElementById('leaderboard-modal');
  leaderboardModal.style.display = 'block';
  leaderboardModal.setAttribute('aria-hidden', 'false');
}

function displayLeaderboard(data, elementId) {
  const leaderboardElement = document.getElementById(elementId);
  leaderboardElement.innerHTML = '';

  if (!data) {
    leaderboardElement.innerHTML = `<p>${i18next.t('no_leaderboard_data') || 'No leaderboard data available for today.'}</p>`;
    return;
  }

  const leaderboard = Object.values(data).sort((a, b) => a.timeTaken - b.timeTaken);
  let leaderboardHTML = '<table><tr><th>Rank</th><th>Player</th><th>Time (s)</th><th>Attempts</th><th>Result</th></tr>';
  leaderboard.forEach((entry, index) => {
    leaderboardHTML += `<tr>
      <td>${index + 1}</td>
      <td>${entry.player}</td>
      <td>${entry.timeTaken}</td>
      <td>${entry.attempts}</td>
      <td>${entry.won ? i18next.t('won') || 'Won' : i18next.t('lost') || 'Lost'}</td>
    </tr>`;
  });
  leaderboardHTML += '</table>';
  leaderboardElement.innerHTML = leaderboardHTML;
}

// Suggestions Feature
function suggestNextWord() {
  // Simple frequency-based suggestion
  const letterFrequency = {};
  validWordsSet.forEach(word => {
    word.split('').forEach(letter => {
      letterFrequency[letter] = (letterFrequency[letter] || 0) + 1;
    });
  });
  // Rank words based on cumulative letter frequency
  const suggestions = Array.from(validWordsSet).sort((a, b) => {
    const aScore = a.split('').reduce((acc, letter) => acc + (letterFrequency[letter] || 0), 0);
    const bScore = b.split('').reduce((acc, letter) => acc + (letterFrequency[letter] || 0), 0);
    return bScore - aScore;
  });
  return suggestions.slice(0, 5); // Return top 5 suggestions
}

// Display Suggestions
function showSuggestions() {
  const suggestions = suggestNextWord();
  const suggestionsDiv = document.getElementById('suggestions-list');
  suggestionsDiv.innerHTML = `<strong>${i18next.t('suggestions') || 'Suggestions'}:</strong> ${suggestions.join(', ')}`;
}

document.getElementById('suggestions-button').addEventListener('click', showSuggestions);

// Share on Twitter
document.getElementById('share-button').addEventListener('click', () => {
  const shareText = `I just played Wordle Upgrade and ${guesses.length <= maxGuesses ? `solved it in ${guesses.length} attempts!` : 'failed to solve it.'} Can you beat me? #WordleUpgrade`;
  const twitterURL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  window.open(twitterURL, '_blank');
});

// Statistics Tracking
function updateUserStats(won, attempts) {
  if (!userId) return; // Only track stats for authenticated users

  const statsRef = database.ref(`users/${userId}/stats`);
  statsRef.transaction((currentStats) => {
    if (currentStats === null) {
      return {
        gamesPlayed: 1,
        gamesWon: won ? 1 : 0,
        currentStreak: won ? 1 : 0,
        maxStreak: won ? 1 : 0,
        totalAttempts: won ? attempts : 0,
      };
    } else {
      currentStats.gamesPlayed += 1;
      if (won) {
        currentStats.gamesWon += 1;
        currentStats.currentStreak += 1;
        if (currentStats.currentStreak > currentStats.maxStreak) {
          currentStats.maxStreak = currentStats.currentStreak;
        }
        currentStats.totalAttempts += attempts;
      } else {
        currentStats.currentStreak = 0;
      }
      return currentStats;
    }
  });
}

// Display Statistics Chart
function displayStatistics() {
  if (!userId) return;

  const statsRef = database.ref(`users/${userId}/stats`);
  statsRef.once('value').then(snapshot => {
    const stats = snapshot.val();
    if (stats) {
      const gamesPlayed = stats.gamesPlayed;
      const gamesWon = stats.gamesWon;
      const winPercentage = gamesPlayed > 0 ? ((gamesWon / gamesPlayed) * 100).toFixed(2) : 0;
      const averageAttempts = gamesWon > 0 ? (stats.totalAttempts / stats.gamesWon).toFixed(2) : 0;

      const ctx = document.getElementById('stats-chart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [i18next.t('games_played') || 'Games Played', i18next.t('win_percentage') || 'Win Percentage', i18next.t('average_attempts') || 'Average Attempts'],
          datasets: [{
            label: '# of Stats',
            data: [gamesPlayed, winPercentage, averageAttempts],
            backgroundColor: [
              'rgba(83, 141, 78, 0.6)',
              'rgba(181, 159, 59, 0.6)',
              'rgba(58, 58, 60, 0.6)'
            ],
            borderColor: [
              'rgba(83, 141, 78, 1)',
              'rgba(181, 159, 59, 1)',
              'rgba(58, 58, 60, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
    }
  });
}

// Achievements Tracking
const achievements = [
  { id: 'first_win', name: 'First Win', description: 'Win your first game!' },
  { id: 'ten_wins', name: 'Ten Wins', description: 'Win 10 games!' },
  { id: 'streak_5', name: '5-Day Streak', description: 'Win 5 consecutive games!' },
  // Add more achievements as needed
];

function updateAchievements() {
  if (!userId) return;

  const achievementsRef = database.ref(`users/${userId}/achievements`);
  achievementsRef.once('value').then(snapshot => {
    let userAchievements = snapshot.val() || {};

    // Check for each achievement
    achievements.forEach(achievement => {
      if (!userAchievements[achievement.id]) {
        // Define conditions for each achievement
        if (achievement.id === 'first_win' && guesses.length <= maxGuesses && currentGuess === targetWord) {
          userAchievements[achievement.id] = true;
          alert(`Achievement Unlocked: ${achievement.name} - ${achievement.description}`);
        }
        if (achievement.id === 'ten_wins' && (userAchievements['ten_wins_count'] || 0) >= 10) {
          userAchievements[achievement.id] = true;
          alert(`Achievement Unlocked: ${achievement.name} - ${achievement.description}`);
        }
        // Add more conditions as needed
      }
    });

    achievementsRef.set(userAchievements);
    displayAchievements();
  });
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

// Display Profile
function displayProfile() {
  if (!userId) return;

  const profileModal = document.getElementById('profile-modal');
  profileModal.style.display = 'block';
  profileModal.setAttribute('aria-hidden', 'false');

  const profileName = document.getElementById('profile-name');
  profileName.textContent = `Name: ${playerName}`;

  const statsRef = database.ref(`users/${userId}/stats`);
  statsRef.once('value').then(snapshot => {
    const stats = snapshot.val();
    if (stats) {
      const ctx = document.getElementById('profile-stats-chart').getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: [i18next.t('games_won') || 'Games Won', i18next.t('games_lost') || 'Games Lost'],
          datasets: [{
            data: [stats.gamesWon, stats.gamesPlayed - stats.gamesWon],
            backgroundColor: [
              'rgba(83, 141, 78, 0.6)',
              'rgba(58, 58, 60, 0.6)'
            ],
            borderColor: [
              'rgba(83, 141, 78, 1)',
              'rgba(58, 58, 60, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true
        }
      });
    }
  });
}

// Add event listeners for buttons
document.getElementById('view-leaderboard').addEventListener('click', viewLeaderboard);
document.getElementById('suggestions-button').addEventListener('click', showSuggestions);
document.getElementById('feedback-button').addEventListener('click', () => {
  const feedbackModal = document.getElementById('feedback-modal');
  feedbackModal.style.display = 'block';
  feedbackModal.setAttribute('aria-hidden', 'false');
});
document.getElementById('submit-feedback-button').addEventListener('click', submitFeedback);

// Feedback Submission Logic
function submitFeedback() {
  const feedback = document.getElementById('feedback-input').value.trim();
  if (feedback) {
    if (userId) {
      database.ref('feedback').push({
        player: playerName,
        feedback: feedback,
        submittedAt: firebase.database.ServerValue.TIMESTAMP,
      }).then(() => {
        alert(i18next.t('feedback_thank_you') || 'Thank you for your feedback!');
        document.getElementById('feedback-modal').style.display = 'none';
        document.getElementById('feedback-modal').setAttribute('aria-hidden', 'true');
      }).catch(err => {
        console.error('Error submitting feedback:', err);
        alert(i18next.t('feedback_error') || 'There was an issue submitting your feedback. Please try again.');
      });
    } else {
      alert(i18next.t('feedback_auth_required') || 'Please sign in to submit feedback.');
    }
  } else {
    alert(i18next.t('please_enter_feedback') || 'Please enter your feedback.');
  }
}

// User Authentication Handlers
const authModal = document.getElementById('auth-modal');
const emailAuthModal = document.getElementById('email-auth-modal');

// Open Authentication Modal on Page Load if Not Authenticated
auth.onAuthStateChanged((user) => {
  if (user) {
    userId = user.uid;
    playerName = user.displayName || user.email;
    localStorage.setItem('playerName', playerName);
    authModal.style.display = 'none';
    emailAuthModal.style.display = 'none';
    displayStatistics();
  } else {
    authModal.style.display = 'block';
    authModal.setAttribute('aria-hidden', 'false');
  }
});

// Sign In with Google
document.getElementById('google-signin-button').addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(error => {
    console.error('Google Sign-In Error:', error);
  });
});

// Sign In with Facebook
document.getElementById('facebook-signin-button').addEventListener('click', () => {
  const provider = new firebase.auth.FacebookAuthProvider();
  auth.signInWithPopup(provider).catch(error => {
    console.error('Facebook Sign-In Error:', error);
  });
});


