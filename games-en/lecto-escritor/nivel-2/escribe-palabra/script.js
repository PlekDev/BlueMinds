// Global variables
let currentRound = 0, score = 0, currentWord = null;
let userAnswer = '', difficulty = 'normal', wrongAttempts = 0, hintUsed = false;
let phase = 0, countdownTimer = null, recordedWords = [];

// English word banks
const wordBanks = {
    easy: [
        { word: 'cat',   image: 'https://static.vecteezy.com/system/resources/previews/013/089/641/original/illustration-of-cute-colored-cat-cat-cartoon-image-in-eps10-format-suitable-for-children-s-book-design-elements-introduction-of-cats-to-children-books-or-posters-about-animal-vector.jpg' },
        { word: 'sun',   image: 'https://static.vecteezy.com/system/resources/previews/018/800/828/original/cartoon-bright-sun-icon-png.png' },
        { word: 'house', image: 'https://static.vecteezy.com/system/resources/previews/006/986/358/original/house-illustration-cartoon-vector.jpg' },
        { word: 'water', image: 'https://static.vecteezy.com/system/resources/previews/012/781/853/non_2x/cute-water-drop-cartoon-character-giving-water-bottle-free-vector.jpg' },
        { word: 'flower',image: 'https://cdn.pixabay.com/photo/2022/12/13/05/16/flowers-7652496_1280.png' },
    ],
    normal: [
        { word: 'butterfly',  image: 'https://static.vecteezy.com/system/resources/previews/014/655/698/original/butterfly-icon-cartoon-style-vector.jpg' },
        { word: 'telephone',  image: 'https://static.vecteezy.com/system/resources/previews/011/157/544/large_2x/mobile-phone-cartoon-icon-illustration-technology-object-icon-concept-isolated-premium-flat-cartoon-style-vector.jpg' },
        { word: 'bicycle',    image: 'https://static.vecteezy.com/system/resources/previews/005/239/753/non_2x/bicycle-cartoon-illustration-free-vector.jpg' },
        { word: 'dinosaur',   image: 'https://static.vecteezy.com/system/resources/previews/009/877/405/original/cute-little-triceratops-dinosaur-cartoon-sitting-vector.jpg' },
        { word: 'mountain',   image: 'https://img.freepik.com/vector-premium/dibujo-dibujos-animados-montana-cielo-azul-campo-hierba-verde_1084749-7629.jpg' },
    ],
    hard: [
        { word: 'extraordinary',  image: 'https://img.freepik.com/vector-premium/persona-emocionada-asombrada-que-reacciona-algo-inesperado-concepto-efecto-guau-mujer-feliz-mirando-algo-increible-alegria-extasis-reaccion-ilustracion-vectorial-plana-aislada-sobre-fondo-blanco_198278-15226.jpg' },
        { word: 'hippopotamus',   image: 'https://static.vecteezy.com/system/resources/previews/005/561/609/non_2x/hippo-cartoon-colored-illustration-free-vector.jpg' },
        { word: 'investigator',   image: 'https://img.freepik.com/vector-premium/lindo-chico-detective-lupa-ilustraciones-vectoriales-dibujos-animados_1057-118480.jpg' },
        { word: 'architecture',   image: 'https://img.freepik.com/vector-premium/arquitecto-trabajando-construccion_75487-439.jpg' },
        { word: 'library',        image: 'https://img.freepik.com/vector-premium/ninos-dibujos-animados-que-estudian-biblioteca_29190-5145.jpg' },
    ]
};

const totalRounds = 5;

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    showStartPhase();
});

function setupEventListeners() {
    document.getElementById('start-button').addEventListener('click', startNewRound);
    document.getElementById('check-button').addEventListener('click', checkAnswer);
    document.getElementById('reset-button').addEventListener('click', resetRound);
    document.getElementById('hint-button').addEventListener('click', showHint);
    document.getElementById('write-input').addEventListener('keypress', e => { if (e.key === 'Enter') checkAnswer(); });
}

function showStartPhase() {
    document.getElementById('phase1').classList.add('hidden');
    document.getElementById('phase2').classList.add('hidden');
    document.getElementById('start-button').style.display = 'inline-flex';
    document.getElementById('check-button').style.display = 'none';
    document.getElementById('hint-button').style.display = 'none';
    document.getElementById('reset-button').style.display = 'none';
    updateUI();
}

function selectWordBank() {
    if (wrongAttempts >= 2) { difficulty = 'easy'; return wordBanks.easy; }
    if (score >= 70 && currentRound > 2) { difficulty = 'hard'; return wordBanks.hard; }
    difficulty = 'normal'; return wordBanks.normal;
}

function startNewRound() {
    const wordBank = selectWordBank();
    currentWord = wordBank[Math.floor(Math.random() * wordBank.length)];
    userAnswer = ''; wrongAttempts = 0; hintUsed = false;
    recordedWords.push({ word: currentWord.word, length: currentWord.word.length });
    updateUI();
    showPhase1();
}

function updateUI() {
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';
    document.getElementById('progress-fill').style.width = ((currentRound + 1) / totalRounds * 100) + '%';
    updateDifficulty();
}

function showPhase1() {
    document.getElementById('phase1').classList.remove('hidden');
    document.getElementById('phase2').classList.add('hidden');
    document.getElementById('start-button').style.display = 'none';
    document.getElementById('check-button').style.display = 'none';
    document.getElementById('hint-button').style.display = 'none';
    document.getElementById('reset-button').style.display = 'none';
    document.getElementById('phase1-image').src = currentWord.image;
    document.getElementById('word-display').textContent = currentWord.word;
    phase = 1;
    startCountdown(3);
}

function startCountdown(seconds) {
    let remaining = seconds;
    document.getElementById('countdown').textContent = remaining;
    const endTime = Date.now() + (seconds * 1000);
    const updateCountdown = () => {
        const timeLeft = Math.max(0, endTime - Date.now());
        remaining = Math.ceil(timeLeft / 1000);
        document.getElementById('countdown').textContent = remaining;
        document.getElementById('countdown-fill').style.width = (timeLeft / (seconds * 1000) * 100) + '%';
        if (timeLeft > 0) countdownTimer = setTimeout(updateCountdown, 50);
        else showPhase2();
    };
    updateCountdown();
}

function showPhase2() {
    document.getElementById('phase1').classList.add('hidden');
    document.getElementById('phase2').classList.remove('hidden');
    document.getElementById('start-button').style.display = 'none';
    document.getElementById('check-button').style.display = 'inline-flex';
    document.getElementById('hint-button').style.display = 'inline-flex';
    document.getElementById('reset-button').style.display = 'inline-flex';

    const input = document.getElementById('write-input');
    input.value = ''; input.classList.remove('correct', 'incorrect'); input.focus();

    document.getElementById('word-length-info').textContent = `Length: ${currentWord.word.length} letters`;
    const complexity = currentWord.word.length <= 4 ? 'Easy' : currentWord.word.length <= 8 ? 'Normal' : 'Difficult';
    document.getElementById('word-complexity-info').textContent = `Difficulty: ${complexity}`;
    document.getElementById('word-difficulty').classList.remove('hidden');

    phase = 2;
    document.getElementById('feedback').classList.add('hidden');
}

function showHint() {
    if (hintUsed) { showFeedback("You already used the hint", false); return; }
    hintUsed = true;
    const word = currentWord.word;
    const hintsList = document.getElementById('hints-list');
    hintsList.innerHTML = '';
    for (let i = 0; i < word.length; i++) {
        const letterDiv = document.createElement('div');
        letterDiv.className = 'hint-letter';
        letterDiv.textContent = (i === 0 || i === word.length - 1) ? word[i] : '?';
        hintsList.appendChild(letterDiv);
    }
    document.getElementById('letter-hints').classList.remove('hidden');
    showFeedback("💡 First and last letters shown", true);
}

function levenshteinDistance(a, b) {
    const aL = a.toLowerCase().trim(), bL = b.toLowerCase().trim();
    if (aL === bL) return 0;
    const m = aL.length, n = bL.length;
    const dp = Array(n+1).fill(null).map(() => Array(m+1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
        if (aL[i-1] === bL[j-1]) dp[i][j] = dp[i-1][j-1];
        else dp[i][j] = 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
    return dp[m][n];
}

function checkAnswer() {
    userAnswer = document.getElementById('write-input').value.trim();
    if (!userAnswer) { showFeedback("Please write a word", false); return; }

    const distance = levenshteinDistance(userAnswer, currentWord.word);
    const maxDistance = Math.max(userAnswer.length, currentWord.word.length);
    const isCorrect = (1 - distance / maxDistance) >= 0.85;

    if (isCorrect) {
        let points = hintUsed ? 15 : 20;
        if (wrongAttempts > 0) points = Math.max(10, points - wrongAttempts * 5);
        score += points;
        showFeedback(`Correct! "${currentWord.word}" +${points} points 🎉`, true);
        document.getElementById('write-input').classList.add('correct');

        document.getElementById('check-button').disabled = true;
        document.getElementById('reset-button').disabled = true;
        document.getElementById('hint-button').disabled = true;

        setTimeout(() => {
            if (currentRound + 1 >= totalRounds) completeGame();
            else {
                currentRound++;
                startNewRound();
                document.getElementById('check-button').disabled = false;
                document.getElementById('reset-button').disabled = false;
                document.getElementById('hint-button').disabled = false;
            }
        }, 2500);
    } else {
        wrongAttempts++;
        showFeedback(`Incorrect. The word was: "${currentWord.word}"`, false);
        document.getElementById('write-input').classList.add('incorrect');
        updateDifficulty();
    }

    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';
}

function resetRound() {
    document.getElementById('write-input').value = '';
    document.getElementById('write-input').classList.remove('correct', 'incorrect');
    document.getElementById('write-input').focus();
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('letter-hints').classList.add('hidden');
    wrongAttempts = 0; hintUsed = false; userAnswer = '';
}

function showFeedback(message, isCorrect) {
    const el = document.getElementById('feedback');
    el.textContent = message;
    el.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
    el.classList.remove('hidden');
}

function updateDifficulty() {
    const d = wrongAttempts >= 2 ? 'easy' : (score >= 70 && currentRound > 2 ? 'hard' : 'normal');
    document.getElementById('difficulty-badge').textContent = { easy: '🎯 Easy', normal: 'Normal', hard: '⭐ Advanced' }[d];
}

function completeGame() {
    const avgLength = (recordedWords.reduce((sum, w) => sum + w.length, 0) / recordedWords.length).toFixed(1);
    document.querySelector('.escribe-card').innerHTML = `
        <h2>Game Complete! 🏆</h2>
        <div class="feedback correct" style="margin-top:20px;"><p><strong>Your final score:</strong> ${score} points</p></div>
        <div class="explanation" style="margin-top:20px;">
            <h3>Word Statistics</h3>
            <p><strong>Average length:</strong> ${avgLength} letters</p>
            <p><strong>Final level:</strong> ${difficulty === 'easy' ? 'Easy 🎯' : difficulty === 'hard' ? 'Advanced ⭐' : 'Normal'}</p>
            <p style="margin-top:10px;font-size:14px;">Excellent work memorizing and writing words!</p>
        </div>
        <div class="action-controls" style="margin-top:30px;">
            <button class="action-button primary" onclick="location.reload()"><i class="fas fa-redo"></i> Play Again</button>
            <button class="action-button blue" onclick="goToMainPage()"><i class="fas fa-home"></i> Back to Menu</button>
        </div>`;
}

function goToMainPage() {  window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-lecto-escritor.html'; }
