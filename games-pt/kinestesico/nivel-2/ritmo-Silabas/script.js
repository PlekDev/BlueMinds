// Variáveis globais
let currentRound = 0;
let score = 0;
let currentWord = null;
let syllables = [];
let isPlaying = false;
let difficulty = 1; // 1-3
let tapCount = 0;
let expectedTaps = 0;
let rhythmAnalysis = {
    rhythm: 0,
    motorPrecision: 0,
    syllableRepetition: 0
};

const words = [
    { word: "gato", syllables: ["GA", "TO"], difficulty: 1 },
    { word: "cachorro", syllables: ["CA", "CHOR", "RO"], difficulty: 1 },
    { word: "borboleta", syllables: ["BOR", "BO", "LE", "TA"], difficulty: 2 },
    { word: "elefante", syllables: ["E", "LE", "FAN", "TE"], difficulty: 2 },
    { word: "computador", syllables: ["COM", "PU", "TA", "DOR"], difficulty: 3 },
    { word: "bicicleta", syllables: ["BI", "CI", "CLE", "TA"], difficulty: 2 },
];

const totalRounds = 5;
let syllableTimeout = null;
let currentSyllableIndex = 0;

// ================== INICIALIZAÇÃO ==================
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    startNewRound();
});

function setupEventListeners() {
    document.getElementById('start-button').addEventListener('click', startRhythmActivity);
    document.getElementById('listen-button').addEventListener('click', startSpeechRecognition);
    document.getElementById('tapArea').addEventListener('click', onTap);
}

// ================== RODADAS ==================
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
        <h2>Atividade Concluída! 🎉</h2>
        <div class="syllable-stage" style="display: flex; align-items: center; justify-content: center; min-height: 200px;">
            <div style="font-size: 80px; animation: bounce 1s ease-in-out infinite;">🌟</div>
        </div>
        <div class="feedback correct">
            <p style="font-size: 28px; margin: 20px 0;">Sua pontuação final: ${score} pontos</p>
            <p style="font-size: 16px;">Excelente consciência fonológica e ritmo motor!</p>
        </div>
        <div class="action-controls">
            <button class="action-button primary" onclick="location.reload()">
                <i class="fas fa-redo"></i> Jogar Novamente
            </button>
            <button class="action-button primary" onclick="goToMainPage()">
                <i class="fas fa-home"></i> Voltar ao Menu
            </button>
        </div>
    `;
}

// ================== INTERFACE ==================
function updateUI() {
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('total-rounds').textContent = totalRounds;
    document.getElementById('score').textContent = score + ' pontos';
    document.getElementById('score-display').textContent = score + ' pontos';

    const progress = ((currentRound + 1) / totalRounds) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';

    updateSpeedIndicator();
    displaySyllables();

    const startButton = document.getElementById('start-button');
    startButton.innerHTML = '<i class="fas fa-play"></i> Ouvir Palavra';
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
    const speeds = [document.getElementById('speed1'), document.getElementById('speed2'), document.getElementById('speed3')];
    speeds.forEach((speed, index) => {
        if (index < difficulty) {
            speed.classList.add('active');
        } else {
            speed.classList.remove('active');
        }
    });
}

function displaySyllables() {
    const container = document.getElementById('syllables-container');
    container.innerHTML = '';

    syllables.forEach((syllable, index) => {
        const syllableElement = document.createElement('div');
        syllableElement.className = 'syllable';
        syllableElement.textContent = syllable;
        syllableElement.id = `syllable-${index}`;
        container.appendChild(syllableElement);
    });
}

// ================== ATIVIDADE PRINCIPAL ==================
async function startRhythmActivity() {
    if (isPlaying) return;

    isPlaying = true;
    const startButton = document.getElementById('start-button');
    startButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Reproduzindo...';
    startButton.disabled = true;

    document.getElementById('audioAnalysis').style.display = 'block';

    await playSyllablesWithRhythm();

    const tapArea = document.getElementById('tapArea');
    tapArea.classList.add('active');

    startButton.innerHTML = '<i class="fas fa-redo"></i> Repetir';
    startButton.disabled = false;
}

async function playSyllablesWithRhythm() {
    const speedMultiplier = difficulty === 1 ? 1 : (difficulty === 2 ? 0.85 : 0.7);
    const timeBetweenSyllables = 800 * speedMultiplier;

    for (let i = 0; i < syllables.length; i++) {
        currentSyllableIndex = i;
        await highlightSyllable(i, timeBetweenSyllables);

        const syllableText = syllables[i];
        speakSyllable(syllableText);

        await new Promise(resolve => setTimeout(resolve, timeBetweenSyllables));
    }

    currentSyllableIndex = 0;

    setTimeout(() => {
        document.getElementById('speechSection').style.display = 'block';
    }, 500);
}

function highlightSyllable(index, duration) {
    return new Promise(resolve => {
        const syllableElement = document.getElementById(`syllable-${index}`);

        syllableElement.classList.add('pulse', 'active');

        setTimeout(() => {
            syllableElement.classList.remove('pulse', 'active');
            resolve();
        }, duration * 0.8);
    });
}

function speakSyllable(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1.1;
    utterance.volume = 1;
    speechSynthesis.speak(utterance);
}

// ================== DETECÇÃO DE TOQUE ==================
function onTap() {
    if (!isPlaying) return;

    tapCount++;

    const tapFeedback = document.getElementById('tapFeedback');
    tapFeedback.textContent = '👏';
    tapFeedback.classList.add('tap-detected');

    setTimeout(() => {
        tapFeedback.classList.remove('tap-detected');
    }, 500);

    updateRhythmMetrics();

    if (tapCount === expectedTaps) {
        showFeedback('Excelente ritmo! 🎉', true);
        setTimeout(() => {
            document.getElementById('audioAnalysis').style.display = 'none';
            document.getElementById('speechSection').style.display = 'block';
        }, 1000);
    } else if (tapCount > expectedTaps) {
        showFeedback('Cliques demais, tente novamente', false);
        resetTapArea();
    }
}

function resetTapArea() {
    const tapArea = document.getElementById('tapArea');
    tapArea.classList.remove('active');
    tapCount = 0;
    document.getElementById('tapFeedback').textContent = '';
}

// ================== ANÁLISE DE RITMO ==================
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
        text.textContent = '💡 Reduza a velocidade: da próxima vez os cliques serão mais lentos...';
    } else if (rhythmAnalysis.motorPrecision < 60) {
        notice.classList.remove('hidden');
        text.textContent = '🎵 Adicionando pistas visuais mais claras...';
    } else if (difficulty < 3 && rhythmAnalysis.syllableRepetition > 85) {
        notice.classList.remove('hidden');
        text.textContent = '⭐ Vamos aumentar a dificuldade!';
    } else {
        notice.classList.add('hidden');
    }
}

function resetRhythmAnalysis() {
    rhythmAnalysis = {
        rhythm: 0,
        motorPrecision: 0,
        syllableRepetition: 0
    };
}

function showFeedback(message, isCorrect) {
    const feedbackElement = document.getElementById('feedback');
    const feedbackText = document.getElementById('feedback-text');

    feedbackText.textContent = message;
    feedbackElement.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
    feedbackElement.classList.remove('hidden');
}

// ================== RECONHECIMENTO DE FALA ==================
async function startSpeechRecognition() {
    const listenButton = document.getElementById('listen-button');
    listenButton.disabled = true;
    listenButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ouvindo...';

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        showSpeechFeedback('Seu navegador não suporta reconhecimento de voz', false);
        listenButton.disabled = false;
        listenButton.innerHTML = '<i class="fas fa-microphone"></i> Ouvir';
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        const targetWord = currentWord.word.toLowerCase();

        const isSimilar = transcript.includes(targetWord) || targetWord.includes(transcript);

        if (isSimilar) {
            score += (20 * difficulty);
            showSpeechFeedback('Excelente! 🎉 Você repetiu corretamente', true);
        } else {
            showSpeechFeedback(`Ouvimos: "${transcript}". Tente novamente`, false);
        }

        document.getElementById('score').textContent = score + ' pontos';
        document.getElementById('score-display').textContent = score + ' pontos';

        listenButton.disabled = false;
        listenButton.innerHTML = '<i class="fas fa-microphone"></i> Ouvir';
    };

    recognition.onerror = (event) => {
        showSpeechFeedback('Erro no reconhecimento de voz', false);
        listenButton.disabled = false;
        listenButton.innerHTML = '<i class="fas fa-microphone"></i> Ouvir';
    };

    recognition.start();

    setTimeout(() => {
        if (listenButton.disabled) {
            recognition.stop();
        }
    }, 5000);
}

function showSpeechFeedback(message, isCorrect) {
    const feedback = document.getElementById('speech-feedback');
    const feedbackText = document.getElementById('speech-text');

    feedbackText.textContent = message;
    feedback.className = isCorrect ? 'speech-feedback correct' : 'speech-feedback incorrect';
    feedback.classList.remove('hidden');

    if (isCorrect) {
        setTimeout(() => {
            if (currentRound + 1 >= totalRounds) {
                completeGame();
            } else {
                currentRound++;
                startNewRound();
            }
        }, 2000);
    }
}

// ================== NAVEGAÇÃO ==================
function goToMainPage() {
    window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-kinestesico.html';
}