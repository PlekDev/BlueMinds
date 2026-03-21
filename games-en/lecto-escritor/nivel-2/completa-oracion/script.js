// Global variables
let currentRound = 0, score = 0, currentExercise = null;
let userAnswer = '', difficulty = 'normal', wrongAttempts = 0, hintUsed = false;
let startTime = 0, comprehensionLevel = 'Normal', visualMemoryLevel = 'Normal';
let spellingErrors = {};

function levenshteinDistance(a, b) {
    const aL = a.toLowerCase().trim(), bL = b.toLowerCase().trim();
    if (aL === bL) return 0;
    const m = aL.length, n = bL.length;
    const dp = Array(n + 1).fill(null).map(() => Array(m + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (aL[i-1] === bL[j-1]) dp[i][j] = dp[i-1][j-1];
            else dp[i][j] = 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
        }
    }
    return dp[m][n];
}

const exercises = {
    easy: [
        {
            image: 'https://img.freepik.com/vector-premium/lindo-gato-naranja-durmiendo-clipart-ninos-personaje-gato-dibujos-animados_594975-459.jpg',
            before: 'The', after: 'sleeps in the house.',
            correctAnswer: 'cat', alternatives: ['cats', 'dog', 'bird'],
            explanation: 'The image shows a cat sleeping. We complete with the singular word "cat".', wordType: 'noun'
        },
        {
            image: 'https://img.freepik.com/vector-premium/ilustracion-vectorial-dibujos-animados-pajaro-lindo-cantando_869472-1107.jpg',
            before: 'The bird', after: 'on the branch.',
            correctAnswer: 'sings', alternatives: ['sing', 'sang', 'singing'],
            explanation: 'A singular bird needs a singular verb in simple present: "sings".', wordType: 'verb'
        },
        {
            image: 'https://image.freepik.com/vector-gratis/pelota-deportiva-roja-pelota-goma-o-cuero-dibujos-animados-que-ninos-jueguen-al-aire-libre-juegos-ninos-ilustracion-vectorial-plana_81894-5611.jpg',
            before: 'The ball is', after: '.',
            correctAnswer: 'red', alternatives: ['reds', 'blue', 'green'],
            explanation: 'The image shows a red ball. We describe it with the adjective "red".', wordType: 'adjective'
        }
    ],
    normal: [
        {
            image: 'https://image.freepik.com/vector-gratis/ninos-jugando-parque_23-2147584893.jpg',
            before: 'The children', after: 'in the park every day.',
            correctAnswer: 'play', alternatives: ['plays', 'played', 'playing'],
            explanation: '"Children" is plural, so the verb must be "play" (no -s) in simple present.', wordType: 'verb'
        },
        {
            image: 'https://img.freepik.com/vector-premium/dibujo-mariposa-flores-mariposas-flores_730620-512566.jpg',
            before: 'The butterfly', after: 'on the flowers with its beautiful wings.',
            correctAnswer: 'rests', alternatives: ['rest', 'rested', 'resting'],
            explanation: '"Butterfly" is singular. "Rests" is correct for third-person singular present.', wordType: 'verb'
        },
        {
            image: 'https://static.vecteezy.com/system/resources/previews/044/841/151/original/cartoon-elephant-animal-illustration-vector.jpg',
            before: 'The elephant is a', after: 'animal.',
            correctAnswer: 'giant', alternatives: ['tiny', 'small', 'giants'],
            explanation: 'We need a singular adjective that describes the elephant. "Giant" is perfect.', wordType: 'adjective'
        }
    ],
    hard: [
        {
            image: 'https://img.freepik.com/premium-vector/cute-conductor-leading-orchestra-cartoon-vector_1022901-101517.jpg',
            before: 'The orchestra', after: 'a magnificent symphony at the concert hall.',
            correctAnswer: 'performed', alternatives: ['performs', 'perform', 'performing'],
            explanation: 'Past simple "performed" is the right tense to describe a completed past action.', wordType: 'past verb'
        },
        {
            image: 'https://img.freepik.com/vector-premium/ninos-arqueologos-ninos-arqueologia-dibujos-animados-nino-arqueologo-o-paleontologo-historia-excavacion-ninos-que-trabajan-explorando-fosiles-antiguos-suelo-ilustracion-vectorial-reciente_81894-14923.jpg',
            before: 'The researcher', after: 'the artifacts with great scientific precision.',
            correctAnswer: 'examined', alternatives: ['examine', 'examines', 'examining'],
            explanation: 'Past simple "examined" describes a completed action in the past.', wordType: 'past verb'
        },
        {
            image: 'https://static.vecteezy.com/system/resources/previews/005/520/150/non_2x/cartoon-drawing-of-a-construction-worker-vector.jpg',
            before: 'Although the work was', after: ', the team persisted to reach their goal.',
            correctAnswer: 'difficult', alternatives: ['difficultly', 'difficults', 'ease'],
            explanation: '"Difficult" is the correct adjective to describe the work.', wordType: 'adjective'
        }
    ]
};

const totalRounds = 5;

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    startNewRound();
});

function setupEventListeners() {
    document.getElementById('check-button').addEventListener('click', checkAnswer);
    document.getElementById('reset-button').addEventListener('click', resetRound);
    document.getElementById('hint-button').addEventListener('click', showHint);
    document.getElementById('answer-input').addEventListener('input', e => { userAnswer = e.target.value; });
    document.getElementById('answer-input').addEventListener('keypress', e => { if (e.key === 'Enter') checkAnswer(); });
}

function selectDifficultyPool() {
    if (wrongAttempts >= 2) { difficulty = 'easy'; return exercises.easy; }
    if (score >= 70 && currentRound > 2) { difficulty = 'hard'; return exercises.hard; }
    difficulty = 'normal'; return exercises.normal;
}

function startNewRound() {
    const difficultyPool = selectDifficultyPool();
    currentExercise = difficultyPool[Math.floor(Math.random() * difficultyPool.length)];
    userAnswer = ''; wrongAttempts = 0; hintUsed = false; startTime = Date.now();
    updateUI(); updateDifficulty();
}

function updateUI() {
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('total-rounds').textContent = totalRounds;
    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';
    document.getElementById('progress-fill').style.width = ((currentRound + 1) / totalRounds * 100) + '%';
    document.getElementById('exercise-image').src = currentExercise.image;
    document.getElementById('sentence-before').textContent = currentExercise.before + ' ';
    document.getElementById('sentence-after').textContent = ' ' + currentExercise.after;

    const answerInput = document.getElementById('answer-input');
    answerInput.value = '';
    answerInput.classList.remove('correct', 'incorrect');
    answerInput.focus();

    showSuggestions();
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('explanation').classList.add('hidden');
    document.getElementById('spelling-hint').classList.add('hidden');
    document.getElementById('analysis-info').classList.add('hidden');
}

function showSuggestions() {
    const suggestionsList = document.getElementById('suggestions-list');
    suggestionsList.innerHTML = '';
    const allSuggestions = [currentExercise.correctAnswer, ...currentExercise.alternatives].sort(() => Math.random() - 0.5);
    allSuggestions.forEach(word => {
        const button = document.createElement('button');
        button.className = 'suggestion-button';
        button.textContent = word;
        button.addEventListener('click', () => {
            document.getElementById('answer-input').value = word;
            userAnswer = word;
        });
        suggestionsList.appendChild(button);
    });
    document.getElementById('word-suggestions').classList.remove('hidden');
}

function showHint() {
    if (hintUsed) { showFeedback("You already used the hint", false); return; }
    hintUsed = true;
    document.getElementById('spelling-text').textContent =
        `The word starts with "${currentExercise.correctAnswer[0]}" and has ${currentExercise.correctAnswer.length} letters.`;
    document.getElementById('spelling-hint').classList.remove('hidden');
    showFeedback("💡 Hint shown", true);
}

function checkAnswer() {
    const userInputTrimmed = userAnswer.trim();
    if (!userInputTrimmed) { showFeedback("Please write an answer", false); return; }

    const distance = levenshteinDistance(userInputTrimmed, currentExercise.correctAnswer);
    const maxDistance = Math.max(userInputTrimmed.length, currentExercise.correctAnswer.length);
    const isCorrect = (1 - distance / maxDistance) >= 0.85;

    if (isCorrect) {
        const responseTime = (Date.now() - startTime) / 1000;
        let points = hintUsed ? 15 : 20;
        if (responseTime > 30) points = Math.max(10, points - 5);
        score += points;
        showFeedback(`Correct! +${points} points 🎉`, true);
        document.getElementById('answer-input').classList.add('correct');
        analyzePerformance(responseTime);
        setTimeout(() => showExplanation(), 500);

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
        }, 3000);
    } else {
        wrongAttempts++;
        spellingErrors[currentExercise.wordType] = (spellingErrors[currentExercise.wordType] || 0) + 1;
        showFeedback(`Incorrect. The answer is: "${currentExercise.correctAnswer}"`, false);
        document.getElementById('answer-input').classList.add('incorrect');
        updateDifficulty();
    }

    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';
}

function analyzePerformance(responseTime) {
    comprehensionLevel = wrongAttempts === 0 ? 'Excellent' : wrongAttempts === 1 ? 'Normal' : 'Needs support';
    visualMemoryLevel = responseTime < 10 ? 'Excellent' : responseTime < 20 ? 'Normal' : 'Needs practice';
    document.getElementById('comprehension-level').textContent = comprehensionLevel;
    document.getElementById('visual-memory').textContent = visualMemoryLevel;
    document.getElementById('analysis-info').classList.remove('hidden');
}

function showExplanation() {
    document.getElementById('explanation-text').textContent = currentExercise.explanation;
    document.getElementById('explanation').classList.remove('hidden');
}

function resetRound() {
    userAnswer = '';
    const answerInput = document.getElementById('answer-input');
    answerInput.value = '';
    answerInput.classList.remove('correct', 'incorrect');
    answerInput.focus();
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('explanation').classList.add('hidden');
    document.getElementById('spelling-hint').classList.add('hidden');
    document.getElementById('analysis-info').classList.add('hidden');
    wrongAttempts = 0; hintUsed = false; startTime = Date.now();
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
    const errorSummary = Object.entries(spellingErrors).sort((a,b) => b[1]-a[1]).slice(0,2)
        .map(([type, count]) => `${type} (${count})`).join(', ');

    document.querySelector('.completa-card').innerHTML = `
        <h2>Game Complete! 🏆</h2>
        <div class="feedback correct" style="margin-top:20px;"><p><strong>Your final score:</strong> ${score} points</p></div>
        <div class="explanation" style="margin-top:20px;">
            <h3>Performance Summary</h3>
            <p><strong>Reading comprehension:</strong> ${comprehensionLevel}</p>
            <p><strong>Visual memory:</strong> ${visualMemoryLevel}</p>
            ${errorSummary ? `<p><strong>Areas to improve:</strong> ${errorSummary}</p>` : ''}
            <p style="margin-top:10px;font-size:14px;">Keep practicing to improve your writing and comprehension!</p>
        </div>
        <div class="action-controls" style="margin-top:30px;">
            <button class="action-button primary" onclick="location.reload()"><i class="fas fa-redo"></i> Play Again</button>
            <button class="action-button blue" onclick="goToMainPage()"><i class="fas fa-home"></i> Back to Menu</button>
        </div>`;
}

function goToMainPage() {  window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-lecto-escritor.html'; }
