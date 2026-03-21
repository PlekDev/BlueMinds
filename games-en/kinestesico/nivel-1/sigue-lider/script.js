// Global variables
let currentRound = 0;
let score = 0;
let currentMovement = null;
let isShowingMovement = false;
let hasPlayed = false;
let cameraActive = false;
let difficulty = 1;
let movementAnalysisData = { movementQuality: 0, armAmplitude: 0, latency: 0, coordination: 0 };

const movements = [
    {
        name: "Raise your arms",
        instruction: "raise your arms up high",
        animation: "raise-arms", color: "primary", difficulty: 1,
        guide: { hands: "Lift arms above your head", body: "Keep your body straight", movement: "Slow and controlled" }
    },
    {
        name: "Lower your arms",
        instruction: "lower your arms down to your sides",
        animation: "lower-arms", color: "blue", difficulty: 1,
        guide: { hands: "Lower arms to the sides", body: "Keep your body straight", movement: "Smooth movement" }
    },
    {
        name: "Jump",
        instruction: "jump up high",
        animation: "jump", color: "red", difficulty: 2,
        guide: { hands: "Arms move with the body", body: "Bend your knees", movement: "Dynamic jump" }
    },
    {
        name: "Turn right",
        instruction: "turn your body to the right",
        animation: "turn-right", color: "purple", difficulty: 2,
        guide: { hands: "Natural arm position", body: "Rotate whole body", movement: "Full rotation" }
    },
    {
        name: "Squat down",
        instruction: "squat down low",
        animation: "squat", color: "accent", difficulty: 3,
        guide: { hands: "Arms forward or to the sides", body: "Bend knees deeply", movement: "Controlled movement" }
    },
    {
        name: "Wave hello",
        instruction: "wave your hand to say hello",
        animation: "wave", color: "primary", difficulty: 1,
        guide: { hands: "Move hand up and down", body: "Keep body stable", movement: "Smooth and friendly" }
    },
];

const totalRounds = 5;

// ================== INITIALIZATION ==================
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    startNewRound();
});

function setupEventListeners() {
    document.getElementById('play-button').addEventListener('click', showMovement);
    document.getElementById('done-button').addEventListener('click', completeMovement);
}

// ================== ROUNDS ==================
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
        <h2>Game Complete! 🎉</h2>
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
            <p style="font-size:28px;margin:20px 0;">Your final score: ${score} points</p>
            <p style="font-size:16px;">Excellent motor coordination and imitation!</p>
        </div>
        <div class="action-controls">
            <button class="action-button primary" onclick="location.reload()"><i class="fas fa-redo"></i> Play Again</button>
            <button class="action-button blue" onclick="goToMainPage()"><i class="fas fa-home"></i> Back to Menu</button>
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

    const avatar = document.getElementById('avatar-leader');
    avatar.className = 'avatar leader';

    document.getElementById('instruction-text').textContent = "Listen to the instruction";
    updateDifficultyDisplay();
    updateVisualGuide();

    const playButton = document.getElementById('play-button');
    playButton.innerHTML = '<i class="fas fa-play"></i> Show Movement';
    playButton.disabled = false;

    document.getElementById('done-button').disabled = true;
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('aiAnalysis').style.display = 'none';
    document.getElementById('adaptationNotice').classList.add('hidden');
}

function updateDifficultyDisplay() {
    document.querySelectorAll('.star').forEach((star, index) => {
        star.classList.toggle('active', index < currentMovement.difficulty);
    });
}

function updateVisualGuide() {
    document.getElementById('guide-hands').textContent = currentMovement.guide.hands;
    document.getElementById('guide-body').textContent = currentMovement.guide.body;
    document.getElementById('guide-movement').textContent = currentMovement.guide.movement;
    const guide = document.getElementById('visual-guide');
    guide.classList.toggle('hidden', currentMovement.difficulty < 2);
}

// ================== SHOW MOVEMENT ==================
function showMovement() {
    if (isShowingMovement) return;
    isShowingMovement = true;
    hasPlayed = true;

    const playButton = document.getElementById('play-button');
    playButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Showing...';
    playButton.disabled = true;

    document.getElementById('instruction-text').textContent = currentMovement.name;

    const avatar = document.getElementById('avatar-leader');
    avatar.classList.add(currentMovement.animation);

    const utterance = new SpeechSynthesisUtterance(currentMovement.instruction);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);

    const animationDuration = (currentMovement.animation === 'jump' || currentMovement.animation === 'squat') ? 3000 : 2000;

    setTimeout(() => {
        playButton.innerHTML = '<i class="fas fa-redo"></i> Repeat';
        playButton.disabled = false;
        document.getElementById('done-button').disabled = false;
        isShowingMovement = false;
    }, animationDuration);
}

// ================== CAMERA ==================
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
        alert('Could not access the camera: ' + err.message);
    }
}

function stopCamera() {
    const video = document.getElementById('cameraFeed');
    if (video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
    video.style.display = 'none';
    document.getElementById('cameraPlaceholder').style.display = 'flex';
    document.getElementById('startCameraBtn').style.display = 'inline-block';
    document.getElementById('stopCameraBtn').style.display = 'none';
    cameraActive = false;
}

// ================== MOVEMENT ANALYSIS ==================
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

    if (quality < 40) {
        notice.classList.remove('hidden');
        text.textContent = '⚠️ Try to do the movement more clearly. Move a little more slowly.';
    } else if (coordination < 35) {
        notice.classList.remove('hidden');
        text.textContent = '💡 This movement seems complex. I will show you a simplified version...';
    } else if (quality < 60) {
        notice.classList.remove('hidden');
        text.textContent = '👍 Good progress! Try to make the movement with more range.';
    } else {
        notice.classList.add('hidden');
    }
}

function resetAnalysis() {
    movementAnalysisData = { movementQuality: 0, armAmplitude: 0, latency: 0, coordination: 0 };
}

// ================== ANSWERS ==================
function completeMovement() {
    if (!hasPlayed) return;
    stopCamera();

    let isCorrect = false;
    if (movementAnalysisData.movementQuality > 0) {
        const qualityScore = (movementAnalysisData.movementQuality + movementAnalysisData.coordination + movementAnalysisData.armAmplitude) / 3;
        isCorrect = qualityScore > 65;
    } else {
        isCorrect = Math.random() > 0.3;
    }

    const feedbackElement = document.getElementById('feedback');
    const feedbackText = document.getElementById('feedback-text');

    if (isCorrect) {
        score += (20 * difficulty);
        feedbackText.textContent = "Excellent imitation! 🎉 Great coordination!";
        feedbackElement.className = 'feedback correct';
    } else {
        feedbackText.textContent = "Close! Try again with more precision.";
        feedbackElement.className = 'feedback incorrect';
    }

    feedbackElement.classList.remove('hidden');
    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';
    document.getElementById('play-button').disabled = true;
    document.getElementById('done-button').disabled = true;

    setTimeout(() => {
        if (currentRound + 1 >= totalRounds) completeGame();
        else { currentRound++; startNewRound(); }
    }, 2500);
}

// ================== NAVIGATION ==================
function goToMainPage() {
    window.location.href = '../../../../selectores/selector-kinestesico.html';
}
