// Variáveis globais
let currentRound = 0;
let score = 0;
let currentMovement = null;
let isShowingMovement = false;
let hasPlayed = false;
let cameraActive = false;
let movementDetected = 0;

const movements = [
    {
        name: "Levanta os braços",
        instruction: "levante os braços para cima",
        animation: "raise-arms",
    },
    {
        name: "Abaixa os braços",
        instruction: "abaixe os braços para baixo",
        animation: "lower-arms",
    },
    {
        name: "Pula",
        instruction: "pule para cima",
        animation: "jump",
    },
    {
        name: "Comemora",
        instruction: "comemore com alegria",
        animation: "celebrate",
    },
];

const totalRounds = 3;

// ================== INICIALIZAÇÃO ==================
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    startNewRound();
});

function setupEventListeners() {
    document.getElementById('play-button').addEventListener('click', showMovement);
    document.getElementById('done-button').addEventListener('click', completeMovement);
}

// ================== RODADAS ==================
function startNewRound() {
    const randomMovement = movements[Math.floor(Math.random() * movements.length)];
    currentMovement = randomMovement;
    hasPlayed = false;
    isShowingMovement = false;
    movementDetected = 0;

    updateUI();
}

function completeGame() {
    const movementCard = document.querySelector('.movement-card');
    movementCard.innerHTML = `
        <h2>Atividade Concluída! 🎉</h2>
        <div class="avatar-container">
            <div id="avatar-celebrate" class="avatar celebrate">
                <div class="avatar-head"></div>
                <div class="avatar-body">
                    <div class="avatar-arm avatar-arm-left"></div>
                    <div class="avatar-arm avatar-arm-right"></div>
                    <div class="avatar-leg avatar-leg-left"></div>
                    <div class="avatar-leg avatar-leg-right"></div>
                </div>
            </div>
        </div>
        <div class="feedback correct">
            <p style="font-size: 28px; margin: 20px 0;">Sua pontuação final: ${score} pontos</p>
            <p style="font-size: 16px;">Excelente coordenação motora!</p>
        </div>
        <div class="action-controls">
            <button class="action-button primary" onclick="location.reload()">
                <i class="fas fa-redo"></i> Jogar Novamente
            </button>
            <button class="action-button blue" onclick="goToMainPage()">
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

    const avatar = document.getElementById('avatar-leader');
    avatar.className = 'avatar leader';

    document.getElementById('instruction-text').textContent = "Ouça a instrução";

    const playButton = document.getElementById('play-button');
    playButton.innerHTML = '<i class="fas fa-play"></i> Mostrar Movimento';
    playButton.disabled = false;

    const doneButton = document.getElementById('done-button');
    doneButton.disabled = true;

    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('simpleAnalysis').style.display = 'none';
}

// ================== MOSTRAR MOVIMENTO ==================
function showMovement() {
    if (isShowingMovement) return;

    isShowingMovement = true;
    hasPlayed = true;

    const playButton = document.getElementById('play-button');
    playButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mostrando...';
    playButton.disabled = true;

    document.getElementById('instruction-text').textContent = currentMovement.name;

    const avatar = document.getElementById('avatar-leader');
    avatar.classList.add(currentMovement.animation);

    const utterance = new SpeechSynthesisUtterance(currentMovement.instruction);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);

    const animationDuration = 2000;

    setTimeout(() => {
        playButton.innerHTML = '<i class="fas fa-redo"></i> Repetir';
        playButton.disabled = false;

        const doneButton = document.getElementById('done-button');
        doneButton.disabled = false;

        isShowingMovement = false;
    }, animationDuration);
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

        analyzeMovement();
        document.getElementById('simpleAnalysis').style.display = 'block';
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
}

// ================== ANÁLISE DE MOVIMENTO ==================
function analyzeMovement() {
    if (!cameraActive) return;

    movementDetected = Math.floor(50 + Math.random() * 50);

    document.getElementById('movementDetected').textContent = movementDetected + '%';

    setTimeout(analyzeMovement, 1500);
}

// ================== RESPOSTAS ==================
function completeMovement() {
    if (!hasPlayed) return;

    stopCamera();

    let isCorrect = movementDetected > 60;

    const feedbackElement = document.getElementById('feedback');
    const feedbackText = document.getElementById('feedback-text');

    if (isCorrect) {
        score += 20;
        feedbackText.textContent = "Excelente! 🎉 Muito bem executado";
        feedbackElement.className = 'feedback correct';
    } else {
        feedbackText.textContent = "Quase lá, tente novamente";
        feedbackElement.className = 'feedback incorrect';
    }

    feedbackElement.classList.remove('hidden');

    document.getElementById('score').textContent = score + ' pontos';
    document.getElementById('score-display').textContent = score + ' pontos';

    document.getElementById('play-button').disabled = true;
    document.getElementById('done-button').disabled = true;

    setTimeout(() => {
        if (currentRound + 1 >= totalRounds) {
            completeGame();
        } else {
            currentRound++;
            startNewRound();
        }
    }, 2000);
}

// ================== NAVEGAÇÃO ==================
function goToMainPage() {
    if (cameraActive) stopCamera();
    window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-kinestesico.html';
}