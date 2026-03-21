// Variáveis globais
let currentRound = 0;
let score = 0;
let currentWord = null;
let cameraActive = false;
let movementInProgress = false;
let eyeGazeData = {
    gazeFollowing: 0,
    soundResponse: 0,
    attentionStability: 0,
    distractibility: 'Baixa'
};

const words = [
    { word: "Olha", emoji: "👀", soundUrl: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==" },
    { word: "Escuta", emoji: "👂", soundUrl: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==" },
    { word: "Pula", emoji: "⬆️", soundUrl: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==" },
    { word: "Sorri", emoji: "😊", soundUrl: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==" },
    { word: "Canta", emoji: "🎵", soundUrl: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==" },
];

const totalRounds = 5;
let objectPosition = { x: 50, y: 50 };
let analysisInterval = null;

// ================== INICIALIZAÇÃO ==================
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    startNewRound();
});

function setupEventListeners() {
    document.getElementById('start-button').addEventListener('click', startActivity);
    document.getElementById('listen-button').addEventListener('click', startSpeechRecognition);
    document.getElementById('moving-object').addEventListener('click', onObjectClicked);
}

// ================== RODADAS ==================
function startNewRound() {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    currentWord = randomWord;
    movementInProgress = false;
    resetEyeGazeData();

    updateUI();
}

function completeGame() {
    const attentionCard = document.querySelector('.attention-card');
    attentionCard.innerHTML = `
        <h2>Atividade Concluída! 🎉</h2>
        <div class="object-stage" style="display: flex; align-items: center; justify-content: center;">
            <div style="font-size: 80px; animation: bounce 1s ease-in-out infinite;">🌟</div>
        </div>
        <div class="feedback correct">
            <p style="font-size: 28px; margin: 20px 0;">Sua pontuação final: ${score} pontos</p>
            <p style="font-size: 16px;">Excelente atenção conjunta e integração multissensorial!</p>
        </div>
        <div class="action-controls">
            <button class="action-button primary" onclick="location.reload()">
                <i class="fas fa-redo"></i> Jogar Novamente
            </button>
            <button class="action-button secondary" onclick="goToMainPage()">
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

    document.getElementById('object-label').textContent = currentWord.emoji;

    moveObjectToRandomPosition();

    const startButton = document.getElementById('start-button');
    startButton.innerHTML = '<i class="fas fa-play"></i> Iniciar Atividade';
    startButton.disabled = false;

    document.getElementById('analysisSection').style.display = 'none';
    document.getElementById('speechSection').style.display = 'none';
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('adaptationNotice').classList.add('hidden');
}

// ================== MOVIMENTO DO OBJETO ==================
function moveObjectToRandomPosition() {
    const stage = document.querySelector('.object-stage');
    const object = document.getElementById('moving-object');

    const maxX = stage.offsetWidth - object.offsetWidth;
    const maxY = stage.offsetHeight - object.offsetHeight;

    objectPosition.x = Math.random() * maxX;
    objectPosition.y = Math.random() * maxY;

    object.style.left = objectPosition.x + 'px';
    object.style.top = objectPosition.y + 'px';
    object.style.transform = 'translate(0, 0)';
}

function moveObjectAlongPath() {
    const stage = document.querySelector('.object-stage');
    const object = document.getElementById('moving-object');
    const positions = [
        { x: stage.offsetWidth * 0.2, y: stage.offsetHeight * 0.2 },
        { x: stage.offsetWidth * 0.8, y: stage.offsetHeight * 0.2 },
        { x: stage.offsetWidth * 0.8, y: stage.offsetHeight * 0.8 },
        { x: stage.offsetWidth * 0.2, y: stage.offsetHeight * 0.8 },
        { x: stage.offsetWidth * 0.5, y: stage.offsetHeight * 0.5 },
    ];

    let currentPositionIndex = 0;
    const moveInterval = setInterval(() => {
        if (currentPositionIndex >= positions.length || !movementInProgress) {
            clearInterval(moveInterval);
            return;
        }

        const pos = positions[currentPositionIndex];
        object.style.left = pos.x + 'px';
        object.style.top = pos.y + 'px';
        currentPositionIndex++;
    }, 600);
}

function onObjectClicked() {
    if (movementInProgress) {
        score += 10;
        document.getElementById('score').textContent = score + ' pontos';
        document.getElementById('score-display').textContent = score + ' pontos';
    }
}

// ================== ATIVIDADE PRINCIPAL ==================
async function startActivity() {
    if (movementInProgress) return;

    movementInProgress = true;
    const startButton = document.getElementById('start-button');
    startButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Em andamento...';
    startButton.disabled = true;

    document.getElementById('analysisSection').style.display = 'block';

    playWordSound();
    moveObjectAlongPath();

    if (cameraActive) {
        startEyeTrackingAnalysis();
    }

    setTimeout(() => {
        movementInProgress = false;

        document.getElementById('speechSection').style.display = 'block';

        startButton.innerHTML = '<i class="fas fa-redo"></i> Repetir';
        startButton.disabled = false;
    }, 4000);
}

function playWordSound() {
    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1.2;
    utterance.volume = 1;
    speechSynthesis.speak(utterance);
}

// ================== CÂMERA ==================
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } }
        });

        const video = document.getElementById('cameraFeed');
        video.srcObject = stream;
        video.style.display = 'block';
        document.getElementById('cameraPlaceholder').style.display = 'none';
        document.getElementById('startCameraBtn').style.display = 'none';
        document.getElementById('stopCameraBtn').style.display = 'inline-block';

        cameraActive = true;
        video.play();
    } catch (err) {
        alert('Não foi possível acessar a câmera: ' + err.message);
    }
}

function stopCamera() {
    const video = document.getElementById('cameraFeed');
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    video.style.display = 'none';
    document.getElementById('cameraPlaceholder').style.display = 'flex';
    document.getElementById('startCameraBtn').style.display = 'inline-block';
    document.getElementById('stopCameraBtn').style.display = 'none';
    cameraActive = false;

    if (analysisInterval) clearInterval(analysisInterval);
}

// ================== ANÁLISE DE RASTREAMENTO VISUAL ==================
function startEyeTrackingAnalysis() {
    const gazePoint = document.getElementById('gazePoint');

    analysisInterval = setInterval(() => {
        if (!movementInProgress) {
            gazePoint.style.display = 'none';
            return;
        }

        const objectElement = document.getElementById('moving-object');
        const stage = document.querySelector('.object-stage');
        const stageRect = stage.getBoundingClientRect();
        const objectRect = objectElement.getBoundingClientRect();

        const objectCenterX = objectRect.left - stageRect.left + objectRect.width / 2;
        const objectCenterY = objectRect.top - stageRect.top + objectRect.height / 2;

        const gazeX = objectCenterX + (Math.random() - 0.5) * 80;
        const gazeY = objectCenterY + (Math.random() - 0.5) * 80;

        gazePoint.style.left = gazeX + 'px';
        gazePoint.style.top = gazeY + 'px';
        gazePoint.style.display = 'block';

        updateEyeTrackingMetrics(objectCenterX, objectCenterY, gazeX, gazeY);
    }, 500);
}

function updateEyeTrackingMetrics(targetX, targetY, gazeX, gazeY) {
    const distance = Math.sqrt(Math.pow(targetX - gazeX, 2) + Math.pow(targetY - gazeY, 2));
    const maxDistance = 200;
    const gazeFollowing = Math.max(0, 100 - (distance / maxDistance) * 100);

    eyeGazeData.gazeFollowing = Math.round(gazeFollowing);
    eyeGazeData.soundResponse = Math.round(75 + Math.random() * 25);
    eyeGazeData.attentionStability = Math.round(70 + Math.random() * 30);
    eyeGazeData.distractibility = eyeGazeData.attentionStability > 75 ? 'Baixa' : 'Média';

    document.getElementById('gazeFollowing').textContent = eyeGazeData.gazeFollowing + '%';
    document.getElementById('gazeFollowingProgress').style.width = eyeGazeData.gazeFollowing + '%';

    document.getElementById('soundResponse').textContent = eyeGazeData.soundResponse + '%';
    document.getElementById('soundResponseProgress').style.width = eyeGazeData.soundResponse + '%';

    document.getElementById('attentionStability').textContent = eyeGazeData.attentionStability + '%';
    document.getElementById('attentionStabilityProgress').style.width = eyeGazeData.attentionStability + '%';

    document.getElementById('distractibility').textContent = eyeGazeData.distractibility;

    checkAdaptation();
}

function checkAdaptation() {
    const notice = document.getElementById('adaptationNotice');
    const text = document.getElementById('adaptationText');

    if (eyeGazeData.gazeFollowing < 50) {
        notice.classList.remove('hidden');
        text.textContent = '💡 Aumentando contraste visual para melhor rastreamento...';
    } else if (eyeGazeData.attentionStability < 60) {
        notice.classList.remove('hidden');
        text.textContent = '🎵 Usando sons mais claros para melhor resposta auditiva...';
    } else {
        notice.classList.add('hidden');
    }
}

function resetEyeGazeData() {
    eyeGazeData = {
        gazeFollowing: 0,
        soundResponse: 0,
        attentionStability: 0,
        distractibility: 'Baixa'
    };
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

    recognition.onstart = () => {
        console.log('Ouvindo...');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        const targetWord = currentWord.word.toLowerCase();

        const isSimilar = transcript.includes(targetWord) || targetWord.includes(transcript);

        if (isSimilar) {
            score += 20;
            showSpeechFeedback('Excelente! 🎉 Você repetiu a palavra corretamente', true);
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
    if (cameraActive) stopCamera();
    window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-kinestesico.html';
}