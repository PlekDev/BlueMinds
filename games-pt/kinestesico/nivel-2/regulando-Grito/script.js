// Variáveis globais
let currentRound = 0;
let score = 0;
let cameraActive = false;
let breathingActive = false;
let analysisActive = false;
let anxietyLevel = 0; // 0-100
let breathingDuration = 4; // segundos (adapta entre 4-6)
let regulationAnalysis = {
    voiceVolume: 0,
    breathRate: 0,
    detectedAnxiety: 'Baixo',
    selfControl: 0
};

const totalRounds = 3;
let analysisInterval = null;
let breathingPhase = 0; // 0: inspire, 1: segure, 2: expire, 3: segure
const breathingPhases = ['Inspire', 'Segure', 'Expire', 'Segure'];
const breathingDurations = [4, 4, 4, 4]; // segundos para cada fase

// ================== INICIALIZAÇÃO ==================
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    startNewRound();
});

function setupEventListeners() {
    document.getElementById('angryBtn').addEventListener('click', () => selectCharacter('angry'));
    document.getElementById('calmBtn').addEventListener('click', () => selectCharacter('calm'));
    document.getElementById('continue-button').addEventListener('click', continueToNextRound);
}

// ================== RODADAS ==================
function startNewRound() {
    anxietyLevel = 20 + Math.random() * 30; // 20-50% inicial
    breathingDuration = 4;
    resetAnalysis();

    document.getElementById('angryBtn').disabled = false;
    document.getElementById('calmBtn').disabled = false;
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('continue-button').style.display = 'none';

    updateUI();
}

function completeGame() {
    const regulationCard = document.querySelector('.regulation-card');
    regulationCard.innerHTML = `
        <h2>Atividade Concluída! 🎉</h2>
        <div style="text-align: center; margin: 30px 0;">
            <div style="font-size: 100px; margin-bottom: 20px;">😌</div>
            <div style="font-size: 80px;">🌿</div>
        </div>
        <div class="feedback correct">
            <p style="font-size: 28px; margin: 20px 0;">Sua pontuação final: ${score} pontos</p>
            <p style="font-size: 16px;">Excelente regulação emocional e autocontrole!</p>
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

    updateAnxietyIndicator();

    document.getElementById('breathingGuide').style.display = 'none';
    document.getElementById('analysisSection').style.display = 'none';
    document.getElementById('cameraSection').style.display = 'none';
}

function updateAnxietyIndicator() {
    const percentage = Math.min(100, anxietyLevel);
    document.getElementById('anxietyBar').style.width = percentage + '%';

    let level = 'Baixo';
    if (percentage > 70) level = 'Alto';
    else if (percentage > 40) level = 'Médio';

    document.getElementById('anxietyLevel').textContent = level;
}

// ================== SELEÇÃO DE PERSONAGEM ==================
function selectCharacter(choice) {
    const isCorrect = choice === 'calm';

    document.getElementById('angryBtn').disabled = true;
    document.getElementById('calmBtn').disabled = true;

    const feedbackElement = document.getElementById('feedback');
    const feedbackText = document.getElementById('feedback-text');

    if (isCorrect) {
        score += 10;
        feedbackText.textContent = 'Correto! Essa criança está calma. 😊';
        feedbackElement.className = 'feedback correct';

        setTimeout(() => {
            startBreathingGuide();
        }, 500);
    } else {
        feedbackText.textContent = 'Não, essa criança está brava. Tente com a outra. 😠';
        feedbackElement.className = 'feedback incorrect';

        setTimeout(() => {
            document.getElementById('angryBtn').disabled = false;
            document.getElementById('calmBtn').disabled = false;
        }, 2000);
    }

    feedbackElement.classList.remove('hidden');
    document.getElementById('score').textContent = score + ' pontos';
    document.getElementById('score-display').textContent = score + ' pontos';
}

// ================== GUIA DE RESPIRAÇÃO ==================
function startBreathingGuide() {
    document.getElementById('breathingGuide').style.display = 'block';
    document.getElementById('analysisSection').style.display = 'block';
    document.getElementById('cameraSection').style.display = 'block';

    breathingActive = true;
    analysisActive = true;

    performBreathingCycle();
}

async function performBreathingCycle() {
    const cycles = 3; // 3 ciclos de respiração

    for (let cycle = 0; cycle < cycles; cycle++) {
        for (let phase = 0; phase < 4; phase++) {
            if (!breathingActive) return;

            const phaseText = breathingPhases[phase];
            const phaseDuration = breathingDurations[phase];

            document.getElementById('breathInstruction').textContent = phaseText;
            document.getElementById('breathDuration').textContent = `${phaseText}: ${phaseDuration} segundos`;

            startBreathingAnalysis(phaseDuration);

            await new Promise(resolve => setTimeout(resolve, phaseDuration * 1000));
        }
    }

    breathingActive = false;
    document.getElementById('breathInstruction').textContent = 'Muito bem 😊';

    setTimeout(() => {
        document.getElementById('continue-button').style.display = 'inline-flex';
    }, 1000);
}

// ================== ANÁLISE DE RESPIRAÇÃO ==================
function startBreathingAnalysis(duration) {
    if (!analysisActive) return;

    const startTime = Date.now();

    const analysisCheck = setInterval(() => {
        if (!analysisActive) {
            clearInterval(analysisCheck);
            return;
        }

        const elapsed = (Date.now() - startTime) / 1000;

        if (elapsed >= duration) {
            clearInterval(analysisCheck);
            return;
        }

        const voiceVolume = 30 + Math.random() * 40;
        const breathRate = 40 + Math.random() * 50;
        const selfControl = 60 + Math.random() * 35;

        regulationAnalysis.voiceVolume = Math.round(voiceVolume);
        regulationAnalysis.breathRate = Math.round(breathRate);
        regulationAnalysis.selfControl = Math.round(selfControl);

        const detectedAnxietyValue = Math.max(0, 100 - breathRate);
        anxietyLevel = Math.max(0, anxietyLevel - 5);

        if (detectedAnxietyValue > 70) {
            regulationAnalysis.detectedAnxiety = 'Alto';
        } else if (detectedAnxietyValue > 40) {
            regulationAnalysis.detectedAnxiety = 'Médio';
        } else {
            regulationAnalysis.detectedAnxiety = 'Baixo';
        }

        updateAnalysisDisplay();
        checkAdaptation();
        updateAnxietyIndicator();
    }, 500);
}

function updateAnalysisDisplay() {
    document.getElementById('voiceVolume').textContent = regulationAnalysis.voiceVolume + '%';
    document.getElementById('voiceVolumeProgress').style.width = regulationAnalysis.voiceVolume + '%';

    document.getElementById('breathRate').textContent = regulationAnalysis.breathRate + '%';
    document.getElementById('breathRateProgress').style.width = regulationAnalysis.breathRate + '%';

    document.getElementById('detectedAnxiety').textContent = regulationAnalysis.detectedAnxiety;
    document.getElementById('selfControl').textContent = regulationAnalysis.selfControl + '%';
}

function checkAdaptation() {
    const notice = document.getElementById('adaptationNotice');
    const text = document.getElementById('adaptationText');

    if (anxietyLevel > 70) {
        notice.classList.remove('hidden');
        text.textContent = '⚠️ Foi detectada ansiedade elevada. Recomenda-se uma pausa...';

        if (breathingDuration < 6) {
            breathingDuration = 6;
        }
    } else if (regulationAnalysis.voiceVolume > 70) {
        notice.classList.remove('hidden');
        text.textContent = '💡 Sua voz está muito alta. Tente falar mais suavemente...';
    } else if (regulationAnalysis.breathRate < 50) {
        notice.classList.remove('hidden');
        text.textContent = '🫁 Respire mais fundo. Siga o ritmo do guia...';
    } else {
        notice.classList.add('hidden');
    }
}

function resetAnalysis() {
    regulationAnalysis = {
        voiceVolume: 0,
        breathRate: 0,
        detectedAnxiety: 'Baixo',
        selfControl: 0
    };
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
}

// ================== CONTINUAR PARA A PRÓXIMA RODADA ==================
function continueToNextRound() {
    stopCamera();
    breathingActive = false;
    analysisActive = false;

    const regulationBonus = Math.round((regulationAnalysis.selfControl + regulationAnalysis.breathRate) / 2 / 10);
    score += regulationBonus;

    document.getElementById('score').textContent = score + ' pontos';
    document.getElementById('score-display').textContent = score + ' pontos';

    if (currentRound + 1 >= totalRounds) {
        completeGame();
    } else {
        currentRound++;
        startNewRound();
    }
}

// ================== NAVEGAÇÃO ==================
function goToMainPage() {
    if (cameraActive) stopCamera();
    window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-kinestesico.html';
}