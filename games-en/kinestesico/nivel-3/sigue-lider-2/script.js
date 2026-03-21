let currentRound = 0, score = 0, currentMovement = null, isShowingMovement = false, hasPlayed = false, cameraActive = false, movementDetected = 0;

const movements = [
    { name: "Raise your arms",  instruction: "raise your arms up high",   animation: "raise-arms" },
    { name: "Lower your arms",  instruction: "lower your arms down",       animation: "lower-arms" },
    { name: "Jump",             instruction: "jump up high",               animation: "jump" },
    { name: "Celebrate",        instruction: "celebrate with joy",         animation: "celebrate" },
];
const totalRounds = 3;

document.addEventListener('DOMContentLoaded', () => { setupEventListeners(); startNewRound(); });

function setupEventListeners() {
    document.getElementById('play-button').addEventListener('click', showMovement);
    document.getElementById('done-button').addEventListener('click', completeMovement);
}

function startNewRound() {
    const randomMovement = movements[Math.floor(Math.random() * movements.length)];
    currentMovement = randomMovement; hasPlayed = false; isShowingMovement = false; movementDetected = 0;
    updateUI();
}

function completeGame() {
    document.querySelector('.movement-card').innerHTML = `
        <h2>Activity Complete! 🎉</h2>
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
            <p style="font-size:16px;">Excellent motor coordination!</p>
        </div>
        <div class="action-controls">
            <button class="action-button primary" onclick="location.reload()"><i class="fas fa-redo"></i> Play Again</button>
            <button class="action-button blue" onclick="goToMainPage()"><i class="fas fa-home"></i> Back</button>
        </div>`;
}

function updateUI() {
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('total-rounds').textContent = totalRounds;
    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';
    document.getElementById('progress-fill').style.width = ((currentRound + 1) / totalRounds * 100) + '%';
    document.getElementById('avatar-leader').className = 'avatar leader';
    document.getElementById('instruction-text').textContent = "Listen to the instruction";
    const pb = document.getElementById('play-button');
    pb.innerHTML = '<i class="fas fa-play"></i> Show Movement'; pb.disabled = false;
    document.getElementById('done-button').disabled = true;
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('simpleAnalysis').style.display = 'none';
}

function showMovement() {
    if (isShowingMovement) return;
    isShowingMovement = true; hasPlayed = true;
    const pb = document.getElementById('play-button');
    pb.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Showing...'; pb.disabled = true;
    document.getElementById('instruction-text').textContent = currentMovement.name;
    document.getElementById('avatar-leader').classList.add(currentMovement.animation);
    const utterance = new SpeechSynthesisUtterance(currentMovement.instruction);
    utterance.lang = 'en-US'; utterance.rate = 0.9; speechSynthesis.speak(utterance);
    setTimeout(() => {
        pb.innerHTML = '<i class="fas fa-redo"></i> Repeat'; pb.disabled = false;
        document.getElementById('done-button').disabled = false; isShowingMovement = false;
    }, 2000);
}

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.getElementById('cameraFeed');
        video.srcObject = stream; video.style.display = 'block';
        document.getElementById('cameraPlaceholder').style.display = 'none';
        document.getElementById('startCameraBtn').style.display = 'none';
        document.getElementById('stopCameraBtn').style.display = 'inline-block';
        cameraActive = true; video.play();
        analyzeMovement(); document.getElementById('simpleAnalysis').style.display = 'block';
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

function analyzeMovement() {
    if (!cameraActive) return;
    movementDetected = Math.floor(50 + Math.random() * 50);
    document.getElementById('movementDetected').textContent = movementDetected + '%';
    setTimeout(analyzeMovement, 1500);
}

function completeMovement() {
    if (!hasPlayed) return;
    stopCamera();
    const isCorrect = movementDetected > 60;
    const feedbackElement = document.getElementById('feedback');
    if (isCorrect) { score += 20; document.getElementById('feedback-text').textContent = "Excellent! 🎉 Well done"; feedbackElement.className = 'feedback correct'; }
    else { document.getElementById('feedback-text').textContent = "Almost! Try again"; feedbackElement.className = 'feedback incorrect'; }
    feedbackElement.classList.remove('hidden');
    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';
    document.getElementById('play-button').disabled = true;
    document.getElementById('done-button').disabled = true;
    setTimeout(() => {
        if (currentRound + 1 >= totalRounds) completeGame();
        else { currentRound++; startNewRound(); }
    }, 2000);
}

function goToMainPage() { if (cameraActive) stopCamera(); window.location.href = '../../../../selectores/selector-kinestesico.html';}
