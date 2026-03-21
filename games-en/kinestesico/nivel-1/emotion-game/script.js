// Global variables
let currentRound = 0;
let score = 0;
let currentEmotion = null;
let options = [];
let showFeedback = false;
let cameraActive = false;
let movementAnalysisData = {
    bodyImitation: 0,
    facialExpression: 0,
    energyLevel: 'Neutral',
    emotionalUnderstanding: 0
};

const emotions = [
    { name: "Happy",     color: "primary", videoUrl: "https://i.pinimg.com/originals/20/57/74/2057740a1b96ddb0b0a306b20cf4d666.gif" },
    { name: "Sad",       color: "blue",    videoUrl: "https://cdnl.iconscout.com/lottie/premium/thumb/nina-llorando-a-fuerza-5105643-4277861.gif" },
    { name: "Angry",     color: "red",     videoUrl: "https://media.tenor.com/WYkqpAQVImkAAAAM/euphoria-boy.gif" },
    { name: "Scared",    color: "purple",  videoUrl: "https://media.tenor.com/azK-UXf7o5cAAAAM/anime-scream.gif" },
    { name: "Surprised", color: "accent",  videoUrl: "https://cdn-icons-gif.flaticon.com/11175/11175756.gif" },
];

const totalRounds = 5;

// ================== INITIALIZATION ==================
document.addEventListener('DOMContentLoaded', () => { startNewRound(); });

// ================== ROUNDS ==================
function startNewRound() {
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    currentEmotion = randomEmotion;

    const wrongOptions = emotions.filter(e => e.name !== randomEmotion.name)
        .sort(() => Math.random() - 0.5).slice(0, 2);
    options = [randomEmotion, ...wrongOptions].sort(() => Math.random() - 0.5);

    showFeedback = false;
    resetAnalysis();
    updateUI();
    loadEmotionVideo();
}

function completeGame() {
    const emotionCard = document.querySelector('.emotion-card');
    emotionCard.innerHTML = `
        <h2>Game Complete!</h2>
        <div style="font-size:80px;margin:20px 0;">🎉</div>
        <div class="feedback correct">
            <p>Your final score: ${score} points</p>
            <p style="font-size:16px;margin-top:10px;">Excellent emotional comprehension and expression!</p>
        </div>
        <div class="options-container" style="margin-top:30px;">
            <button class="option-button primary" onclick="location.reload()">
                <i class="fas fa-redo"></i> Play Again
            </button>
            <button class="option-button blue" onclick="goToMainPage()">
                <i class="fas fa-home"></i> Back to Menu
            </button>
        </div>`;
}

// ================== VIDEO ==================
function loadEmotionVideo() {
    const placeholder = document.getElementById('videoPlaceholder');
    const gifImage = document.createElement('img');
    gifImage.src = currentEmotion.videoUrl;
    gifImage.style.cssText = 'width:100%;height:auto;max-height:300px;object-fit:contain;';
    placeholder.innerHTML = '';
    placeholder.appendChild(gifImage);
}

// ================== UI ==================
function updateUI() {
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('total-rounds').textContent = totalRounds;
    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';

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
        bodyImitation: Math.floor(Math.random() * 100),
        facialExpression: Math.floor(Math.random() * 100),
        energyLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
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
        text.textContent = 'Move a bit more! Try to imitate the movements in the video.';
    } else if (movementAnalysisData.emotionalUnderstanding < 50) {
        notice.classList.remove('hidden');
        text.textContent = 'This emotion is a bit complex. Here is a simpler version...';
    } else {
        notice.classList.add('hidden');
    }
}

function resetAnalysis() {
    movementAnalysisData = { bodyImitation: 0, facialExpression: 0, energyLevel: 'Neutral', emotionalUnderstanding: 0 };
}

// ================== ANSWERS ==================
function handleAnswer(selectedName) {
    if (showFeedback) return;
    stopCamera();
    const isCorrect = selectedName === currentEmotion.name;
    const feedbackElement = document.getElementById('feedback');
    const feedbackText = document.getElementById('feedback-text');

    if (isCorrect) {
        score += 20;
        feedbackText.textContent = "Correct! 🎉 Excellent emotional imitation";
        feedbackElement.className = 'feedback correct';
    } else {
        feedbackText.textContent = `Not quite. It was: ${currentEmotion.name}`;
        feedbackElement.className = 'feedback incorrect';
    }

    feedbackElement.classList.remove('hidden');
    showFeedback = true;
    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';

    setTimeout(() => {
        if (currentRound + 1 >= totalRounds) completeGame();
        else { currentRound++; startNewRound(); }
    }, 2500);
}

// ================== NAVIGATION ==================
function goToMainPage() {
    window.location.href = '../../../';
}
