// ========================
// ADAPTIVE AUDITORY MEMORY ANALYZER (Word Chain 2)
// ========================

class AdaptiveAuditoryMemoryAnalyzer {
    constructor() {
        this.sessionStats = {
            totalAttempts: 0, correctAttempts: 0, totalTime: 0,
            averageAccuracy: 0, memoryScore: 0, processingSpeed: 0,
            auditoryMemoryScore: 0, orderingAccuracy: 0
        };
        this.attempts = [];
        this.difficultyLevel = 1;
        this.speedMultiplier = 0.7;
        this.showVisualCues = false;
    }

    analyze(expectedSequence, selectedSequence, timeElapsed) {
        const isCorrect = JSON.stringify(expectedSequence) === JSON.stringify(selectedSequence);
        let partialMatches = 0;
        for (let i = 0; i < Math.min(expectedSequence.length, selectedSequence.length); i++) {
            if (expectedSequence[i] === selectedSequence[i]) partialMatches++;
            else break;
        }
        const accuracy = (partialMatches / expectedSequence.length) * 100;
        const processingSpeed = timeElapsed / expectedSequence.length;
        const score = this.generateScore(accuracy, isCorrect, processingSpeed, selectedSequence.length);

        const attempt = { timestamp: new Date(), expectedSequence, selectedSequence, isCorrect, accuracy, partialMatches, timeElapsed, processingSpeed, score };
        this.attempts.push(attempt);
        this.updateSessionStats(attempt);
        this.adaptDifficulty();

        return {
            isCorrect, accuracy, partialMatches, score, timeElapsed, processingSpeed,
            feedback: this.generateFeedback(isCorrect, accuracy, partialMatches, expectedSequence.length),
            analysis: this.generateAnalysis(attempt),
            nextDifficulty: this.getNextDifficulty()
        };
    }

    generateScore(accuracy, isCorrect, processingSpeed, sequenceLength) {
        let baseScore = accuracy;
        if (isCorrect) baseScore += 20;
        if (processingSpeed < 2000) baseScore += 10;
        else if (processingSpeed < 5000) baseScore += 5;
        if (sequenceLength === 4) baseScore += 5;
        else if (sequenceLength === 5) baseScore += 10;
        return Math.min(100, Math.round(baseScore));
    }

    generateFeedback(isCorrect, accuracy, partialMatches, totalWords) {
        let emoji = '', message = '', details = [];
        if (isCorrect) {
            emoji = '🎉'; message = 'Perfect! Correct order!';
            details.push('You remembered all the words in order');
        } else if (accuracy >= 75) {
            emoji = '👍'; message = 'Great, almost there!';
            details.push('You got ' + partialMatches + ' of ' + totalWords + ' words right');
            details.push('Try again with more attention');
        } else if (accuracy >= 50) {
            emoji = '📝'; message = 'Keep practicing!';
            details.push('You remembered ' + partialMatches + ' words');
            details.push('Listen again carefully');
        } else {
            emoji = '💪'; message = 'Keep trying!';
            details.push('Auditory memory improves with practice');
            details.push('Press "Repeat" to try again');
        }
        return { emoji, message, details };
    }

    generateAnalysis(attempt) {
        return {
            exactness: attempt.isCorrect ? 'Exact' : 'Incomplete',
            memorized: attempt.partialMatches + '/' + attempt.expectedSequence.length,
            responseTime: Math.round(attempt.timeElapsed) + 'ms',
            processingSpeed: Math.round(attempt.processingSpeed) + 'ms/word',
            score: attempt.score
        };
    }

    updateSessionStats(attempt) {
        this.sessionStats.totalAttempts++;
        if (attempt.isCorrect) this.sessionStats.correctAttempts++;
        this.sessionStats.totalTime += attempt.timeElapsed;
        this.sessionStats.averageAccuracy =
            (this.sessionStats.averageAccuracy * (this.sessionStats.totalAttempts - 1) + attempt.accuracy) / this.sessionStats.totalAttempts;
        this.sessionStats.memoryScore = (this.sessionStats.correctAttempts / this.sessionStats.totalAttempts) * 100;
        this.sessionStats.auditoryMemoryScore = this.sessionStats.memoryScore;
        this.sessionStats.orderingAccuracy = this.sessionStats.averageAccuracy;
    }

    adaptDifficulty() {
        if (this.sessionStats.totalAttempts < 2) return;
        const memoryScore = this.sessionStats.auditoryMemoryScore;
        if (memoryScore >= 85) {
            this.difficultyLevel = Math.min(5, this.difficultyLevel + 0.5);
            this.speedMultiplier = Math.max(0.7, this.speedMultiplier - 0.05);
            this.showVisualCues = false;
        } else if (memoryScore >= 70) {
            this.difficultyLevel = Math.max(1, this.difficultyLevel);
            this.speedMultiplier = 0.85; this.showVisualCues = false;
        } else if (memoryScore >= 50) {
            this.difficultyLevel = Math.max(1, this.difficultyLevel - 0.3);
            this.speedMultiplier = Math.min(0.95, this.speedMultiplier + 0.05);
            this.showVisualCues = true;
        } else {
            this.difficultyLevel = Math.max(1, this.difficultyLevel - 0.5);
            this.speedMultiplier = 1.0; this.showVisualCues = true;
        }
    }

    getNextDifficulty() {
        return {
            level: Math.round(this.difficultyLevel * 10) / 10,
            speedMultiplier: this.speedMultiplier,
            showVisualCues: this.showVisualCues,
            recommendation: this.generateRecommendation()
        };
    }

    generateRecommendation() {
        if (this.sessionStats.auditoryMemoryScore >= 85) return 'Excellent memory! Increasing difficulty.';
        if (this.sessionStats.auditoryMemoryScore >= 70) return 'Good memory. Keep it up!';
        if (this.sessionStats.auditoryMemoryScore >= 50) return 'Memory developing. Showing visual cues.';
        return 'Memory training. Slowing down.';
    }

    getSessionReport() {
        return {
            totalAttempts: this.sessionStats.totalAttempts,
            correctAttempts: this.sessionStats.correctAttempts,
            averageAccuracy: Math.round(this.sessionStats.averageAccuracy),
            memoryScore: Math.round(this.sessionStats.memoryScore),
            auditoryMemoryScore: Math.round(this.sessionStats.auditoryMemoryScore),
            orderingAccuracy: Math.round(this.sessionStats.orderingAccuracy),
            averageResponseTime: Math.round(this.sessionStats.totalTime / Math.max(1, this.sessionStats.totalAttempts))
        };
    }
}

// ========================
// GAME VARIABLES
// ========================

let currentRound = 0;
let score = 0;
let sequenceLength = 3;
let currentSequence = [];
let selectedSequence = [];
let allWords = [];
let gameStarted = false;
let isAnalyzing = false;
let roundStartTime = 0;

const analyzer = new AdaptiveAuditoryMemoryAnalyzer();
const totalRounds = 5;

// English word database with images
const wordDatabase = {
    'apple':      'https://img.freepik.com/vector-premium/dibujos-animados-clipart-manzana-dibujo-ilustracion_871209-13267.jpg?w=2000',
    'pear':       'https://img.freepik.com/vector-gratis/fruta-pera-aislada-sobre-fondo-blanco_1308-117166.jpg?semt=ais_hybrid&w=740',
    'grapes':     'https://static.vecteezy.com/system/resources/previews/021/964/649/large_2x/grapes-fruit-cartoon-colored-clipart-illustration-free-vector.jpg',
    'banana':     'https://static.vecteezy.com/system/resources/previews/004/557/519/original/fruit-banana-cartoon-object-vector.jpg',
    'orange':     'https://img.freepik.com/vector-premium/ilustracion-vectorial-dibujos-animados-color-naranja_871209-3168.jpg?w=2000',
    'strawberry': 'https://i.pinimg.com/originals/c8/32/6a/c8326ac10514ba82a4ee79bcd8992c17.jpg',
    'watermelon': 'https://static.vecteezy.com/system/resources/previews/007/570/246/original/cartoon-watermelon-slice-fruits-vector.jpg',
    'lemon':      'https://static.vecteezy.com/system/resources/previews/004/485/242/original/lemon-fruit-illustrations-free-vector.jpg'
};

// ========================
// INITIALIZATION
// ========================

document.addEventListener('DOMContentLoaded', function () {
    startNewRound();
});

function startNewRound() {
    speechSynthesis.cancel();

    const nextDifficulty = analyzer.getNextDifficulty();
    sequenceLength = Math.floor(3 + nextDifficulty.level);
    sequenceLength = Math.min(sequenceLength, 6);
    sequenceLength = Math.max(sequenceLength, 3);

    clearSelection();
    document.getElementById('feedback').classList.remove('show');
    document.getElementById('feedback').style.display = 'none';

    updateUI();
    generateNewSequence();
    gameStarted = false;
    selectedSequence = [];
    updateSelectedSequence();

    const imagesGrid = document.getElementById('images-grid');
    imagesGrid.style.opacity = '1';
    imagesGrid.style.pointerEvents = 'auto';

    document.getElementById('play-button').style.display = 'inline-flex';
    document.getElementById('repeat-button').style.display = 'none';
    document.getElementById('check-button').style.display = 'none';
}

function updateUI() {
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('total-rounds').textContent = totalRounds;
    document.getElementById('current-score-val').textContent = score;

    const progress = ((currentRound + 1) / totalRounds) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';

    const badgeElement = document.getElementById('difficulty-badge');
    const nextDifficulty = analyzer.getNextDifficulty();
    badgeElement.textContent = 'Adaptive Difficulty: ' + (Math.round(nextDifficulty.level * 10) / 10) + ' ★';
    badgeElement.className = 'difficulty-badge adaptive';

    document.getElementById('instruction-text').textContent =
        'Listen to ' + sequenceLength + ' words and select images in order • ' + nextDifficulty.recommendation;
}

function generateNewSequence() {
    const keys = Object.keys(wordDatabase);
    currentSequence = [];
    while (currentSequence.length < sequenceLength) {
        const randomWord = keys[Math.floor(Math.random() * keys.length)];
        if (!currentSequence.includes(randomWord)) currentSequence.push(randomWord);
    }
    allWords = [...currentSequence];
    while (allWords.length < 4) {
        const randomWord = keys[Math.floor(Math.random() * keys.length)];
        if (!allWords.includes(randomWord)) allWords.push(randomWord);
    }
    allWords = allWords.sort(() => Math.random() - 0.5);
    renderImages();
}

function renderImages() {
    const grid = document.getElementById('images-grid');
    grid.innerHTML = '';
    allWords.forEach((word, index) => {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.setAttribute('data-index', index + 1);
        card.innerHTML = `
            <img src="${wordDatabase[word]}" alt="${word}">
            <div class="image-label">${word}</div>
            <div class="visual-cue" style="display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:48px;">•</div>
        `;
        card.addEventListener('click', () => selectImage(word, card));
        grid.appendChild(card);
    });
}

function showVisualCuesIfNeeded() {
    if (!analyzer.showVisualCues) return;
    const cards = document.querySelectorAll('.image-card');
    let delay = 500;
    currentSequence.forEach((word, index) => {
        setTimeout(() => {
            cards.forEach(card => {
                if (card.querySelector('.image-label').textContent === word) {
                    const cue = card.querySelector('.visual-cue');
                    cue.style.display = 'block';
                    cue.style.color = ['#FF6B6B','#4ECDC4','#45B7D1','#FFA07A','#98D8C8','#F7DC6F'][index % 6];
                    setTimeout(() => { cue.style.display = 'none'; }, 800);
                }
            });
        }, delay);
        delay += 1500;
    });
}

function selectImage(word, element) {
    if (isAnalyzing || !gameStarted) return;
    if (selectedSequence.includes(word)) {
        selectedSequence = selectedSequence.filter(w => w !== word);
        element.classList.remove('selected');
    } else {
        if (selectedSequence.length < sequenceLength) {
            selectedSequence.push(word);
            element.classList.add('selected');
        }
    }
    updateSelectedSequence();
    document.getElementById('check-button').style.display = selectedSequence.length === sequenceLength ? 'inline-flex' : 'none';
}

function updateSelectedSequence() {
    const container = document.getElementById('selected-items');
    if (selectedSequence.length === 0) {
        container.innerHTML = '<span style="color:#9CA3AF;">Select the images in order</span>';
        return;
    }
    container.innerHTML = selectedSequence.map((word, index) => `
        <div class="selected-item">${index + 1}. ${word}
            <button class="remove-btn" onclick="removeFromSelection(${index})">×</button>
        </div>`).join('');
}

function removeFromSelection(index) {
    selectedSequence.splice(index, 1);
    updateSelectedSequence();
    document.querySelectorAll('.image-card').forEach(card => card.classList.remove('selected', 'incorrect'));
    selectedSequence.forEach(word => {
        document.querySelectorAll('.image-card').forEach(card => {
            if (card.querySelector('.image-label').textContent === word) card.classList.add('selected');
        });
    });
    document.getElementById('check-button').style.display = 'none';
}

function clearSelection() {
    selectedSequence = [];
    updateSelectedSequence();
    document.querySelectorAll('.image-card').forEach(card => card.classList.remove('selected', 'incorrect'));
    document.getElementById('check-button').style.display = 'none';
}

function playSequence() {
    if (gameStarted) return;
    gameStarted = true;
    roundStartTime = performance.now();
    const imagesGrid = document.getElementById('images-grid');
    imagesGrid.style.opacity = '0';
    imagesGrid.style.pointerEvents = 'none';
    const nextDifficulty = analyzer.getNextDifficulty();
    playSequenceAudio(currentSequence, 0, nextDifficulty.speedMultiplier);
}

function playSequenceAudio(words, index, speechRate) {
    if (index >= words.length) {
        const imagesGrid = document.getElementById('images-grid');
        imagesGrid.style.opacity = '1';
        imagesGrid.style.pointerEvents = 'auto';
        imagesGrid.style.transition = 'opacity 0.5s ease';
        document.getElementById('repeat-button').style.display = 'inline-flex';
        if (analyzer.showVisualCues) setTimeout(() => showVisualCuesIfNeeded(), 500);
        return;
    }
    const utterance = new SpeechSynthesisUtterance(words[index]);
    utterance.lang = 'en-US';
    utterance.rate = speechRate;
    utterance.pitch = 1;
    utterance.onend = () => setTimeout(() => playSequenceAudio(words, index + 1, speechRate), 800);
    speechSynthesis.speak(utterance);
}

function repeatSequence() {
    clearSelection();
    const imagesGrid = document.getElementById('images-grid');
    imagesGrid.style.opacity = '0';
    imagesGrid.style.pointerEvents = 'none';
    gameStarted = true;
    roundStartTime = performance.now();
    const nextDifficulty = analyzer.getNextDifficulty();
    playSequenceAudio(currentSequence, 0, nextDifficulty.speedMultiplier);
}

function checkAnswer() {
    if (isAnalyzing || selectedSequence.length !== sequenceLength) return;
    isAnalyzing = true;
    const timeElapsed = performance.now() - roundStartTime;
    const result = analyzer.analyze(currentSequence, selectedSequence, timeElapsed);

    showFeedback(result);
    score += result.score;
    const scoreVal = document.getElementById('current-score-val');
    if (scoreVal) scoreVal.textContent = score;

    if (!result.isCorrect) {
        const cards = document.querySelectorAll('.image-card');
        selectedSequence.forEach(word => {
            cards.forEach(card => {
                if (card.querySelector('.image-label').textContent === word &&
                    currentSequence.indexOf(word) !== selectedSequence.indexOf(word)) {
                    card.classList.add('incorrect');
                }
            });
        });
    }

    document.getElementById('check-button').style.display = 'none';
    setTimeout(() => {
        document.getElementById('feedback').classList.remove('show');
        document.getElementById('feedback').style.display = 'none';
        isAnalyzing = false;
        if (currentRound + 1 >= totalRounds) completeGame();
        else { currentRound++; startNewRound(); }
    }, 3500);
}

function showFeedback(result) {
    const feedbackElement = document.getElementById('feedback');
    document.getElementById('feedback-message').textContent = result.feedback.emoji + ' ' + result.feedback.message;
    document.getElementById('feedback-detail').textContent = result.feedback.details.join(' • ');

    let html = '<div class="stat-row"><span class="stat-label">Accuracy:</span><span class="stat-value">' + result.accuracy.toFixed(0) + '%</span></div>';
    html += '<div class="stat-row"><span class="stat-label">Memorized:</span><span class="stat-value">' + result.analysis.memorized + '</span></div>';
    html += '<div class="stat-row"><span class="stat-label">Time:</span><span class="stat-value">' + result.analysis.responseTime + '</span></div>';
    html += '<div class="stat-row"><span class="stat-label">Speed:</span><span class="stat-value">' + result.analysis.processingSpeed + '</span></div>';
    html += '<div class="stat-row"><span class="stat-label">Points:</span><span class="stat-value">' + result.score + ' pts</span></div>';
    html += '<div class="stat-row"><span class="stat-label">AI Note:</span><span class="stat-value">' + result.nextDifficulty.recommendation + '</span></div>';

    document.getElementById('analysis-box').innerHTML = html;
    feedbackElement.className = result.isCorrect ? 'feedback show correct' : 'feedback show incorrect';
    feedbackElement.style.display = 'block';
}

function completeGame() {
    const mainCard = document.getElementById('main-card');
    const report = analyzer.getSessionReport();

    let html = '<div class="game-completed">';
    html += '<h2 style="margin-bottom:20px;color:#0066CC;">Game Complete!</h2>';
    html += '<div class="final-score"><h2>Final Score:</h2><div class="score-number">' + score + '</div><p>points</p></div>';
    html += '<div class="analysis-box">';
    html += '<h3 style="text-align:center;margin-bottom:15px;color:#0066CC;">📊 Performance Analysis</h3>';
    html += '<div class="stat-row"><span class="stat-label">📌 Auditory Memory:</span><span class="stat-value">' + report.auditoryMemoryScore + '%</span></div>';
    html += '<div class="stat-row"><span class="stat-label">⚡ Avg. Speed:</span><span class="stat-value">' + report.averageResponseTime + 'ms</span></div>';
    html += '</div>';
    html += '<div class="options-container" style="margin-top:20px;">';
    html += '<button class="option-button primary" onclick="location.reload()">Play Again</button>';
    html += '<button class="option-button blue" onclick="goToMainPage()">Back</button>';
    html += '</div></div>';

    mainCard.innerHTML = html;
}

function goToMainPage() {
    window.location.href = '../../../../selectores/selector-auditivo.html';
}

document.getElementById('play-button').addEventListener('click', playSequence);
document.getElementById('repeat-button').addEventListener('click', repeatSequence);
document.getElementById('check-button').addEventListener('click', checkAnswer);
