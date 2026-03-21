// ========================
// WORD ECHO - FULL SCRIPT (English)
// ========================

let currentRound = 0;
let score = 0;
let currentWord = null;
let isRecording = false;
let hasPlayed = false;
let difficulty = 'easy';
let recognitionActive = false;
var analyzer = null;
let roundStartTime = null;
let roundTimes = [];

// English word list with images
const words = [
    { src: "https://tse1.mm.bing.net/th/id/OIP.z589HEF6wuRZZR-B9C49RQHaFK?rs=1&pid=ImgDetMain&o=7&rm=3", name: "sun", difficulty: 'easy' },
    { src: "https://img.freepik.com/vector-premium/icono-luna-lindo-estilo-dibujos-animados_74102-7166.jpg?w=2000", name: "moon", difficulty: 'easy' },
    { src: "https://img.freepik.com/vector-premium/estrella-dibujada-mano-plana-elegante-mascota-personaje-dibujos-animados-dibujo-pegatina-icono-concepto-aislado_730620-302755.jpg", name: "star", difficulty: 'easy' },
    { src: "https://static.vecteezy.com/system/resources/previews/024/190/108/non_2x/cute-cartoon-cloud-kawaii-weather-illustrations-for-kids-free-png.png", name: "cloud", difficulty: 'easy' },
    { src: "https://img.freepik.com/fotos-premium/estilo-ilustracion-vectorial-lluvia-dibujos-animados_750724-13162.jpg", name: "rain", difficulty: 'easy' },
    { src: "https://img.freepik.com/vector-premium/ilustracion-vectorial-dibujos-animados-dinosaurio-lindo_104589-158.jpg", name: "dinosaur", difficulty: 'hard' },
    { src: "https://img.freepik.com/vector-premium/dibujos-animados-mariposa-linda-aislado-blanco_29190-4712.jpg", name: "butterfly", difficulty: 'hard' },
    { src: "https://img.freepik.com/vector-premium/computadora-portatil-dibujos-animados-aislada-blanco_29190-4354.jpg", name: "computer", difficulty: 'hard' },
    { src: "https://static.vecteezy.com/system/resources/previews/008/132/083/non_2x/green-tree-cartoon-isolated-on-white-background-illustration-of-green-tree-cartoon-free-vector.jpg", name: "tree", difficulty: 'medium' },
];

const totalRounds = 5;
let recognition;

// ========================
// INITIALIZATION
// ========================

document.addEventListener('DOMContentLoaded', function () {
    setupSpeechRecognition();
    setupEventListeners();
    initializeAnalyzer();
    startNewRound();
});

function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = function () { recognitionActive = true; };

        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript.toLowerCase().trim();
            analyzePronounciation(transcript);
        };

        recognition.onerror = function (event) {
            if (event.error === 'network') {
                showFeedback('Network error. Make sure you are using Chrome/Edge with internet.', false);
            } else if (event.error === 'not-allowed') {
                showFeedback('Microphone permission denied. Please allow microphone access.', false);
            }
            stopRecording();
            isRecording = false;
            const recordButton = document.getElementById('record-button');
            recordButton.innerHTML = '<i class="fas fa-microphone"></i> Try again';
        };

        recognition.onend = function () { recognitionActive = false; };
    } else {
        alert('Your browser does not support voice recognition. Please use Chrome, Edge or Safari.');
    }
}

function initializeAnalyzer() {
    if (typeof PronunciationAnalyzer !== 'undefined') {
        if (!analyzer) analyzer = new PronunciationAnalyzer();
    }
}

function setupEventListeners() {
    const playButton = document.getElementById('play-button');
    const recordButton = document.getElementById('record-button');
    if (playButton) playButton.addEventListener('click', playWord);
    if (recordButton) recordButton.addEventListener('click', toggleRecording);
}

// ========================
// NEW ROUND
// ========================

function startNewRound() {
    if (analyzer) analyzer.userHistory.failedPhonemes = [];

    let filteredWords = words.filter(w => w.difficulty === difficulty);
    if (filteredWords.length === 0) filteredWords = words.filter(w => w.difficulty === 'easy');

    currentWord = filteredWords[Math.floor(Math.random() * filteredWords.length)];
    hasPlayed = false;
    isRecording = false;
    roundStartTime = Date.now();
    updateUI();
    setTimeout(playWord, 1000);
}

// ========================
// UPDATE UI
// ========================

function updateUI() {
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('total-rounds').textContent = totalRounds;
    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';

    const progress = ((currentRound + 1) / totalRounds) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';

    document.getElementById('current-image').src = currentWord.src;

    const badgeElement = document.getElementById('difficulty-badge');
    let diffText = 'Normal';
    if (difficulty === 'easy') diffText = 'Easy';
    else if (difficulty === 'hard') diffText = 'Hard';
    badgeElement.textContent = 'Difficulty: ' + diffText;
    badgeElement.className = 'difficulty-badge ' + difficulty;

    document.getElementById('similarity-meter').style.display = 'none';
    document.getElementById('similarity-fill').style.width = '0%';
    document.getElementById('similarity-text').textContent = '0%';
    document.getElementById('similarity-fill').className = 'similarity-fill';

    const recordButton = document.getElementById('record-button');
    recordButton.innerHTML = '<i class="fas fa-microphone"></i> Record my voice';
    recordButton.className = 'audio-button red';

    document.getElementById('feedback').classList.remove('show');
    document.getElementById('recorded-text').classList.remove('show');
}

// ========================
// PLAY WORD
// ========================

function playWord() {
    if (!currentWord) return;
    const playButton = document.getElementById('play-button');
    playButton.innerHTML = '<i class="fas fa-volume-up"></i> Playing...';
    playButton.disabled = true;

    const utterance = new SpeechSynthesisUtterance(currentWord.name);
    utterance.lang = 'en-US';
    utterance.rate = difficulty === 'hard' ? 0.7 : 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = function () {
        playButton.innerHTML = '<i class="fas fa-volume-up"></i> Listen to word';
        playButton.disabled = false;
        hasPlayed = true;
    };

    utterance.onerror = function () {
        playButton.innerHTML = '<i class="fas fa-volume-up"></i> Listen to word';
        playButton.disabled = false;
        hasPlayed = true;
    };

    speechSynthesis.speak(utterance);
}

// ========================
// RECORD VOICE
// ========================

function toggleRecording() {
    if (!hasPlayed) {
        showFeedback('Listen to the word first', false);
        return;
    }
    const recordButton = document.getElementById('record-button');
    if (!isRecording) {
        isRecording = true;
        recordButton.innerHTML = '<i class="fas fa-stop"></i> Stop recording';
        recordButton.className = 'audio-button red recording';
        if (recognition) recognition.start();
        else { showFeedback('Voice recognition not available', false); stopRecording(); }
    } else {
        stopRecording();
    }
}

function stopRecording() {
    isRecording = false;
    const recordButton = document.getElementById('record-button');
    recordButton.innerHTML = '<i class="fas fa-microphone"></i> Analyzing...';
    recordButton.className = 'audio-button red';
    if (recognition) recognition.stop();
}

// ========================
// ANALYZE PRONUNCIATION
// ========================

function analyzePronounciation(transcript) {
    if (!analyzer) analyzer = new PronunciationAnalyzer();

    const result = analyzer.analyze(currentWord.name, transcript);
    const similarity = result.score;

    const recordedTextElement = document.getElementById('recorded-text');
    document.getElementById('recorded-text-content').textContent = '"' + transcript + '"';
    recordedTextElement.classList.add('show');

    document.getElementById('similarity-meter').style.display = 'block';
    document.getElementById('similarity-fill').style.width = similarity + '%';
    document.getElementById('similarity-text').textContent = similarity + '%';

    const fillElement = document.getElementById('similarity-fill');
    fillElement.className = 'similarity-fill';
    if (similarity >= 70) fillElement.classList.add('success');
    else if (similarity >= 50) fillElement.classList.add('warning');
    else fillElement.classList.add('error');

    const isCorrect = similarity >= 70;
    const pointsEarned = Math.floor(similarity / 10);

    if (isCorrect) {
        score += pointsEarned;
        showFeedback(result.feedback.emoji + ' ' + result.feedback.messages[0], true);
        if (similarity >= 95 && difficulty === 'medium') difficulty = 'hard';
        else if (similarity >= 90 && difficulty === 'easy') difficulty = 'medium';
    } else {
        showFeedback(result.feedback.emoji + ' ' + result.feedback.messages[0], false);
        if (similarity < 50 && difficulty !== 'easy') difficulty = 'easy';
    }

    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';

    const responseTime = Date.now() - roundStartTime;
    roundTimes.push(responseTime);

    setTimeout(function () {
        if (currentRound + 1 >= totalRounds) {
            completeGame();
        } else {
            currentRound++;
            startNewRound();
        }
    }, 2500);
}

// ========================
// SHOW FEEDBACK
// ========================

function showFeedback(message, isCorrect) {
    const feedbackElement = document.getElementById('feedback');
    const feedbackText = document.getElementById('feedback-text');
    feedbackText.textContent = message;
    feedbackElement.className = isCorrect ? 'feedback correct show' : 'feedback incorrect show';
}

// ========================
// COMPLETE GAME
// ========================

async function completeGame() {
    const audioCard = document.getElementById('audio-card');
    const totalTime = roundTimes.reduce((acc, t) => acc + t, 0);
    const averageResponseTime = Math.round(totalTime / Math.max(1, roundTimes.length));

    let reporteExtra = '';
    if (analyzer) {
        const report = analyzer.getProgressReport();
        if (report.weakPhonemes.length > 0) {
            reporteExtra = '<p style="color: #6B7280; font-size: 14px; margin-top: 15px;">Sounds to practice: ' + report.weakPhonemes.join(', ') + '</p>';
        }
    }

    let html = '<div class="game-completed">';
    html += '<h2 style="margin-bottom: 20px; color: #0066CC;">Game Complete!</h2>';
    html += '<div class="final-score">';
    html += '<h2>Your final score:</h2>';
    html += '<div class="score-number">' + score + '</div>';
    html += '<p>points</p>';
    html += '</div>';
    html += reporteExtra;
    html += '<div class="options-container">';
    html += '<button class="option-button primary" onclick="location.reload()"><i class="fas fa-redo"></i> Play Again</button>';
    html += '<button class="option-button blue" onclick="goToMainPage()"><i class="fas fa-arrow-left"></i> Back</button>';
    html += '</div></div>';

    audioCard.innerHTML = html;
}

function goToMainPage() {
    window.location.href = '../../../';
}
