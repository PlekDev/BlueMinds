let currentRound = 0, score = 0, currentEmotion = null, options = [], showFeedbackFlag = false, cameraActive = false;

const emotions = [
    { name: "Happy", color: "primary", gifUrl: "https://i.pinimg.com/originals/20/57/74/2057740a1b96ddb0b0a306b20cf4d666.gif" },
    { name: "Sad",   color: "blue",    gifUrl: "https://cdnl.iconscout.com/lottie/premium/thumb/nina-llorando-a-fuerza-5105643-4277861.gif" },
    { name: "Angry", color: "red",     gifUrl: "https://media.tenor.com/WYkqpAQVImkAAAAM/euphoria-boy.gif" },
];
const totalRounds = 3;

document.addEventListener('DOMContentLoaded', () => startNewRound());

function startNewRound() {
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    currentEmotion = randomEmotion;
    const wrongOptions = emotions.filter(e => e.name !== randomEmotion.name).sort(() => Math.random() - 0.5);
    options = [randomEmotion, ...wrongOptions].sort(() => Math.random() - 0.5);
    showFeedbackFlag = false; cameraActive = false;
    updateUI(); loadGif();
}

function completeGame() {
    document.querySelector('.emotion-card').innerHTML = `
        <h2>Game Complete! 🎉</h2><div style="font-size:80px;margin:30px 0;">😊</div>
        <div class="feedback correct"><p>Your final score: ${score} points</p>
        <p style="font-size:16px;margin-top:10px;">Excellent emotional understanding!</p></div>
        <div class="options-container" style="margin-top:30px;">
            <button class="option-button primary" onclick="location.reload()"><i class="fas fa-redo"></i> Play Again</button>
            <button class="option-button blue" onclick="goToMainPage()"><i class="fas fa-home"></i> Back to Menu</button>
        </div>`;
}

function loadGif() { document.getElementById('emotionGif').src = currentEmotion.gifUrl; }

function updateUI() {
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('total-rounds').textContent = totalRounds;
    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';
    document.getElementById('progress-fill').style.width = ((currentRound + 1) / totalRounds * 100) + '%';
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    options.forEach(emotion => {
        const button = document.createElement('button');
        button.className = `option-button ${emotion.color}`;
        button.textContent = emotion.name;
        button.onclick = () => handleAnswer(emotion.name);
        container.appendChild(button);
    });
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('simpleAnalysis').style.display = 'none';
    document.getElementById('startCameraBtn').style.display = 'inline-block';
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
        document.getElementById('simpleAnalysis').style.display = 'block';
        detectEmotion();
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

function detectEmotion() {
    if (!cameraActive) return;
    const emotionsList = ['Happy', 'Sad', 'Angry'];
    document.getElementById('emotionStatus').textContent = emotionsList[Math.floor(Math.random() * emotionsList.length)];
    setTimeout(detectEmotion, 1000);
}

function handleAnswer(selectedName) {
    if (showFeedbackFlag) return;
    stopCamera();
    const isCorrect = selectedName === currentEmotion.name;
    const feedbackElement = document.getElementById('feedback');
    if (isCorrect) { score += 20; feedbackElement.className = 'feedback correct'; document.getElementById('feedback-text').textContent = "Correct! 🎉"; }
    else { feedbackElement.className = 'feedback incorrect'; document.getElementById('feedback-text').textContent = `It was: ${currentEmotion.name}`; }
    feedbackElement.classList.remove('hidden');
    showFeedbackFlag = true;
    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';
    document.querySelectorAll('.option-button').forEach(btn => btn.disabled = true);
    setTimeout(() => {
        if (currentRound + 1 >= totalRounds) completeGame();
        else { currentRound++; startNewRound(); }
    }, 2000);
}

function goToMainPage() { if (cameraActive) stopCamera(); window.location.href = '../../../../selectores/selector-kinestesico.html'; }
