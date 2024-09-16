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
const fiveLetterWords = ['apple', 'brave', 'crane', 'drive', 'eagle'];
const sixLetterWords = ['animal', 'banana', 'camera', 'dragon', 'energy'];

// Function to start the game
function startGame(mode) {
  gameActive = true;
  currentGuess = '';
  guesses = [];
  startTime = new Date();

  playerName = prompt('Enter your name:');
  if (!playerName) {
    playerName = 'Anonymous';
  }

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
  const keys = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');

  keys.forEach((key) => {
    const button = document.createElement('button');
    button.textContent = key;
    button.addEventListener('click', () => handleKeyPress(key));
    keyboard.appendChild(button);
  });

  // Add Enter and Backspace keys
  const enterButton = document.createElement('button');
  enterButton.textContent = 'Enter';
  enterButton.classList.add('wide-button');
  enterButton.addEventListener('click', () => handleKeyPress('Enter'));
  keyboard.appendChild(enterButton);

  const backspaceButton = document.createElement('button');
  backspaceButton.textContent = '←';
  backspaceButton.classList.add('wide-button');
  backspaceButton.addEventListener('click', () => handleKeyPress('Backspace'));
  keyboard.appendChild(backspaceButton);
}

// Function to handle key presses
function handleKeyPress(key) {
  if (!gameActive) return;

  if (key === 'Enter') {
    if (currentGuess.length === wordLength) {
      submitGuess();
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
  } else if (key === 'Backspace') {
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

  // Mark each tile
  for (let i = 0; i < wordLength; i++) {
    const tile = tiles[rowStart + i];
    const tileText = tile.querySelector('span');
    tile.classList.add('flip');

    if (guessArray[i] === targetArray[i]) {
      tile.classList.add('correct');
    } else if (targetArray.includes(guessArray[i])) {
      tile.classList.add('present');
    } else {
      tile.classList.add('absent');
    }
  }

  guesses.push(currentGuess);

  // Check for win or loss
  if (currentGuess === targetWord) {
    gameActive = false;
    setTimeout(() => {
      alert('Congratulations! You guessed the word.');
      logResult(true);
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

  // Enable share button
  const shareButton = document.getElementById('share-button');
  shareButton.style.display = 'block';
  shareButton.onclick = () => shareResult(log);
}

// Function to share result on WhatsApp
function shareResult(log) {
  const message = `I just played Wordle Upgrade!\nPlayer: ${log.player}\nTime Taken: ${log.timeTaken} seconds\nAttempts: ${log.attempts}\n${log.won ? 'I won!' : 'I lost.'}`;
  const whatsappURL = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, '_blank');
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

    // Create leaderboard text
    let leaderboardText = 'Leaderboard:\n';
    leaderboard.forEach((entry, index) => {
      leaderboardText += `${index + 1}. ${entry.player} - ${entry.timeTaken}s - Attempts: ${entry.attempts} - ${entry.won ? 'Won' : 'Lost'}\n`;
    });

    alert(leaderboardText);
  });
}

// Event listeners for mode selection
document.getElementById('daily-mode').addEventListener('click', () => startGame('daily'));
document.getElementById('random-mode').addEventListener('click', () => startGame('random'));
document.getElementById('six-letter-mode').addEventListener('click', () => startGame('six-letter'));
document.getElementById('view-leaderboard').addEventListener('click', viewLeaderboard);

// Hide share button initially
document.getElementById('share-button').style.display = 'none';

// Initialize the game
startGame('daily');
