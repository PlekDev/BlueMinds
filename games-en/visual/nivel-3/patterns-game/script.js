// Global variables
let currentRound = 0;
let score = 0;
let currentPatternData = null;
let correctAnswer = "";
let showFeedback = false;

const totalRounds = 5;

// MANUALLY DEFINED PATTERNS WITH EMOJIS
const patternsDatabase = [
    {
        name: "alternating_squares_red_blue",
        display: ["🟥", "🟦", "🟥", "🟦", "🟥", "?"],
        correct: "🟦",
        options: ["🟥", "🟦", "🟩"]
    },
    {
        name: "alternating_squares_green_yellow",
        display: ["🟩", "🟨", "🟩", "🟨", "🟩", "?"],
        correct: "🟨",
        options: ["🟩", "🟨", "🟪"]
    },
    {
        name: "three_part_red_blue_green",
        display: ["🟥", "🟦", "🟩", "🟥", "🟦", "?"],
        correct: "🟩",
        options: ["🟥", "🟦", "🟩"]
    },
    {
        name: "double_red_blue",
        display: ["🟥", "🟥", "🟦", "🟦", "🟥", "?"],
        correct: "🟥",
        options: ["🟥", "🟦", "🟨"]
    },
    {
        name: "alternating_purple_black",
        display: ["🟪", "⬛", "🟪", "⬛", "🟪", "?"],
        correct: "⬛",
        options: ["🟪", "⬛", "⬜"]
    },
    {
        name: "three_part_yellow_purple_black",
        display: ["🟨", "🟪", "⬛", "🟨", "🟪", "?"],
        correct: "⬛",
        options: ["🟨", "🟪", "⬛"]
    },
    {
        name: "double_green_yellow",
        display: ["🟩", "🟩", "🟨", "🟨", "🟩", "?"],
        correct: "🟩",
        options: ["🟩", "🟨", "🟦"]
    },
    {
        name: "alternating_blue_green",
        display: ["🟦", "🟩", "🟦", "🟩", "🟦", "?"],
        correct: "🟩",
        options: ["🟦", "🟩", "🟥"]
    },
    {
        name: "three_part_white_black_red",
        display: ["⬜", "⬛", "🟥", "⬜", "⬛", "?"],
        correct: "🟥",
        options: ["⬜", "⬛", "🟥"]
    },
    {
        name: "double_purple_white",
        display: ["🟪", "🟪", "⬜", "⬜", "🟪", "?"],
        correct: "🟪",
        options: ["🟪", "⬜", "🟦"]
    }
];

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    startNewRound();
});

// Start a new round
function startNewRound() {
    const randomPattern = patternsDatabase[Math.floor(Math.random() * patternsDatabase.length)];
    currentPatternData = randomPattern;
    correctAnswer = randomPattern.correct;
    showFeedback = false;
    
    updateUI();
    
    audioManager.speak(`Round ${currentRound + 1}. What's missing in the pattern? Observe the sequence and choose the correct option`, 1);
}

// Update the user interface
function updateUI() {
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('total-rounds').textContent = totalRounds;
    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';
    
    const progress = ((currentRound + 1) / totalRounds) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
    
    const patternDisplay = document.getElementById('pattern-display');
    patternDisplay.innerHTML = '';
    
    currentPatternData.display.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'pattern-item';
        if (item === "?") {
            div.classList.add('missing');
            div.innerHTML = '<span class="question-mark">?</span>';
        } else {
            div.textContent = item;
        }
        patternDisplay.appendChild(div);
    });
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    const shuffledOptions = [...currentPatternData.options].sort(() => Math.random() - 0.5);
    
    shuffledOptions.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.onclick = () => handleAnswer(option, button);
        optionsContainer.appendChild(button);
    });
    
    document.getElementById('feedback').classList.add('hidden');
}

// Handle user answer
function handleAnswer(selected, buttonElement) {
    if (showFeedback) return;
    
    const isCorrect = selected === correctAnswer;
    const feedbackElement = document.getElementById('feedback');
    const feedbackText = document.getElementById('feedback-text');
    
    const allButtons = document.querySelectorAll('.option-button');
    allButtons.forEach(btn => btn.disabled = true);
    
    if (isCorrect) {
        score += 20;
        feedbackText.textContent = "Correct! ✅";
        feedbackElement.className = 'feedback correct';
        audioManager.speak('Correct. You identified the pattern correctly', 0.95);
        
        buttonElement.classList.add('answer-correct');
        playSuccessSound();
    } else {
        feedbackText.innerHTML = `Incorrect ❌<br>The correct answer was: <strong>${correctAnswer}</strong>`;
        feedbackElement.className = 'feedback incorrect';
        audioManager.speak(`Incorrect. The correct answer was ${correctAnswer}`, 0.95);
        
        allButtons.forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('answer-correct');
            } else {
                btn.classList.add('answer-incorrect');
            }
        });
    }
    
    feedbackElement.classList.remove('hidden');
    showFeedback = true;
    
    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';
    
    setTimeout(() => {
        if (currentRound + 1 >= totalRounds) {
            completeGame();
        } else {
            currentRound++;
            startNewRound();
        }
    }, 2500);
}

// Play success sound
function playSuccessSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523, 659, 784]; // C, E, G
    
    notes.forEach((freq, idx) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime + idx * 0.1);
        oscillator.stop(audioContext.currentTime + idx * 0.1 + 0.2);
    });
}

// Complete the game
function completeGame() {
    const patternCard = document.querySelector('.pattern-card');
    const accuracy = ((score / (totalRounds * 20)) * 100).toFixed(0);
    
    let message = 'Excellent! 🏆';
    let audioMessage = 'Excellent';
    
    if (accuracy < 60) {
        message = 'Keep practicing! 💪';
        audioMessage = 'Keep practicing';
    } else if (accuracy < 80) {
        message = 'Great work! 🌟';
        audioMessage = 'Great work';
    }
    
    audioManager.speak(`Game completed. Score: ${score} points. Accuracy: ${accuracy} percent. ${audioMessage}`, 0.95);
    
    patternCard.innerHTML = `
        <h2>Game Completed!</h2>
        <div class="completion-emoji">🎉</div>
        <div class="completion-score">
            <p>Your final score: <strong>${score} points</strong></p>
            <p>Accuracy: <strong>${accuracy}%</strong></p>
            <p style="font-size: 20px; margin-top: 10px;">${message}</p>
        </div>
        <div class="options-container">
            <button class="option-button" onclick="location.reload()">
                Play Again
            </button>
            <button class="option-button" onclick="goToMainPage()">
                Back to Menu
            </button>
        </div>
    `;
}

// Go back to main page
function goToMainPage() {
    window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-visual.html';
}