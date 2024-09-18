// Initialize Firebase (Using your Firebase project's configuration)
var firebaseConfig = {
  apiKey: "AIzaSyApXW3PWhqhQ0mXeIG1oo5mdawQD29Xxjs",
  authDomain: "wordle-upgrade-c055f.firebaseapp.com",
  databaseURL: "https://wordle-upgrade-c055f-default-rtdb.firebaseio.com",
  projectId: "wordle-upgrade-c055f",
  appId: "1:683362789332:web:96a84b1ffae380e5e85841",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

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

// Load word list
async function loadWordList() {
  try {
    const response = await fetch('words.txt');
    const text = await response.text();
    const wordsArray = text.split('\n').map(word => word.trim().toLowerCase());
    validWordsSet = new Set(wordsArray);
    console.log('Word list loaded');
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

// Get player's name from localStorage
function getPlayerName() {
  playerName = localStorage.getItem('playerName') || '';
  if (!playerName) {
    showNameModal();
  }
}

// Show name entry modal
function showNameModal() {
  const nameModal = document.getElementById('name-modal');
  nameModal.style.display = 'block';

  // Automatically focus the input field when the modal opens
  const playerNameInput = document.getElementById('player-name-input');
  playerNameInput.focus();

  document.getElementById('save-name-button').onclick = function () {
  const nameInput = document.getElementById('player-name-input');
  if (nameInput.value.trim()) {
    playerName = nameInput.value.trim();
    localStorage.setItem('playerName', playerName);
    nameModal.style.display = 'none';
    startGame(currentMode); // Restart the game after saving the name
  } else {
    alert('Please enter your name.');
  }
};

// Close modals
document.getElementById('name-modal-close').onclick = function () {
  const nameModal = document.getElementById('name-modal');
  nameModal.style.display = 'none';
};

document.getElementById('leaderboard-modal-close').onclick = function () {
  const leaderboardModal = document.getElementById('leaderboard-modal');
  leaderboardModal.style.display = 'none';
};

document.getElementById('close-winning-modal').onclick = function () {
  const winningModal = document.getElementById('winning-modal');
  winningModal.style.display = 'none';
};

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
  enterButton.addEventListener('click', () => handleKeyPress('Enter'));
  lastRow.appendChild(enterButton);

  const backspaceButton = document.createElement('button');
  backspaceButton.textContent = '←';
  backspaceButton.classList.add('wide-button');
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
    }, 500);
  } else if (guesses.length === maxGuesses) {
    gameActive = false;
    setTimeout(() => {
      alert(`Game Over! The word was ${targetWord.toUpperCase()}.`);
      logResult(false, currentMode); // Log result by mode
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

  // Fetch and display the word's definition
  fetchWordDefinition(targetWord)
    .then(definition => {
      const definitionDiv = document.getElementById('word-definition');
      definitionDiv.innerHTML = `<strong>Definition:</strong> ${definition}`;
    })
    .catch(error => {
      const definitionDiv = document.getElementById('word-definition');
      definitionDiv.innerHTML = `<strong>Definition:</strong> Not found.`;
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
    displayLeaderboard(snapshot.val(), 'leaderboard-sixLetter'); // Corrected ID
  });

  const leaderboardModal = document.getElementById('leaderboard-modal');
  leaderboardModal.style.display = 'block';
}


function displayLeaderboard(data, elementId) {
  const leaderboardElement = document.getElementById(elementId);
  leaderboardElement.innerHTML = '';

  if (!data) {
    leaderboardElement.innerHTML = '<p>No leaderboard data available for today.</p>';
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
      <td>${entry.won ? 'Won' : 'Lost'}</td>
    </tr>`;
  });
  leaderboardHTML += '</table>';
  leaderboardElement.innerHTML = leaderboardHTML;
}


/* // Reset leaderboard at midnight
function checkAndResetLeaderboard() {
  const today = new Date().toLocaleDateString();
  database.ref('leaderboard/resetDate').once('value', (snapshot) => {
    const lastResetDate = snapshot.val();
    if (lastResetDate !== today) {
      resetLeaderboards();
      database.ref('leaderboard/resetDate').set(today);
    }
  });
}

function resetLeaderboards() {
  database.ref('leaderboard/daily').remove();
  database.ref('leaderboard/random').remove();
  database.ref('leaderboard/six-letter').remove();
  console.log('Leaderboards reset at midnight.');
}

checkAndResetLeaderboard(); // Call the reset check on load
*/

// Add event listeners for buttons
document.getElementById('view-leaderboard').addEventListener('click', viewLeaderboard);

// Add event listeners for game mode buttons
document.getElementById('daily-mode').addEventListener('click', () => startGame('daily'));
document.getElementById('random-mode').addEventListener('click', () => startGame('random'));
document.getElementById('six-letter-mode').addEventListener('click', () => startGame('six-letter'));

// Add event listener for physical keyboard input
document.addEventListener('keydown', (event) => {
  const nameModal = document.getElementById('name-modal');
  const isNameModalOpen = nameModal.style.display === 'block';
  const playerNameInput = document.getElementById('player-name-input');
  const isInputFocused = document.activeElement === playerNameInput;

  // If the name modal is open and the input is focused, do not handle the keypress for the game
  if (isNameModalOpen && isInputFocused) {
    return; // Let the input field handle the keypress
  }

  let key = event.key;

  if (key === 'Backspace' || key === 'Enter' || /^[a-zA-Z]$/.test(key)) {
    event.preventDefault(); // Prevent default behavior for these keys
    handleKeyPress(key);
  }
});


// Start the game with default mode
startGame('daily');