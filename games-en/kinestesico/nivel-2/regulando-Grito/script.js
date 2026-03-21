// Global variables
let currentRound = 0;
let score = 0;
let cameraActive = false;
let breathingActive = false;
let analysisActive = false;
let anxietyLevel = 0;
let breathingDuration = 4;
let regulationAnalysis = { voiceVolume: 0, breathRate: 0, detectedAnxiety: 'Low', selfControl: 0 };

const totalRounds = 3;
let analysisInterval = null;
const breathingPhases = ['Breathe in', 'Hold', 'Breathe out', 'Hold'];
const breathingDurations = [4, 4, 4, 4];

// ================== INITIALIZATION ==================
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    startNewRound();
});

function setupEventListeners() {
    document.getElementById('angryBtn').addEventListener('click', () => selectCharacter('angry'));
    document.getElementById('calmBtn').addEventListener('click', () => selectCharacter('calm'));
    document.getElementById('continue-button').addEventListener('click', continueToNextRound);
}

// ================== ROUNDS ==================
function startNewRound() {
    anxietyLevel = 20 + Math.random() * 30;
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
        <h2>Activity Complete! 🎉</h2>
        <div style="text-align:center;margin:30px 0;">
            <div style="font-size:100px;margin-bottom:20px;">😌</div>
            <div style="font-size:80px;">🌿</div>
        </div>
        <div class="feedback correct">
            <p style="font-size:28px;margin:20px 0;">Your final score: ${score} points</p>
            <p style="font-size:16px;">Excellent emotional regulation and self-control!</p>
        </div>
        <div class="action-controls">
            <button class="action-button primary" onclick="location.reload()"><i class="fas fa-redo"></i> Play Again</button>
            <button class="action-button primary" onclick="goToMainPage()"><i class="fas fa-home"></i> Back to Menu</button>
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

    updateAnxietyIndicator();
    document.getElementById('breathingGuide').style.display = 'none';
    document.getElementById('analysisSection').style.display = 'none';
    document.getElementById('cameraSection').style.display = 'none';
}

function updateAnxietyIndicator() {
    const percentage = Math.min(100, anxietyLevel);
    document.getElementById('anxietyBar').style.width = percentage + '%';
    let level = 'Low';
    if (percentage > 70) level = 'High';
    else if (percentage > 40) level = 'Medium';
    document.getElementById('anxietyLevel').textContent = level;
}

// ================== CHARACTER SELECTION ==================
function selectCharacter(choice) {
    const isCorrect = choice === 'calm';
    document.getElementById('angryBtn').disabled = true;
    document.getElementById('calmBtn').disabled = true;

    const feedbackElement = document.getElementById('feedback');
    const feedbackText = document.getElementById('feedback-text');

    if (isCorrect) {
        score += 10;
        feedbackText.textContent = 'Correct! This child is calm. 😊';
        feedbackElement.className = 'feedback correct';
        setTimeout(() => startBreathingGuide(), 500);
    } else {
        feedbackText.textContent = 'No, that child is angry. Try the other one. 😠';
        feedbackElement.className = 'feedback incorrect';
        setTimeout(() => {
            document.getElementById('angryBtn').disabled = false;
            document.getElementById('calmBtn').disabled = false;
        }, 2000);
    }

    feedbackElement.classList.remove('hidden');
    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';
}

// ================== BREATHING GUIDE ==================
function startBreathingGuide() {
    document.getElementById('breathingGuide').style.display = 'block';
    document.getElementById('analysisSection').style.display = 'block';
    document.getElementById('cameraSection').style.display = 'block';
    breathingActive = true;
    analysisActive = true;
    performBreathingCycle();
}

async function performBreathingCycle() {
    const cycles = 3;
    for (let cycle = 0; cycle < cycles; cycle++) {
        for (let phase = 0; phase < 4; phase++) {
            if (!breathingActive) return;
            const phaseText = breathingPhases[phase];
            const phaseDuration = breathingDurations[phase];
            document.getElementById('breathInstruction').textContent = phaseText;
            document.getElementById('breathDuration').textContent = `${phaseText}: ${phaseDuration} seconds`;
            startBreathingAnalysis(phaseDuration);
            await new Promise(resolve => setTimeout(resolve, phaseDuration * 1000));
        }
    }
    breathingActive = false;
    document.getElementById('breathInstruction').textContent = 'Well done 😊';
    setTimeout(() => { document.getElementById('continue-button').style.display = 'inline-flex'; }, 1000);
}

// ================== BREATHING ANALYSIS ==================
function startBreathingAnalysis(duration) {
    if (!analysisActive) return;
    const startTime = Date.now();
    const analysisCheck = setInterval(() => {
        if (!analysisActive) { clearInterval(analysisCheck); return; }
        if ((Date.now() - startTime) / 1000 >= duration) { clearInterval(analysisCheck); return; }

        const voiceVolume = 30 + Math.random() * 40;
        const breathRate = 40 + Math.random() * 50;
        const selfControl = 60 + Math.random() * 35;

        regulationAnalysis.voiceVolume = Math.round(voiceVolume);
        regulationAnalysis.breathRate = Math.round(breathRate);
        regulationAnalysis.selfControl = Math.round(selfControl);

        const detectedAnxietyValue = Math.max(0, 100 - breathRate);
        anxietyLevel = Math.max(0, anxietyLevel - 5);

        if (detectedAnxietyValue > 70) regulationAnalysis.detectedAnxiety = 'High';
        else if (detectedAnxietyValue > 40) regulationAnalysis.detectedAnxiety = 'Medium';
        else regulationAnalysis.detectedAnxiety = 'Low';

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
        text.textContent = '⚠️ High anxiety detected. A pause is recommended...';
        if (breathingDuration < 6) breathingDuration = 6;
    } else if (regulationAnalysis.voiceVolume > 70) {
        notice.classList.remove('hidden');
        text.textContent = '💡 Your voice is very loud. Try speaking more softly...';
    } else if (regulationAnalysis.breathRate < 50) {
        notice.classList.remove('hidden');
        text.textContent = '🫁 Breathe more deeply. Follow the guide rhythm...';
    } else {
        notice.classList.add('hidden');
    }
}

function resetAnalysis() {
    regulationAnalysis = { voiceVolume: 0, breathRate: 0, detectedAnxiety: 'Low', selfControl: 0 };
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
    } catch (err) { alert('Could not access the camera: ' + err.message); }
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

// ================== CONTINUE ==================
function continueToNextRound() {
    stopCamera();
    breathingActive = false;
    analysisActive = false;
    const regulationBonus = Math.round((regulationAnalysis.selfControl + regulationAnalysis.breathRate) / 2 / 10);
    score += regulationBonus;
    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';
    if (currentRound + 1 >= totalRounds) completeGame();
    else { currentRound++; startNewRound(); }
}

// ================== NAVIGATION ==================
function goToMainPage() {
    if (cameraActive) stopCamera();
    window.location.href = '../../../../selectores/selector-kinestesico.html';
}
