// Variáveis globais
let currentRound = 0;
let score = 0;
let currentMovement = null;
let isShowingMovement = false;
let hasPlayed = false;
let cameraActive = false;
let difficulty = 1; // 1-3 estrelas
let movementAnalysisData = {
    movementQuality: 0,
    armAmplitude: 0,
    latency: 0,
    coordination: 0
};

const movements = [
    {
        name: "Levanta os braços",
        instruction: "levante os braços para cima",
        animation: "raise-arms",
        color: "primary",
        difficulty: 1,
        guide: {
            hands: "Suba os braços até a cabeça",
            body: "Mantenha o corpo reto",
            movement: "Movimento lento e controlado"
        }
    },
    {
        name: "Abaixa os braços",
        instruction: "abaixe os braços para baixo",
        animation: "lower-arms",
        color: "blue",
        difficulty: 1,
        guide: {
            hands: "Abaixe os braços ao lado do corpo",
            body: "Mantenha o corpo reto",
            movement: "Movimento suave"
        }
    },
    {
        name: "Pula",
        instruction: "pule para cima",
        animation: "jump",
        color: "red",
        difficulty: 2,
        guide: {
            hands: "Os braços se movem com o corpo",
            body: "Dobre os joelhos",
            movement: "Salto dinâmico"
        }
    },
    {
        name: "Gira para a direita",
        instruction: "gire o corpo para a direita",
        animation: "turn-right",
        color: "purple",
        difficulty: 2,
        guide: {
            hands: "Braços naturais",
            body: "Gire todo o corpo",
            movement: "Rotação completa"
        }
    },
    {
        name: "Agacha",
        instruction: "agache para baixo",
        animation: "squat",
        color: "accent",
        difficulty: 3,
        guide: {
            hands: "Braços para frente ou ao lado",
            body: "Dobre bastante os joelhos",
            movement: "Movimento controlado"
        }
    },
    {
        name: "Acena",
        instruction: "acene com a mão",
        animation: "wave",
        color: "primary",
        difficulty: 1,
        guide: {
            hands: "Mova a mão de cima para baixo",
            body: "Mantenha o corpo estável",
            movement: "Movimento suave e amigável"
        }
    },
];

const totalRounds = 5;

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
    resetAnalysis();

    updateUI();
}

function completeGame() {
    const movementCard = document.querySelector('.movement-card');
    movementCard.innerHTML = `
        <h2>Jogo Concluído! 🎉</h2>
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
            <p style="font-size: 16px;">Excelente coordenação motora e imitação!</p>
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

    updateDifficultyDisplay();
    updateVisualGuide();

    const playButton = document.getElementById('play-button');
    playButton.innerHTML = '<i class="fas fa-play"></i> Mostrar Movimento';
    playButton.disabled = false;

    const doneButton = document.getElementById('done-button');
    doneButton.disabled = true;

    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('aiAnalysis').style.display = 'none';
    document.getElementById('adaptationNotice').classList.add('hidden');
}

function updateDifficultyDisplay() {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < currentMovement.difficulty) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function updateVisualGuide() {
    document.getElementById('guide-hands').textContent = currentMovement.guide.hands;
    document.getElementById('guide-body').textContent = currentMovement.guide.body;
    document.getElementById('guide-movement').textContent = currentMovement.guide.movement;

    const guide = document.getElementById('visual-guide');
    if (currentMovement.difficulty >= 2) {
        guide.classList.remove('hidden');
    } else {
        guide.classList.add('hidden');
    }
}

// ================== MOSTRAR MOVIMENTO ==================
function showMovement() {
    if (isShowingMovement) return;

    isShowingMovement = true;
    hasPlayed = true;

    const playButton = document.getElementById('play-button');
    playButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mostrando...';
    playButton.disabled = true;

    const repeatButton = document.getElementById('repeat-button');
    repeatButton.style.display = 'none';

    document.getElementById('instruction-text').textContent = currentMovement.name;

    const avatar = document.getElementById('avatar-leader');
    avatar.classList.add(currentMovement.animation);

    const utterance = new SpeechSynthesisUtterance(currentMovement.instruction);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);

    const animationDuration = currentMovement.animation === 'jump' ||
                               currentMovement.animation === 'squat' ? 3000 : 2000;

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
        document.getElementById('aiAnalysis').style.display = 'block';
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

    const simulatedAnalysis = {
        movementQuality: Math.floor(60 + Math.random() * 40),
        armAmplitude: Math.floor(65 + Math.random() * 35),
        latency: Math.floor(200 + Math.random() * 300),
        coordination: Math.floor(55 + Math.random() * 45)
    };

    movementAnalysisData = simulatedAnalysis;

    document.getElementById('movementQuality').textContent = simulatedAnalysis.movementQuality + '%';
    document.getElementById('armAmplitude').textContent = simulatedAnalysis.armAmplitude + '%';
    document.getElementById('latency').textContent = simulatedAnalysis.latency;
    document.getElementById('coordination').textContent = simulatedAnalysis.coordination + '%';

    checkAdaptation();

    setTimeout(analyzeMovement, 1500);
}

function checkAdaptation() {
    const notice = document.getElementById('adaptationNotice');
    const text = document.getElementById('adaptationText');
    const quality = movementAnalysisData.movementQuality;
    const coordination = movementAnalysisData.coordination;

    let shouldAdapt = false;

    if (quality < 40) {
        notice.classList.remove('hidden');
        text.textContent = '⚠️ Tente fazer o movimento de forma mais clara. Mova-se um pouco mais devagar.';
        shouldAdapt = true;
    } else if (coordination < 35) {
        notice.classList.remove('hidden');
        text.textContent = '💡 O movimento parece complexo. Vou mostrar uma versão simplificada...';
        shouldAdapt = true;
    } else if (quality < 60) {
        notice.classList.remove('hidden');
        text.textContent = '👍 Você está indo bem! Tente fazer o movimento com mais amplitude.';
        shouldAdapt = true;
    } else {
        notice.classList.add('hidden');
    }

    if (shouldAdapt && difficulty > 1) {
        reduceDifficulty();
    }
}

function reduceDifficulty() {
    if (difficulty > 1) {
        difficulty--;
        console.log('Dificuldade reduzida para:', difficulty);
    }
}

function resetAnalysis() {
    movementAnalysisData = {
        movementQuality: 0,
        armAmplitude: 0,
        latency: 0,
        coordination: 0
    };
}

// ================== RESPOSTAS ==================
function completeMovement() {
    if (!hasPlayed) return;

    stopCamera();

    let isCorrect = false;

    if (cameraActive || movementAnalysisData.movementQuality > 0) {
        const qualityScore = (
            movementAnalysisData.movementQuality +
            movementAnalysisData.coordination +
            movementAnalysisData.armAmplitude
        ) / 3;

        isCorrect = qualityScore > 65;
    } else {
        isCorrect = Math.random() > 0.3;
    }

    const feedbackElement = document.getElementById('feedback');
    const feedbackText = document.getElementById('feedback-text');

    if (isCorrect) {
        score += (20 * difficulty);
        feedbackText.textContent = "Excelente imitação! 🎉 Ótima coordenação";
        feedbackElement.className = 'feedback correct';
    } else {
        feedbackText.textContent = "Quase lá, tente novamente com mais precisão";
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
    }, 2500);
}

// ================== NAVEGAÇÃO ==================
function goToMainPage() {
    window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-kinestesico.html';
}