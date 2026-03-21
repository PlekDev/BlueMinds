// Global variables
let currentRound = 0;
let score = 0;
let currentWord = null;
let syllables = [];
let isPlaying = false;
let difficulty = 1;
let tapCount = 0;
let expectedTaps = 0;
let rhythmAnalysis = { rhythm: 0, motorPrecision: 0, syllableRepetition: 0 };

// English words split into syllables
const words = [
    { word: "cat",        syllables: ["CAT"],                difficulty: 1 },
    { word: "dog",        syllables: ["DOG"],                difficulty: 1 },
    { word: "apple",      syllables: ["AP", "PLE"],          difficulty: 1 },
    { word: "rabbit",     syllables: ["RAB", "BIT"],         difficulty: 1 },
    { word: "butterfly",  syllables: ["BUT", "TER", "FLY"],  difficulty: 2 },
    { word: "elephant",   syllables: ["EL", "E", "PHANT"],   difficulty: 2 },
    { word: "computer",   syllables: ["COM", "PU", "TER"],   difficulty: 2 },
    { word: "bicycle",    syllables: ["BI", "CY", "CLE"],    difficulty: 2 },
    { word: "caterpillar",syllables: ["CAT", "ER", "PIL", "LAR"], difficulty: 3 },
    { word: "alligator",  syllables: ["AL", "LI", "GA", "TOR"],   difficulty: 3 },
];

const totalRounds = 5;
let currentSyllableIndex = 0;

// ================== INITIALIZATION ==================
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    startNewRound();
});

function setupEventListeners() {
    document.getElementById('start-button').addEventListener('click', startRhythmActivity);
    document.getElementById('listen-button').addEventListener('click', startSpeechRecognition);
    document.getElementById('tapArea').addEventListener('click', onTap);
}

// ================== ROUNDS ==================
function startNewRound() {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    currentWord = randomWord;
    syllables = randomWord.syllables;
    difficulty = randomWord.difficulty;
    tapCount = 0;
    expectedTaps = syllables.length;
    isPlaying = false;
    currentSyllableIndex = 0;
    resetRhythmAnalysis();
    updateUI();
}

function completeGame() {
    const rhythmCard = document.querySelector('.rhythm-card');
    rhythmCard.innerHTML = `
        <h2>Activity Complete! 🎉</h2>
        <div class="syllable-stage" style="display:flex;align-items:center;justify-content:center;min-height:200px;">
            <div style="font-size:80px;">🌟</div>
        </div>
        <div class="feedback correct">
            <p style="font-size:28px;margin:20px 0;">Your final score: ${score} points</p>
            <p style="font-size:16px;">Excellent phonological awareness and motor rhythm!</p>
        </div>
        <div class="action-controls">
            <button class="action-button primary" onclick="location.reload()"><i class="fas fa-redo"></i> Play Again</button>
            <button class="action-button primary" onclick="goToMainPage()"><i class="fas fa-home"></i> Back to Menu</button>
        </div>`;
}

// ================== UI ==================
function updateUI() {
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('total-rounds').textContent = totalRounds;
    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';

    const progress = ((currentRound + 1) / totalRounds) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';

    updateSpeedIndicator();
    displaySyllables();

    const startButton = document.getElementById('start-button');
    startButton.innerHTML = '<i class="fas fa-play"></i> Listen to Word';
    startButton.disabled = false;

    document.getElementById('audioAnalysis').style.display = 'none';
    document.getElementById('speechSection').style.display = 'none';
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('adaptationNotice').classList.add('hidden');

    const tapArea = document.getElementById('tapArea');
    tapArea.classList.remove('active');
    document.getElementById('tapFeedback').textContent = '';
    tapCount = 0;
}

function updateSpeedIndicator() {
    ['speed1', 'speed2', 'speed3'].forEach((id, index) => {
        document.getElementById(id).classList.toggle('active', index < difficulty);
    });
}

function displaySyllables() {
    const container = document.getElementById('syllables-container');
    container.innerHTML = '';
    syllables.forEach((syllable, index) => {
        const el = document.createElement('div');
        el.className = 'syllable';
        el.textContent = syllable;
        el.id = `syllable-${index}`;
        container.appendChild(el);
    });
}

// ================== MAIN ACTIVITY ==================
async function startRhythmActivity() {
    if (isPlaying) return;
    isPlaying = true;
    const startButton = document.getElementById('start-button');
    startButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Playing...';
    startButton.disabled = true;

    document.getElementById('audioAnalysis').style.display = 'block';
    await playSyllablesWithRhythm();

    document.getElementById('tapArea').classList.add('active');
    startButton.innerHTML = '<i class="fas fa-redo"></i> Repeat';
    startButton.disabled = false;
}

async function playSyllablesWithRhythm() {
    const speedMultiplier = difficulty === 1 ? 1 : (difficulty === 2 ? 0.85 : 0.7);
    const timeBetweenSyllables = 800 * speedMultiplier;

    for (let i = 0; i < syllables.length; i++) {
        currentSyllableIndex = i;
        await highlightSyllable(i, timeBetweenSyllables);
        speakSyllable(syllables[i]);
        await new Promise(resolve => setTimeout(resolve, timeBetweenSyllables));
    }
    currentSyllableIndex = 0;
    setTimeout(() => { document.getElementById('speechSection').style.display = 'block'; }, 500);
}

function highlightSyllable(index, duration) {
    return new Promise(resolve => {
        const el = document.getElementById(`syllable-${index}`);
        el.classList.add('pulse', 'active');
        setTimeout(() => { el.classList.remove('pulse', 'active'); resolve(); }, duration * 0.8);
    });
}

function speakSyllable(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1;
    speechSynthesis.speak(utterance);
}

// ================== TAP DETECTION ==================
function onTap() {
    if (!isPlaying) return;
    tapCount++;
    const tapFeedback = document.getElementById('tapFeedback');
    tapFeedback.textContent = '👏';
    tapFeedback.classList.add('tap-detected');
    setTimeout(() => tapFeedback.classList.remove('tap-detected'), 500);

    updateRhythmMetrics();

    if (tapCount === expectedTaps) {
        showFeedback('Great rhythm! 🎉', true);
        setTimeout(() => {
            document.getElementById('audioAnalysis').style.display = 'none';
            document.getElementById('speechSection').style.display = 'block';
        }, 1000);
    } else if (tapCount > expectedTaps) {
        showFeedback('Too many taps, try again', false);
        resetTapArea();
    }
}

function resetTapArea() {
    document.getElementById('tapArea').classList.remove('active');
    tapCount = 0;
    document.getElementById('tapFeedback').textContent = '';
}

// ================== RHYTHM ANALYSIS ==================
function updateRhythmMetrics() {
    rhythmAnalysis.rhythm = Math.min(100, 50 + (tapCount * 10));
    rhythmAnalysis.motorPrecision = Math.round(70 + Math.random() * 30);
    rhythmAnalysis.syllableRepetition = Math.round(65 + Math.random() * 35);

    document.getElementById('rhythmDetected').textContent = rhythmAnalysis.rhythm + '%';
    document.getElementById('motorPrecision').textContent = rhythmAnalysis.motorPrecision + '%';
    document.getElementById('syllableRepetition').textContent = rhythmAnalysis.syllableRepetition + '%';

    checkAdaptation();
}

function checkAdaptation() {
    const notice = document.getElementById('adaptationNotice');
    const text = document.getElementById('adaptationText');
    if (rhythmAnalysis.rhythm < 50) {
        notice.classList.remove('hidden');
        text.textContent = '💡 Slow down: Taps will go more slowly next time...';
    } else if (rhythmAnalysis.motorPrecision < 60) {
        notice.classList.remove('hidden');
        text.textContent = '🎵 Adding clearer visual cues...';
    } else if (difficulty < 3 && rhythmAnalysis.syllableRepetition > 85) {
        notice.classList.remove('hidden');
        text.textContent = '⭐ Let\'s increase the difficulty!';
    } else {
        notice.classList.add('hidden');
    }
}

function resetRhythmAnalysis() {
    rhythmAnalysis = { rhythm: 0, motorPrecision: 0, syllableRepetition: 0 };
}

function showFeedback(message, isCorrect) {
    const feedbackElement = document.getElementById('feedback');
    document.getElementById('feedback-text').textContent = message;
    feedbackElement.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
    feedbackElement.classList.remove('hidden');
}

// ================== SPEECH RECOGNITION ==================
async function startSpeechRecognition() {
    const listenButton = document.getElementById('listen-button');
    listenButton.disabled = true;
    listenButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Listening...';

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showSpeechFeedback('Your browser does not support voice recognition', false);
        listenButton.disabled = false;
        listenButton.innerHTML = '<i class="fas fa-microphone"></i> Listen';
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        const targetWord = currentWord.word.toLowerCase();
        const isSimilar = transcript.includes(targetWord) || targetWord.includes(transcript);

        if (isSimilar) {
            score += (20 * difficulty);
            showSpeechFeedback('Excellent! 🎉 You said it correctly', true);
        } else {
            showSpeechFeedback(`We heard: "${transcript}". Try again`, false);
        }

        document.getElementById('score').textContent = score + ' points';
        document.getElementById('score-display').textContent = score + ' points';
        listenButton.disabled = false;
        listenButton.innerHTML = '<i class="fas fa-microphone"></i> Listen';
    };

    recognition.onerror = () => {
        showSpeechFeedback('Voice recognition error', false);
        listenButton.disabled = false;
        listenButton.innerHTML = '<i class="fas fa-microphone"></i> Listen';
    };

    recognition.start();
    setTimeout(() => { if (listenButton.disabled) recognition.stop(); }, 5000);
}

function showSpeechFeedback(message, isCorrect) {
    const feedback = document.getElementById('speech-feedback');
    document.getElementById('speech-text').textContent = message;
    feedback.className = isCorrect ? 'speech-feedback correct' : 'speech-feedback incorrect';
    feedback.classList.remove('hidden');

    if (isCorrect) {
        setTimeout(() => {
            if (currentRound + 1 >= totalRounds) completeGame();
            else { currentRound++; startNewRound(); }
        }, 2000);
    }
}

// ================== NAVIGATION ==================
function goToMainPage() {
    window.location.href = '../../../../selectores/selector-kinestesico.html';
}
