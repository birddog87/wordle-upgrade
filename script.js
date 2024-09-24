/// Initialize Firebase (Using your Firebase project's configuration)
var firebaseConfig = {
  apiKey: "AIzaSyApXW3PWhqhQ0mXeIG1oo5mdawQD29Xxjs",
  authDomain: "wordle-upgrade-c055f.firebaseapp.com",
  databaseURL: "https://wordle-upgrade-c055f-default-rtdb.firebaseio.com",
  projectId: "wordle-upgrade-c055f",
  appId: "1:683362789332:web:e3aeb537a5f96773e85841",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var database = firebase.database();
var auth = firebase.auth();

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
let currentMode = 'daily';

// User ID for Firebase (after authentication)
let userId = null;

// Streak Counter
let currentStreak = 0;

// Load word list
async function loadWordList() {
  try {
    const response = await fetch('words_en.txt');
    if (!response.ok) {
      throw new Error('Failed to load word list');
    }
    const text = await response.text();
    const wordsArray = text
      .split('\n')
      .map(word => word.trim().toLowerCase())
      .filter(word => word.length > 0);
    validWordsSet = new Set(wordsArray);
    console.log('Word list loaded');
  } catch (error) {
    console.error('Error loading word list:', error);
  }
}

// Function to update the mode indicator
function updateModeIndicator(mode) {
  const modeIndicator = document.getElementById('mode-indicator');
  modeIndicator.textContent = `Current Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
  console.log('Mode updated:', mode);
}

// Event listeners for mode buttons
document.getElementById('daily-mode-button').addEventListener('click', () => startGame('daily'));
document.getElementById('random-mode-button').addEventListener('click', () => startGame('random'));
document.getElementById('six-letter-mode-button').addEventListener('click', () => startGame('six-letter'));

// Start the game based on mode
async function startGame(mode) {
  console.log('Starting game in mode:', mode);
  await loadWordList();
  gameActive = true;
  currentGuess = '';
  guesses = [];
  startTime = new Date();
  currentMode = mode;

  updateModeIndicator(mode);

  getPlayerName();

  // Set word length and target word based on mode
  if (mode === 'daily') {
    wordLength = 5;
    targetWord = getDailyWord();
  } else if (mode === 'random') {
    wordLength = 5;
    targetWord = getRandomWord(wordLength);
  } else if (mode === 'six-letter') {
    wordLength = 6;
    targetWord = getRandomWord(wordLength);
  }

  console.log('Target word:', targetWord);

  maxGuesses = 6;

  // Reset the game board and keyboard
  createBoard();
  createKeyboard();

  // Function to get a random word
  function getRandomWord(length) {
    const filteredWords = Array.from(validWordsSet).filter(word => word.length === length);
    return filteredWords[Math.floor(Math.random() * filteredWords.length)];
  }

  // Function to get the daily word
  function getDailyWord() {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const filteredWords = Array.from(validWordsSet).filter(word => word.length === 5);
    return filteredWords[seed % filteredWords.length];
  }

  // Get player's name from Firebase or prompt for it
  function getPlayerName() {
    if (userId) {
      database.ref(`users/${userId}/profile/name`).once('value').then(snapshot => {
        playerName = snapshot.val() || '';
        if (!playerName) {
          showNameModal();
        }
        updateUserDisplay();
      });
    } else {
      // If not authenticated, use localStorage
      playerName = localStorage.getItem('playerName') || '';
      if (!playerName) {
        showNameModal();
      }
      updateUserDisplay();
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
        playerName = sanitizeHTML(nameInput.value.trim());
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
        updateUserDisplay();
        startGame(currentMode); // Restart the game after saving the name
      } else {
        alert('Please enter your name.');
      }
    };
  }
}

// Create game board
function createBoard() {
  const gameBoard = document.getElementById('game-board');
  gameBoard.innerHTML = '';

  for (let i = 0; i < maxGuesses; i++) {
    const row = document.createElement('div');
    row.classList.add('board-row');
    row.style.display = 'grid';
    row.style.gridTemplateColumns = `repeat(${wordLength}, 1fr)`;
    row.style.gridGap = '5px';

    for (let j = 0; j < wordLength; j++) {
      const tile = document.createElement('div');
      tile.classList.add('tile');
      tile.setAttribute('data-row', i);
      tile.setAttribute('data-col', j);
      row.appendChild(tile);
    }
    gameBoard.appendChild(row);
  }

  console.log('Game board created with', maxGuesses * wordLength, 'tiles');
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

  console.log('Key pressed:', key);

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
  const currentRow = gameBoard.children[guesses.length];
  const tiles = currentRow.querySelectorAll('.tile');

  for (let i = 0; i < wordLength; i++) {
    const tile = tiles[i];
    tile.textContent = currentGuess[i] ? currentGuess[i].toUpperCase() : '';
    tile.classList.remove('invalid');
    tile.classList.remove('flip');
  }

  console.log('Board updated. Current guess:', currentGuess);
}

// Submit guess and update keyboard
function submitGuess() {
  console.log('Submitting guess:', currentGuess);

  const gameBoard = document.getElementById('game-board');
  const currentRow = gameBoard.children[guesses.length];
  const tiles = currentRow.querySelectorAll('.tile');
  const guessArray = currentGuess.split('');
  const targetArray = targetWord.split('');
  const matchedIndices = new Array(wordLength).fill(false);
  const animationPromises = [];

  // First pass: Check for correct letters in the correct position (Green)
  for (let i = 0; i < wordLength; i++) {
    if (guessArray[i] === targetArray[i]) {
      matchedIndices[i] = true;
    }
  }

  // Second pass: Check for correct letters in the wrong position (Yellow) and incorrect letters (Grey)
  for (let i = 0; i < wordLength; i++) {
    const tile = tiles[i];
    const keyButton = document.getElementById('key-' + guessArray[i].toUpperCase());

    setTimeout(() => {
      tile.classList.add('flip');

      if (guessArray[i] === targetArray[i]) {
        tile.classList.add('correct');
        if (!keyButton.classList.contains('key-correct')) {
          keyButton.classList.add('key-correct');
        }
      } else if (targetArray.includes(guessArray[i]) && !matchedIndices[targetArray.indexOf(guessArray[i])]) {
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
    }, i * 500);

    animationPromises.push(new Promise(resolve => setTimeout(resolve, (i + 1) * 500)));
  }

  Promise.all(animationPromises).then(() => {
    guesses.push(currentGuess);

    if (currentGuess === targetWord) {
      gameActive = false;
      setTimeout(() => {
        showWinningAnimation();
        logResult(true, currentMode);
        updateAchievements();
      }, 500);
    } else if (guesses.length === maxGuesses) {
      gameActive = false;
      setTimeout(() => {
        alert(`Game Over! The word was ${targetWord.toUpperCase()}.`);
        logResult(false, currentMode);
        updateAchievements();
      }, 500);
    }

    currentGuess = '';
  });
}

// Function to log the result to Firebase
function logResult(won, mode) {
  const endTime = new Date();
  const timeTaken = Math.floor((endTime - startTime) / 1000); // in seconds
  const today = new Date().toLocaleDateString(); // e.g., "9/17/2024"

  const log = {
    player: playerName,
    time: endTime.toLocaleString(),
    timeTaken: timeTaken,
    attempts: guesses.length,
    word: targetWord.toUpperCase(),
    won: won,
  };

  // Save the log to Firebase under the appropriate mode and date
  database.ref(`leaderboard/${mode}/${today}/` + Date.now()).set(log)
    .catch(error => {
      console.error('Error writing to leaderboard:', error);
      alert('Unable to log your game result. Please try again later.');
    });

  // Update user statistics
  updateUserStats(won, guesses.length);
}

// Show invalid guess animation
function showInvalidGuess() {
  const gameBoard = document.getElementById('game-board');
  const currentRow = gameBoard.children[guesses.length];
  const tiles = currentRow.querySelectorAll('.tile');

  tiles.forEach(tile => {
    tile.classList.add('invalid');
  });

  setTimeout(() => {
    tiles.forEach(tile => {
      tile.classList.remove('invalid');
    });
  }, 500);
}

// Function to show the winning animation and modal
function showWinningAnimation() {
  const winningModal = document.getElementById('winning-modal');
  winningModal.style.display = 'block';
  winningModal.setAttribute('aria-hidden', 'false');

  // Display the word in the modal
  const winningWordDisplay = document.getElementById('winning-word-display');
  winningWordDisplay.textContent = `You guessed the word: ${targetWord.toUpperCase()}`;

  // Fetch and display the word's definition
  fetchWordDefinition(targetWord)
    .then(details => {
      const definitionDiv = document.getElementById('word-definition');
      let htmlContent = `<strong>Definition:</strong><br>`;
      details.forEach(detail => {
        htmlContent += `<strong>${detail.partOfSpeech}:</strong> ${detail.definitions.join(', ')}<br>`;
        if (detail.synonyms && detail.synonyms.length > 0) {
          htmlContent += `<strong>Synonyms:</strong> ${detail.synonyms.join(', ')}<br>`;
        }
        if (detail.antonyms && detail.antonyms.length > 0) {
          htmlContent += `<strong>Antonyms:</strong> ${detail.antonyms.join(', ')}<br>`;
        }
      });
      definitionDiv.innerHTML = htmlContent;
    })
    .catch(error => {
      const definitionDiv = document.getElementById('word-definition');
      definitionDiv.innerHTML = `<strong>Definition:</strong> Not found.`;
      console.error('Error fetching word details:', error);
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
      throw new Error('Word details not found');
    }
    const data = await response.json();
    const meanings = data[0].meanings.map(meaning => ({
      partOfSpeech: meaning.partOfSpeech,
      definitions: meaning.definitions.map(def => def.definition),
      synonyms: meaning.synonyms,
      antonyms: meaning.antonyms,
    }));
    return meanings;
  } catch (error) {
    console.error('Error fetching word details:', error);
    return [{
      partOfSpeech: 'N/A',
      definitions: ['Details not available.'],
      synonyms: [],
      antonyms: [],
    }];
  }
}

// View leaderboard data
function viewLeaderboard() {
  const leaderboardModal = document.getElementById('leaderboard-modal');
  leaderboardModal.style.display = 'block';
  leaderboardModal.setAttribute('aria-hidden', 'false');

  const tabs = document.querySelectorAll('.tablink');
  const tabContents = document.querySelectorAll('.tabcontent');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      tabContents.forEach(content => content.classList.remove('active'));
      const activeContent = document.getElementById(tab.getAttribute('data-tab'));
      activeContent.classList.add('active');
    });
  });

  // Fetch and display leaderboard data for each mode
  const modes = ['daily', 'random', 'six-letter', 'global'];

  modes.forEach(mode => {
    const leaderboardDiv = document.getElementById(`leaderboard-${mode}`);
    leaderboardDiv.innerHTML = '<p>Loading...</p>';
    fetchLeaderboardData(mode, leaderboardDiv);
  });

  // Close event listener
  document.getElementById('leaderboard-modal-close').addEventListener('click', () => {
    leaderboardModal.style.display = 'none';
    leaderboardModal.setAttribute('aria-hidden', 'true');
  });
}

function fetchLeaderboardData(mode, container) {
  database.ref(`leaderboard/${mode}`).once('value')
    .then(snapshot => {
      const data = snapshot.val();
      const leaderboardHTML = displayLeaderboard(data, mode);
      container.innerHTML = leaderboardHTML;
    })
    .catch(error => {
      console.error('Error fetching leaderboard data:', error);
      container.innerHTML = '<p>Error loading leaderboard. Please try again later.</p>';
    });
}

function displayLeaderboard(data, mode) {
  if (!data) {
    return `<p>No leaderboard data available for ${mode} mode.</p>`;
  }

  const allEntries = [];
  Object.values(data).forEach(dateEntries => {
    Object.values(dateEntries).forEach(entry => {
      allEntries.push(entry);
    });
  });

  allEntries.sort((a, b) => {
    if (a.won !== b.won) return b.won - a.won; // Sort by wins first
    if (a.attempts !== b.attempts) return a.attempts - b.attempts; // Then by attempts
    return a.timeTaken - b.timeTaken; // Finally by time taken
  });

  let leaderboardHTML = '<table><tr><th>Rank</th><th>Player</th><th>Result</th><th>Attempts</th><th>Time (s)</th></tr>';
  allEntries.slice(0, 10).forEach((entry, index) => {
    leaderboardHTML += `<tr>
      <td>${index + 1}</td>
      <td>${sanitizeHTML(entry.player)}</td>
      <td>${entry.won ? 'Won' : 'Lost'}</td>
      <td>${entry.attempts}</td>
      <td>${entry.timeTaken}</td>
    </tr>`;
  });
  leaderboardHTML += '</table>';
  return leaderboardHTML;
}

// Share on Twitter
document.getElementById('share-button').addEventListener('click', () => {
  const shareText = generateShareText();
  const twitterURL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  window.open(twitterURL, '_blank');
});

// Share on WhatsApp
document.getElementById('share-whatsapp-button').addEventListener('click', () => {
  const shareText = generateShareText();
  const whatsappURL = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  window.open(whatsappURL, '_blank');
});

// Generate share text similar to Wordle
function generateShareText() {
  let shareText = `Wordle Upgrade - ${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} Mode\n`;
  shareText += `${guesses.length}/${maxGuesses}\n\n`;

  guesses.forEach(guess => {
    let rowResult = '';
    for (let i = 0; i < wordLength; i++) {
      if (guess[i] === targetWord[i]) {
        rowResult += '🟩';
      } else if (targetWord.includes(guess[i])) {
        rowResult += '🟨';
      } else {
        rowResult += '⬛';
      }
    }
    shareText += rowResult + '\n';
  });

  return shareText;
}

// Statistics Tracking
function updateUserStats(won, attempts) {
  if (!userId) return; // Only track stats for authenticated users

  const statsRef = database.ref(`users/${userId}/stats`);
  statsRef.transaction((currentStats) => {
    if (currentStats === null) {
      currentStreak = won ? 1 : 0;
      return {
        gamesPlayed: 1,
        gamesWon: won ? 1 : 0,
        currentStreak: currentStreak,
        maxStreak: currentStreak,
        totalAttempts: won ? attempts : 0,
      };
    } else {
      currentStats.gamesPlayed += 1;
      if (won) {
        currentStats.gamesWon += 1;
        currentStats.currentStreak += 1;
        currentStreak = currentStats.currentStreak;
        if (currentStats.currentStreak > currentStats.maxStreak) {
          currentStats.maxStreak = currentStats.currentStreak;
        }
        currentStats.totalAttempts += attempts;
      } else {
        currentStats.currentStreak = 0;
        currentStreak = 0;
      }
      return currentStats;
    }
  }).then(() => {
    document.getElementById('streak-counter').textContent = `Current Streak: ${currentStreak}`;
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
      currentStreak = stats.currentStreak || 0;

      document.getElementById('streak-counter').textContent = `Current Streak: ${currentStreak}`;

      const ctx = document.getElementById('stats-chart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Games Played', 'Win %', 'Avg Attempts'],
          datasets: [{
            label: 'Statistics',
            data: [gamesPlayed, winPercentage, averageAttempts],
            backgroundColor: ['#538D4E', '#B59F3B', '#3A3A3C']
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
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
        if (achievement.id === 'ten_wins' && userAchievements['ten_wins_count'] >= 10) {
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
          labels: [
            'Games Won',
            'Games Lost'
          ],
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

// Share Suggestions Function (Assuming it's defined elsewhere)
function showSuggestions() {
  // Implement your suggestions functionality here
  alert('Suggestions feature is not implemented yet.');
}

// Statistics Tracking Trigger (Optional: You can call this function where appropriate)
document.getElementById('display-statistics-button')?.addEventListener('click', displayStatistics);

// Achievements Modal (Assuming there's a button to view achievements)
document.getElementById('view-achievements-button')?.addEventListener('click', () => {
  const achievementsModal = document.getElementById('achievements-modal');
  achievementsModal.style.display = 'block';
  achievementsModal.setAttribute('aria-hidden', 'false');
});

// Function to display achievements when achievements are updated
// (Already handled in displayAchievements function)

// Add event listeners for leaderboard, suggestions, feedback, profile, etc.
document.getElementById('view-leaderboard').addEventListener('click', viewLeaderboard);
document.getElementById('suggestions-button').addEventListener('click', showSuggestions);
document.getElementById('feedback-button').addEventListener('click', () => {
  const feedbackModal = document.getElementById('feedback-modal');
  feedbackModal.style.display = 'block';
  feedbackModal.setAttribute('aria-hidden', 'false');
});

// Feedback Submission Logic
document.getElementById('submit-feedback-button').addEventListener('click', submitFeedback);
function submitFeedback() {
  const feedback = document.getElementById('feedback-input').value.trim();
  if (feedback) {
    if (userId) {
      database.ref('feedback').push({
        player: playerName,
        feedback: feedback,
        submittedAt: firebase.database.ServerValue.TIMESTAMP,
      }).then(() => {
        alert('Thank you for your feedback!');
        document.getElementById('feedback-modal').style.display = 'none';
        document.getElementById('feedback-modal').setAttribute('aria-hidden', 'true');
      }).catch(err => {
        console.error('Error submitting feedback:', err);
        alert('There was an issue submitting your feedback. Please try again.');
      });
    } else {
      alert('Please sign in to submit feedback.');
    }
  } else {
    alert('Please enter your feedback.');
  }
}

// Sign Up/Login Modal Logic
const authModalElement = document.getElementById('auth-modal');
const emailAuthModalElement = document.getElementById('email-auth-modal');

// Open Authentication Modal on Page Load if Not Authenticated
auth.onAuthStateChanged((user) => {
  if (user) {
    userId = user.uid;
    playerName = user.displayName || user.email;
    localStorage.setItem('playerName', playerName);
    authModalElement.style.display = 'none';
    emailAuthModalElement.style.display = 'none';
    displayStatistics();
    updateUserDisplay();
  } else {
    authModalElement.style.display = 'block';
    authModalElement.setAttribute('aria-hidden', 'false');
    updateUserDisplay();
  }
});

// Email Sign-In Button
document.getElementById('email-signin-button').addEventListener('click', () => {
  authModalElement.style.display = 'none';
  authModalElement.setAttribute('aria-hidden', 'true');
  emailAuthModalElement.style.display = 'block';
  emailAuthModalElement.setAttribute('aria-hidden', 'false');
});

// Email Sign-In Submit
document.getElementById('email-signin-submit-button').addEventListener('click', () => {
  const email = document.getElementById('user-email').value.trim();
  const password = document.getElementById('user-password').value.trim();
  if (email && password) {
    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        // Success: Close the email auth modal
        emailAuthModalElement.style.display = 'none';
        emailAuthModalElement.setAttribute('aria-hidden', 'true');
        authModalElement.style.display = 'none';
        authModalElement.setAttribute('aria-hidden', 'true');
      })
      .catch(error => {
        console.error('Email Sign-In Error:', error);
        alert('Error signing in. Please check your credentials.');
      });
  } else {
    alert('Please enter both email and password.');
  }
});

// Email Sign-Up Button
document.getElementById('email-signup-button').addEventListener('click', () => {
  const email = document.getElementById('user-email').value.trim();
  const password = document.getElementById('user-password').value.trim();
  if (email && password) {
    auth.createUserWithEmailAndPassword(email, password)
      .then(() => {
        // Success: Close the email auth modal
        emailAuthModalElement.style.display = 'none';
        emailAuthModalElement.setAttribute('aria-hidden', 'true');
        authModalElement.style.display = 'none';
        authModalElement.setAttribute('aria-hidden', 'true');
      })
      .catch(error => {
        console.error('Email Sign-Up Error:', error);
        alert('Error signing up. Please try a different email.');
      });
  } else {
    alert('Please enter both email and password.');
  }
});

// Logout functionality
document.getElementById('logout-button').addEventListener('click', () => {
  auth.signOut().then(() => {
    console.log('User signed out');
    userId = null;
    playerName = '';
    localStorage.removeItem('playerName');
    updateUserDisplay();
    // Optionally, redirect to home page or refresh the game
    startGame('daily');
  }).catch((error) => {
    console.error('Error signing out:', error);
  });
});

// Function to update user display
function updateUserDisplay() {
  const userDisplay = document.getElementById('user-display');
  const loginButton = document.getElementById('login-button');
  const logoutButton = document.getElementById('logout-button');

  if (userId) {
    userDisplay.textContent = 'Logged in as: ' + playerName;
    logoutButton.style.display = 'inline-block';
    loginButton.style.display = 'none';
  } else {
    userDisplay.textContent = 'Not logged in';
    logoutButton.style.display = 'none';
    loginButton.style.display = 'inline-block';
  }
}

// Profile Modal Trigger (Assuming there's a button to open profile)
document.getElementById('profile-button')?.addEventListener('click', displayProfile);

// Handle Physical Keyboard Input
document.addEventListener('keydown', (event) => {
  // Check if modals are open and skip if any modal is open
  const modals = document.querySelectorAll('.modal');
  let isAnyModalOpen = false;

  modals.forEach((modal) => {
    if (modal.style.display === 'block') {
      isAnyModalOpen = true;
    }
  });

  if (isAnyModalOpen) return;

  const key = event.key;

  // Only allow a single character or Backspace/Enter
  if (key === 'Backspace' || key === 'Enter' || /^[a-zA-Z]$/.test(key)) {
    handleKeyPress(key.toLowerCase());
  }
});

// Function to sanitize HTML to prevent XSS
function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

// Ensure that the winning modal can be closed
document.getElementById('close-winning-modal').addEventListener('click', () => {
  const winningModal = document.getElementById('winning-modal');
  winningModal.style.display = 'none';
  winningModal.setAttribute('aria-hidden', 'true');
});

// Ensure that the name modal can be closed
document.getElementById('name-modal-close').addEventListener('click', () => {
  const nameModal = document.getElementById('name-modal');
  nameModal.style.display = 'none';
  nameModal.setAttribute('aria-hidden', 'true');
});

// Feedback Modal Close Event Listener
document.getElementById('feedback-modal-close').addEventListener('click', () => {
  const feedbackModal = document.getElementById('feedback-modal');
  feedbackModal.style.display = 'none';
  feedbackModal.setAttribute('aria-hidden', 'true');
});

// Authentication Modal Close Event Listener
document.getElementById('auth-modal-close').addEventListener('click', () => {
  const authModal = document.getElementById('auth-modal');
  authModal.style.display = 'none';
  authModal.setAttribute('aria-hidden', 'true');
});

// Email Auth Modal Close Event Listener
document.getElementById('email-auth-modal-close').addEventListener('click', () => {
  const emailAuthModal = document.getElementById('email-auth-modal');
  emailAuthModal.style.display = 'none';
  emailAuthModal.setAttribute('aria-hidden', 'true');
});

// Achievements Modal Close Event Listener
document.getElementById('achievements-modal-close').addEventListener('click', () => {
  const achievementsModal = document.getElementById('achievements-modal');
  achievementsModal.style.display = 'none';
  achievementsModal.setAttribute('aria-hidden', 'true');
});

// Profile Modal Close Event Listener
document.getElementById('profile-close-button').addEventListener('click', () => {
  const profileModal = document.getElementById('profile-modal');
  profileModal.style.display = 'none';
  profileModal.setAttribute('aria-hidden', 'true');
});

// Profile Modal Trigger (Assuming there's a button to open profile)
document.getElementById('profile-button')?.addEventListener('click', displayProfile);

// Function to open specific leaderboard tab
function openLeaderboardTab(tabName) {
  const tabcontents = document.getElementsByClassName('tabcontent');
  for (let i = 0; i < tabcontents.length; i++) {
    tabcontents[i].style.display = 'none';
  }

  const tablinks = document.getElementsByClassName('tablink');
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove('active');
  }

  document.getElementById(tabName).style.display = 'block';
  event.currentTarget.classList.add('active');
}

// Ensure that the winning modal can be closed
document.getElementById('close-winning-modal').addEventListener('click', () => {
  const winningModal = document.getElementById('winning-modal');
  winningModal.style.display = 'none';
  winningModal.setAttribute('aria-hidden', 'true');
});

// Ensure modals like feedback, profile, and leaderboard can be opened and closed
document.getElementById('feedback-button').addEventListener('click', () => {
  const feedbackModal = document.getElementById('feedback-modal');
  feedbackModal.style.display = 'block';
  feedbackModal.setAttribute('aria-hidden', 'false');
});

// Initialize the game
window.addEventListener('load', () => {
  console.log('Page loaded, initializing game');
  startGame('daily');
});
