// Variáveis globais
let currentRound = 0;
let score = 0;
let currentWord = null;
let syllables = [];
let isPlaying = false;
let tapCount = 0;
let expectedTaps = 0;

const words = [
    { word: "casa", syllables: ["CA", "SA"] },
    { word: "mesa", syllables: ["ME", "SA"] },
    { word: "mão", syllables: ["MÃO"] },
    { word: "livro", syllables: ["LI", "VRO"] },
    { word: "gato", syllables: ["GA", "TO"] },
    { word: "sol", syllables: ["SOL"] },
];

const totalRounds = 3;
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
    tapCount = 0;
    expectedTaps = syllables.length;
    isPlaying = false;
    currentSyllableIndex = 0;

    updateUI();
}

function completeGame() {
    const rhythmCard = document.querySelector('.rhythm-card');
    rhythmCard.innerHTML = `
        <h2>Atividade Concluída! 🎉</h2>
        <div class="syllable-stage" style="display: flex; align-items: center; justify-content: center; min-height: 200px;">
            <div style="font-size: 80px;">🌟</div>
        </div>
        <div class="feedback correct">
            <p style="font-size: 28px; margin: 20px 0;">Sua pontuação final: ${score} pontos</p>
            <p style="font-size: 16px;">Excelente ritmo e memória auditiva!</p>
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

    displaySyllables();

    const startButton = document.getElementById('start-button');
    startButton.innerHTML = '<i class="fas fa-play"></i> Ouvir Palavra';
    startButton.disabled = false;

    document.getElementById('speechSection').style.display = 'none';
    document.getElementById('feedback').classList.add('hidden');

    const tapArea = document.getElementById('tapArea');
    tapArea.classList.remove('active');
    document.getElementById('tapFeedback').textContent = '';
    tapCount = 0;
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

    await playSyllablesWithRhythm();

    const tapArea = document.getElementById('tapArea');
    tapArea.classList.add('active');

    startButton.innerHTML = '<i class="fas fa-redo"></i> Repetir';
    startButton.disabled = false;
}

async function playSyllablesWithRhythm() {
    const timeBetweenSyllables = 700;

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

    if (tapCount === expectedTaps) {
        showFeedback('Excelente ritmo! 🎉', true);
        setTimeout(() => {
            document.getElementById('speechSection').style.display = 'block';
        }, 800);
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
            score += 20;
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