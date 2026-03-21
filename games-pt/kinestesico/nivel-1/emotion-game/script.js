// Variáveis globais
let currentRound = 0;
let score = 0;
let currentEmotion = null;
let options = [];
let showFeedback = false;
let videoSpeed = 1;
let cameraActive = false;
let movementAnalysisData = {
    bodyImitation: 0,
    facialExpression: 0,
    energyLevel: 'Neutro',
    emotionalUnderstanding: 0
};

const emotions = [
    { name: "Feliz", color: "primary", videoUrl: "https://i.pinimg.com/originals/20/57/74/2057740a1b96ddb0b0a306b20cf4d666.gif" },
    { name: "Triste", color: "blue", videoUrl: "https://cdnl.iconscout.com/lottie/premium/thumb/nina-llorando-a-fuerza-5105643-4277861.gif" },
    { name: "Bravo", color: "red", videoUrl: "https://media.tenor.com/WYkqpAQVImkAAAAM/euphoria-boy.gif" },
    { name: "Assustado", color: "purple", videoUrl: "https://media.tenor.com/azK-UXf7o5cAAAAM/anime-scream.gif" },
    { name: "Surpreso", color: "accent", videoUrl: "https://cdn-icons-gif.flaticon.com/11175/11175756.gif" },
];

const totalRounds = 5;

// ================== INICIALIZAÇÃO ==================
document.addEventListener('DOMContentLoaded', () => {
    startNewRound();
});

// ================== RODADAS ==================
function startNewRound() {
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    currentEmotion = randomEmotion;

    const wrongOptions = emotions.filter(e => e.name !== randomEmotion.name)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);

    options = [randomEmotion, ...wrongOptions].sort(() => Math.random() - 0.5);
    showFeedback = false;
    videoSpeed = 1;
    resetAnalysis();

    updateUI();
    loadEmotionVideo();
}

function completeGame() {
    const emotionCard = document.querySelector('.emotion-card');
    emotionCard.innerHTML = `
        <h2>Jogo Concluído!</h2>
        <div style="font-size: 80px; margin: 20px 0;">🎉</div>
        <div class="feedback correct">
            <p>Sua pontuação final: ${score} pontos</p>
            <p style="font-size: 16px; margin-top: 10px;">Excelente trabalho em compreensão e expressão emocional!</p>
        </div>
        <div class="options-container" style="margin-top: 30px;">
            <button class="option-button primary" onclick="location.reload()">
                <i class="fas fa-redo"></i> Jogar Novamente
            </button>
            <button class="option-button blue" onclick="goToMainPage()">
                <i class="fas fa-home"></i> Voltar ao Menu
            </button>
        </div>
    `;
}

// ================== VÍDEO ==================
function loadEmotionVideo() {
    const placeholder = document.querySelector('.video-placeholder');

    const gifImage = document.createElement('img');
    gifImage.src = currentEmotion.videoUrl;
    gifImage.style.width = '100%';
    gifImage.style.height = 'auto';
    gifImage.style.maxHeight = '300px';
    gifImage.style.objectFit = 'contain';

    placeholder.innerHTML = '';
    placeholder.appendChild(gifImage);
}

// ================== INTERFACE ==================
function updateUI() {
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('total-rounds').textContent = totalRounds;
    document.getElementById('score').textContent = score + ' pontos';
    document.getElementById('score-display').textContent = score + ' pontos';

    const progress = ((currentRound + 1) / totalRounds) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';

    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    options.forEach(emotion => {
        const button = document.createElement('button');
        button.className = `option-button ${emotion.color}`;
        button.textContent = emotion.name;
        button.onclick = () => handleAnswer(emotion.name);
        optionsContainer.appendChild(button);
    });

    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('aiAnalysis').style.display = 'none';
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
        bodyImitation: Math.floor(Math.random() * 100),
        facialExpression: Math.floor(Math.random() * 100),
        energyLevel: ['Baixo', 'Médio', 'Alto'][Math.floor(Math.random() * 3)],
        emotionalUnderstanding: Math.floor(Math.random() * 100)
    };

    movementAnalysisData = simulatedAnalysis;

    document.getElementById('bodyImitation').textContent = simulatedAnalysis.bodyImitation + '%';
    document.getElementById('facialExpression').textContent = simulatedAnalysis.facialExpression + '%';
    document.getElementById('energyLevel').textContent = simulatedAnalysis.energyLevel;
    document.getElementById('emotionalUnderstanding').textContent = simulatedAnalysis.emotionalUnderstanding + '%';

    checkAdaptation();

    setTimeout(analyzeMovement, 1000);
}

function checkAdaptation() {
    const notice = document.getElementById('adaptationNotice');
    const text = document.getElementById('adaptationText');

    if (movementAnalysisData.bodyImitation < 40) {
        notice.classList.remove('hidden');
        text.textContent = 'Mexa-se um pouco mais! Tente imitar os movimentos do vídeo.';
        reduceVideoSpeed();
    } else if (movementAnalysisData.emotionalUnderstanding < 50) {
        notice.classList.remove('hidden');
        text.textContent = 'Parece que a emoção é um pouco complexa. Aqui vai uma versão mais simples...';
    } else {
        notice.classList.add('hidden');
    }
}

function reduceVideoSpeed() {
    // GIFs não podem ser desacelerados diretamente
}

function resetAnalysis() {
    movementAnalysisData = {
        bodyImitation: 0,
        facialExpression: 0,
        energyLevel: 'Neutro',
        emotionalUnderstanding: 0
    };
}

// ================== RESPOSTAS ==================
function handleAnswer(selectedName) {
    if (showFeedback) return;

    stopCamera();

    const isCorrect = selectedName === currentEmotion.name;
    const feedbackElement = document.getElementById('feedback');
    const feedbackText = document.getElementById('feedback-text');

    if (isCorrect) {
        score += 20;
        feedbackText.textContent = "Correto! 🎉 Excelente imitação emocional";
        feedbackElement.className = 'feedback correct';
    } else {
        feedbackText.textContent = `Não foi dessa vez. Era: ${currentEmotion.name}`;
        feedbackElement.className = 'feedback incorrect';
    }

    feedbackElement.classList.remove('hidden');
    showFeedback = true;

    document.getElementById('score').textContent = score + ' pontos';
    document.getElementById('score-display').textContent = score + ' pontos';

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