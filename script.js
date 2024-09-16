// Firebase configuration
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

// Word lists
const fiveLetterWords = ['apple', 'brave', 'crane', 'drive', 'eagle', 'fable', 'gamer', 'happy'];
const sixLetterWords = ['animal', 'banana', 'camera', 'dragon', 'energy', 'forest', 'galaxy', 'harbor'];

// Comprehensive word list for validation
let validWords = [];

// Load valid words from an external source or define them here
// For this example, we'll combine both word lists
validWords = [...fiveLetterWords, ...sixLetterWords];

// Function to start the game
function startGame(mode) {
  gameActive = true;
  currentGuess = '';
  guesses = [];
  startTime = new Date();

  getPlayerName();

  if (mode === 'daily') {
    targetWord = 'apple';
    wordLength = 5;
  } else if (mode === 'random') {
    wordLength = 5;
    targetWord = fiveLetterWords[Math.floor(Math.random() * fiveLetterWords.length)];
  } else if (mode === 'six-letter') {
    wordLength = 6;
    targetWord = sixLetterWords[Math.floor(Math.random() * sixLetterWords.length)];
  }

  maxGuesses = 6;
  createBoard();
  createKeyboard();
}

// Function to get player name from cookie or prompt
function getPlayerName() {
  playerName = localStorage.getItem('playerName') || '';
  if (!playerName) {
    showNameModal();
  }
}

// Function to show the name entry modal
function showNameModal() {
  const nameModal = document.getElementById('name-modal');
  nameModal.style.display = 'block';

  document.getElementById('save-name-button').onclick = function () {
    const nameInput = document.getElementById('player-name-input');
    if (nameInput.value.trim()) {
      playerName = nameInput.value.trim();
      localStorage.setItem('playerName', playerName);
      nameModal.style.display = 'none';
    } else {
      alert('Please enter your name.');
    }
  };
}

// Close name modal when 'X' is clicked
document.getElementById('name-modal-close').onclick = function () {
  const nameModal = document.getElementById('name-modal');
  nameModal.style.display = 'none';
};

// Close leaderboard modal when 'X' is clicked
document.getElementById('leaderboard-modal-close').onclick = function () {
  const leaderboardModal = document.getElementById('leaderboard-modal');
  leaderboardModal.style.display = 'none';
};

// Close winning modal when clicked
document.getElementById('winning-modal').onclick = function () {
  const winningModal = document.getElementById('winning-modal');
  winningModal.style.display = 'none';
};

// Function to create the game board
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

// Function to create the on-screen keyboard
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

  // Add Enter and Backspace keys
  const bottomRow = document.createElement('div');
  bottomRow.classList.add('keyboard-row');

  const enterButton = document.createElement('button');
  enterButton.textContent = 'Enter';
  enterButton.classList.add('wide-button');
  enterButton.addEventListener('click', () => handleKeyPress('Enter'));
  bottomRow.appendChild(enterButton);

  const backspaceButton = document.createElement('button');
  backspaceButton.textContent = '←';
  backspaceButton.classList.add('wide-button');
  backspaceButton.addEventListener('click', () => handleKeyPress('Backspace'));
  bottomRow.appendChild(backspaceButton);

  keyboard.appendChild(bottomRow);
}

// Function to handle key presses
function handleKeyPress(key) {
  if (!gameActive) return;

  if (key === 'Enter') {
    if (currentGuess.length === wordLength) {
      if (validWords.includes(currentGuess)) {
        submitGuess();
      } else {
        alert('Not a valid word.');
      }
    }
  } else if (key === 'Backspace') {
    currentGuess = currentGuess.slice(0, -1);
    updateBoard();
  } else if (/^[A-Z]$/.test(key)) {
    if (currentGuess.length < wordLength) {
      currentGuess += key.toLowerCase();
      updateBoard();
    }
  }
}

// Enable keyboard input on desktop
document.addEventListener('keydown', (event) => {
  if (!gameActive) return;
  let key = event.key;
  if (key === 'Enter') {
    handleKeyPress('Enter');
  } else if (key === 'Backspace' || key === 'Delete') {
    handleKeyPress('Backspace');
  } else if (/^[a-zA-Z]$/.test(key)) {
    handleKeyPress(key.toUpperCase());
  }
});

// Function to update the game board
function updateBoard() {
  const gameBoard = document.getElementById('game-board');
  const tiles = gameBoard.querySelectorAll('.tile');
  const rowStart = guesses.length * wordLength;

  for (let i = 0; i < wordLength; i++) {
    const tile = tiles[rowStart + i];
    const tileText = tile.querySelector('span');
    tileText.textContent = currentGuess[i] ? currentGuess[i].toUpperCase() : '';
  }
}

// Function to submit a guess
function submitGuess() {
  const gameBoard = document.getElementById('game-board');
  const tiles = gameBoard.querySelectorAll('.tile');
  const rowStart = guesses.length * wordLength;
  const guessArray = currentGuess.split('');
  const targetArray = targetWord.split('');

  let remainingLetters = targetArray.slice();

  // Mark each tile
  for (let i = 0; i < wordLength; i++) {
    const tile = tiles[rowStart + i];
    const tileText = tile.querySelector('span');
    tile.classList.add('flip');

    const keyButton = document.getElementById('key-' + guessArray[i].toUpperCase());

    if (guessArray[i] === targetArray[i]) {
      tile.classList.add('correct');
      keyButton.classList.remove('key-present');
      keyButton.classList.add('key-correct');
      remainingLetters[i] = null;
    } else if (remainingLetters.includes(guessArray[i])) {
      tile.classList.add('present');
      if (!keyButton.classList.contains('key-correct')) {
        keyButton.classList.add('key-present');
      }
      remainingLetters[remainingLetters.indexOf(guessArray[i])] = null;
    } else {
      tile.classList.add('absent');
      keyButton.classList.add('key-absent');
    }
  }

  guesses.push(currentGuess);

  // Check for win or loss
  if (currentGuess === targetWord) {
    gameActive = false;
    setTimeout(() => {
      showWinningAnimation();
      logResult(true);
      shareResult();
    }, 500);
  } else if (guesses.length === maxGuesses) {
    gameActive = false;
    setTimeout(() => {
      alert(`Game Over! The word was ${targetWord.toUpperCase()}.`);
      logResult(false);
    }, 500);
  }

  currentGuess = '';
}

// Function to log the result
function logResult(won) {
  const endTime = new Date();
  const timeTaken = Math.floor((endTime - startTime) / 1000); // in seconds

  const log = {
    player: playerName,
    time: new Date().toLocaleString(),
    timeTaken: timeTaken, // in seconds
    attempts: guesses.length,
    word: targetWord.toUpperCase(),
    won: won,
  };

  // Save log to Firebase
  database.ref('leaderboard/' + Date.now()).set(log);
}

// Function to share result on WhatsApp
function shareResult() {
  const lastLogRef = database.ref('leaderboard').limitToLast(1);
  lastLogRef.once('value', (snapshot) => {
    const data = snapshot.val();
    const log = Object.values(data)[0];
    const message = `I just played Wordle Upgrade!\nPlayer: ${log.player}\nTime Taken: ${log.timeTaken} seconds\nAttempts: ${log.attempts}\n${log.won ? 'I won!' : 'I lost.'}`;
    const whatsappURL = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  });
}

// Function to view the leaderboard
function viewLeaderboard() {
  database.ref('leaderboard').once('value', (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      alert('No leaderboard data available.');
      return;
    }

    // Convert data to an array and sort by timeTaken
    const leaderboard = Object.values(data).sort((a, b) => a.timeTaken - b.timeTaken);

    // Build leaderboard HTML
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

    const leaderboardContent = document.getElementById('leaderboard-content');
    leaderboardContent.innerHTML = leaderboardHTML;

    const leaderboardModal = document.getElementById('leaderboard-modal');
    leaderboardModal.style.display = 'block';
  });
}

// Function to show winning animation
function showWinningAnimation() {
  const winningModal = document.getElementById('winning-modal');
  winningModal.style.display = 'block';

  // Confetti animation using canvas
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

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

// Event listeners for mode selection
document.getElementById('daily-mode').addEventListener('click', () => startGame('daily'));
document.getElementById('random-mode').addEventListener('click', () => startGame('random'));
document.getElementById('six-letter-mode').addEventListener('click', () => startGame('six-letter'));
document.getElementById('share-button').addEventListener('click', shareResult);

// Hide share button initially
document.getElementById('share-button').style.display = 'none';

// Initialize the game
startGame('daily');