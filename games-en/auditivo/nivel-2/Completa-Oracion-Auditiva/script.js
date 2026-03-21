// ========================
// ADAPTIVE COMPREHENSION ANALYZER (Complete the Sentence)
// ========================

class AdaptiveComprehensionAnalyzer {
    constructor() {
        this.sessionStats = {
            totalAttempts: 0, correctAttempts: 0, totalTime: 0,
            averageAccuracy: 0, comprehensionScore: 0, semanticConfusions: 0, responseLatency: 0
        };
        this.attempts = [];
        this.difficultyLevel = 1;
        this.speedMultiplier = 0.7;
        this.showVisualSupport = false;
        this.sentenceComplexity = 'simple';
    }

    analyze(sentence, selectedOption, correctOption, timeElapsed, distractors) {
        const isCorrect = selectedOption === correctOption;
        const semanticConfusion = this.detectSemanticConfusion(selectedOption, correctOption, distractors);
        const accuracy = isCorrect ? 100 : this.calculatePartialAccuracy(selectedOption, correctOption, distractors);
        const score = this.generateScore(accuracy, isCorrect, timeElapsed);

        const attempt = { timestamp: new Date(), sentence, selectedOption, correctOption, isCorrect, accuracy, timeElapsed, semanticConfusion, score };
        this.attempts.push(attempt);
        this.updateSessionStats(attempt);
        this.adaptDifficulty();

        return {
            isCorrect, accuracy, score, timeElapsed,
            feedback: this.generateFeedback(isCorrect, semanticConfusion),
            analysis: this.generateAnalysis(attempt),
            nextDifficulty: this.getNextDifficulty()
        };
    }

    generateScore(accuracy, isCorrect, timeElapsed) {
        let baseScore = accuracy;
        if (isCorrect) baseScore += 25;
        if (timeElapsed < 3000) baseScore += 15;
        else if (timeElapsed < 6000) baseScore += 10;
        else if (timeElapsed < 10000) baseScore += 5;
        return Math.min(100, Math.round(baseScore));
    }

    detectSemanticConfusion(selectedOption, correctOption, distractors) {
        if (selectedOption === correctOption) return 'None - Correct answer';
        const relatedDisractors = distractors.filter(d => this.isSemanticRelated(d.word, correctOption));
        if (relatedDisractors.some(d => d.word === selectedOption)) return 'Mild semantic confusion';
        return 'Semantic confusion';
    }

    isSemanticRelated(word1, word2) {
        const relatedPairs = {
            'fish': ['bone', 'milk'],
            'bone': ['fish', 'meat'],
            'milk': ['cheese', 'butter'],
            'apple': ['pear', 'orange'],
            'cat': ['dog', 'mouse']
        };
        return relatedPairs[word1]?.includes(word2) || relatedPairs[word2]?.includes(word1);
    }

    calculatePartialAccuracy(selected, correct, distractors) {
        if (this.isSemanticRelated(selected, correct)) return 60;
        return 20;
    }

    generateFeedback(isCorrect, semanticConfusion) {
        let emoji = '', message = '', details = [];
        if (isCorrect) {
            emoji = '🎉'; message = 'Excellent! Correct understanding!';
            details.push('You understood the meaning of the sentence perfectly');
        } else if (semanticConfusion === 'Mild semantic confusion') {
            emoji = '👍'; message = 'Good try, but not quite right';
            details.push('The word you chose is related, but does not complete the sentence well');
            details.push('Think about which word makes the most sense in context');
        } else {
            emoji = '💭'; message = 'Think a little more';
            details.push('Remember that the word must make sense in the sentence');
            details.push('Try again, listening more carefully');
        }
        return { emoji, message, details };
    }

    generateAnalysis(attempt) {
        return {
            comprehension: attempt.isCorrect ? 'Complete' : 'Partial',
            semantic: attempt.semanticConfusion,
            responseTime: Math.round(attempt.timeElapsed) + 'ms',
            score: attempt.score
        };
    }

    updateSessionStats(attempt) {
        this.sessionStats.totalAttempts++;
        if (attempt.isCorrect) this.sessionStats.correctAttempts++;
        this.sessionStats.totalTime += attempt.timeElapsed;
        this.sessionStats.averageAccuracy =
            (this.sessionStats.averageAccuracy * (this.sessionStats.totalAttempts - 1) + attempt.accuracy) / this.sessionStats.totalAttempts;
        this.sessionStats.comprehensionScore = (this.sessionStats.correctAttempts / this.sessionStats.totalAttempts) * 100;
        this.sessionStats.responseLatency = this.sessionStats.totalTime / this.sessionStats.totalAttempts;
    }

    adaptDifficulty() {
        if (this.sessionStats.totalAttempts < 2) return;
        const comprehension = this.sessionStats.comprehensionScore;
        if (comprehension >= 85) {
            this.difficultyLevel = Math.min(5, this.difficultyLevel + 0.5);
            this.speedMultiplier = Math.max(0.7, this.speedMultiplier - 0.1);
            this.showVisualSupport = false; this.sentenceComplexity = 'complex';
        } else if (comprehension >= 70) {
            this.difficultyLevel = Math.max(1, this.difficultyLevel);
            this.speedMultiplier = 0.85; this.showVisualSupport = false; this.sentenceComplexity = 'medium';
        } else if (comprehension >= 50) {
            this.difficultyLevel = Math.max(1, this.difficultyLevel - 0.3);
            this.speedMultiplier = Math.min(0.95, this.speedMultiplier + 0.1);
            this.showVisualSupport = true; this.sentenceComplexity = 'simple';
        } else {
            this.difficultyLevel = Math.max(1, this.difficultyLevel - 0.5);
            this.speedMultiplier = 1.0; this.showVisualSupport = true; this.sentenceComplexity = 'very_simple';
        }
    }

    getNextDifficulty() {
        return {
            level: Math.round(this.difficultyLevel * 10) / 10,
            speedMultiplier: this.speedMultiplier,
            showVisualSupport: this.showVisualSupport,
            sentenceComplexity: this.sentenceComplexity,
            recommendation: this.generateRecommendation()
        };
    }

    generateRecommendation() {
        if (this.sessionStats.comprehensionScore >= 85) return 'Excellent comprehension! Increasing difficulty.';
        if (this.sessionStats.comprehensionScore >= 70) return 'Good comprehension. Keep it up!';
        if (this.sessionStats.comprehensionScore >= 50) return 'Comprehension developing. Showing visual aids.';
        return 'Comprehension training. Simplifying sentences.';
    }

    getSessionReport() {
        return {
            totalAttempts: this.sessionStats.totalAttempts,
            correctAttempts: this.sessionStats.correctAttempts,
            comprehensionScore: Math.round(this.sessionStats.comprehensionScore),
            averageAccuracy: Math.round(this.sessionStats.averageAccuracy),
            averageResponseTime: Math.round(this.sessionStats.responseLatency)
        };
    }
}

// ========================
// ENGLISH SENTENCE DATABASE
// ========================

const sentenceDatabase = {
    very_simple: [
        {
            simple: 'The cat likes to eat...',
            medium: 'The cat purrs and loves to eat...',
            complex: 'The fluffy cat meows loudly because it is hungry and really loves to eat...',
            correctAnswer: 'fish',
            image: 'https://img.freepik.com/vector-premium/lindo-gato-comiendo-pescado-dibujos-animados-vector-ilustracion_9845-581.jpg?w=400',
            options: [
                { word: 'fish', image: 'https://static.vecteezy.com/system/resources/previews/002/174/077/original/fish-cartoon-style-isolated-free-vector.jpg' },
                { word: 'hammer', image: 'https://img.freepik.com/vector-gratis/diseno-etiqueta-martillo-garra-aislado_1308-61820.jpg?w=300' },
                { word: 'ball', image: 'https://wallpaperaccess.com/full/6273127.png?w=300' }
            ]
        },
        {
            simple: 'The boy drinks...',
            medium: 'The thirsty boy takes a big drink of...',
            complex: 'After playing in the park all afternoon, the tired boy runs inside to drink some cold...',
            correctAnswer: 'water',
            image: 'https://img.freepik.com/vector-premium/ilustracion-vectorial-nino-bebiendo-agua-estilo-diseno-plano_844724-4072.jpg?w=400',
            options: [
                { word: 'water', image: 'https://thumbs.dreamstime.com/z/glass-water-cartoon-vector-illustration-144223612.jpg' },
                { word: 'juice', image: 'https://thumbs.dreamstime.com/z/estilo-de-dibujos-animados-iconos-zumo-naranja-tropical-icono-del-jugo-caricatura-vector-para-el-dise%C3%B1o-web-aislado-en-fondo-176870364.jpg' },
                { word: 'milk', image: 'https://clipground.com/images/milk-glass-clipart-4.jpg' }
            ]
        },
        {
            simple: 'The flower is very...',
            medium: 'The flower in the garden is so very...',
            complex: 'The wild flower that grows in the sunny garden is extraordinarily...',
            correctAnswer: 'beautiful',
            image: 'https://i.pinimg.com/736x/30/9f/75/309f75498f8b6e50bea5904d16493593--cartoon-flowers-jigsaw-puzzles.jpg?w=400',
            options: [
                { word: 'beautiful', image: 'https://img.freepik.com/vector-premium/dibujo-dibujos-animados-flor-rosa-centro-amarillo_1167562-3170.jpg' },
                { word: 'metal', image: 'https://cdn.pixabay.com/photo/2012/04/18/12/17/metal-36867_1280.png' },
                { word: 'fire', image: 'https://static.vecteezy.com/system/resources/previews/008/063/039/non_2x/fire-cartoon-element-vector.jpg' }
            ]
        },
        {
            simple: 'The bird flies in...',
            medium: 'The bird spreads its wings and flies freely in...',
            complex: 'The colorful bird with bright feathers stretches its wings majestically and soars through...',
            correctAnswer: 'the sky',
            image: 'https://img.freepik.com/vector-gratis/fondo-pajaros-azules-volando_23-2147739864.jpg?w=400',
            options: [
                { word: 'the sky', image: 'https://img.freepik.com/vector-gratis/ilustracion-diaria-nubes-cielo-cirros-dibujos-animados-cumulos-nubes-blancas-rayos-sol-ilustracion_1284-62767.jpg' },
                { word: 'the sea', image: 'https://image.freepik.com/vector-gratis/dibujos-animados-naturaleza-paisaje-mar_107173-7110.jpg' },
                { word: 'a cave', image: 'https://static.vecteezy.com/system/resources/previews/026/717/887/original/cave-cartoon-illustration-vector.jpg' }
            ]
        },
        {
            simple: 'The children play in...',
            medium: 'The happy children laugh and play in...',
            complex: 'The energetic children run, jump, and play all afternoon in...',
            correctAnswer: 'the park',
            image: 'https://static.vecteezy.com/system/resources/previews/001/943/139/non_2x/kids-playing-at-the-park-vector.jpg?w=400',
            options: [
                { word: 'the park', image: 'https://c8.alamy.com/comp/2HB036D/playground-park-design-with-games-2HB036D.jpg' },
                { word: 'school', image: 'https://static.vecteezy.com/system/resources/previews/008/734/924/large_2x/cartoon-group-of-elementary-school-kids-in-the-school-yard-vector.jpg' },
                { word: 'home', image: 'https://static.vecteezy.com/system/resources/previews/025/902/050/original/house-cartoon-style-illustration-ai-generated-vector.jpg' }
            ]
        }
    ]
};

// ========================
// GAME VARIABLES
// ========================

let currentQuestion = 0;
let score = 0;
let currentSentence = null;
let selectedOption = null;
let gameStarted = false;
let isAnalyzing = false;
let questionStartTime = 0;

const analyzer = new AdaptiveComprehensionAnalyzer();
const totalQuestions = 5;

// ========================
// INITIALIZATION
// ========================

document.addEventListener('DOMContentLoaded', function () {
    startNewQuestion();
});

function startNewQuestion() {
    speechSynthesis.cancel();
    const nextDifficulty = analyzer.getNextDifficulty();
    const complexity = nextDifficulty.sentenceComplexity;
    const sentences = sentenceDatabase[complexity] || sentenceDatabase.very_simple;
    currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
    selectedOption = null;
    gameStarted = false;

    document.getElementById('feedback').classList.remove('show');
    document.getElementById('feedback').style.display = 'none';
    document.getElementById('visual-support').style.display = 'none';

    updateUI();
    renderOptions();
    document.getElementById('play-button').style.display = 'inline-flex';
    document.getElementById('repeat-button').style.display = 'none';
}

function updateUI() {
    document.getElementById('current-question').textContent = currentQuestion + 1;
    document.getElementById('total-questions').textContent = totalQuestions;
    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';

    const progress = ((currentQuestion + 1) / totalQuestions) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';

    const nextDifficulty = analyzer.getNextDifficulty();
    document.getElementById('difficulty-badge').textContent = 'Comprehension: ' + (Math.round(nextDifficulty.level * 10) / 10) + ' ★';
    document.getElementById('difficulty-badge').className = 'difficulty-badge adaptive';
    document.getElementById('instruction-text').textContent = nextDifficulty.recommendation;
}

function renderOptions() {
    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    const options = currentSentence.options.sort(() => Math.random() - 0.5);
    options.forEach(option => {
        const card = document.createElement('div');
        card.className = 'option-card';
        card.innerHTML = `<img src="${option.image}" alt="${option.word}"><div class="option-card-label">${option.word}</div>`;
        card.addEventListener('click', () => selectOption(option.word, card));
        grid.appendChild(card);
    });
}

function selectOption(word, element) {
    if (isAnalyzing || !gameStarted) return;
    document.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected'));
    selectedOption = word;
    element.classList.add('selected');
    setTimeout(() => checkAnswer(), 500);
}

function playSentence() {
    if (gameStarted) return;
    gameStarted = true;
    questionStartTime = performance.now();

    const nextDifficulty = analyzer.getNextDifficulty();
    let sentenceText = currentSentence.simple;
    if (nextDifficulty.sentenceComplexity === 'medium') sentenceText = currentSentence.medium;
    else if (nextDifficulty.sentenceComplexity === 'complex') sentenceText = currentSentence.complex;

    const utterance = new SpeechSynthesisUtterance(sentenceText);
    utterance.lang = 'en-US';
    utterance.rate = nextDifficulty.speedMultiplier;
    utterance.pitch = 1;

    utterance.onend = () => {
        if (nextDifficulty.showVisualSupport) showVisualSupport();
        document.getElementById('repeat-button').style.display = 'inline-flex';
    };
    speechSynthesis.speak(utterance);
}

function showVisualSupport() {
    const visualSupport = document.getElementById('visual-support');
    document.getElementById('visual-image').src = currentSentence.image;
    visualSupport.style.display = 'block';
}

function repeatSentence() {
    selectedOption = null;
    document.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected', 'correct', 'incorrect'));
    gameStarted = false;
    playSentence();
}

function checkAnswer() {
    if (isAnalyzing || !selectedOption) return;
    isAnalyzing = true;
    const timeElapsed = performance.now() - questionStartTime;

    const result = analyzer.analyze(
        currentSentence.simple, selectedOption, currentSentence.correctAnswer, timeElapsed, currentSentence.options
    );

    document.querySelectorAll('.option-card').forEach(card => {
        const label = card.querySelector('.option-card-label').textContent;
        if (label === currentSentence.correctAnswer) card.classList.add('correct');
        else if (label === selectedOption && selectedOption !== currentSentence.correctAnswer) card.classList.add('incorrect');
    });

    showFeedback(result);
    score += result.score;
    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';

    document.getElementById('repeat-button').style.display = 'none';
    document.getElementById('play-button').style.display = 'none';

    setTimeout(() => {
        document.getElementById('feedback').classList.remove('show');
        document.getElementById('feedback').style.display = 'none';
        isAnalyzing = false;
        if (currentQuestion + 1 >= totalQuestions) completeGame();
        else { currentQuestion++; startNewQuestion(); }
    }, 3500);
}

function showFeedback(result) {
    const feedbackElement = document.getElementById('feedback');
    document.getElementById('feedback-message').textContent = result.feedback.emoji + ' ' + result.feedback.message;
    document.getElementById('feedback-detail').textContent = result.feedback.details.join(' • ');

    let html = '<div class="stat-row"><span class="stat-label">Accuracy:</span><span class="stat-value">' + result.accuracy.toFixed(0) + '%</span></div>';
    html += '<div class="stat-row"><span class="stat-label">Comprehension:</span><span class="stat-value">' + result.analysis.comprehension + '</span></div>';
    html += '<div class="stat-row"><span class="stat-label">Type:</span><span class="stat-value">' + result.analysis.semantic + '</span></div>';
    html += '<div class="stat-row"><span class="stat-label">Time:</span><span class="stat-value">' + result.analysis.responseTime + '</span></div>';
    html += '<div class="stat-row"><span class="stat-label">Points:</span><span class="stat-value">' + result.score + ' pts</span></div>';

    document.getElementById('analysis-box').innerHTML = html;
    feedbackElement.className = result.isCorrect ? 'feedback show correct' : 'feedback show incorrect';
    feedbackElement.style.display = 'block';
}

async function completeGame() {
    const mainCard = document.getElementById('main-card');
    const report = analyzer.getSessionReport();

    mainCard.innerHTML = `
        <div class="game-completed">
            <h2 style="margin-bottom:20px;color:#0066CC;">Comprehension Complete!</h2>
            <div class="final-score">
                <h2>Final Score:</h2>
                <div class="score-number">${score}</div>
                <p>points</p>
            </div>
            <div class="analysis-box">
                <h3 style="text-align:center;margin-bottom:15px;color:#0066CC;">📊 Performance Analysis</h3>
                <div class="stat-row"><span class="stat-label">📌 Comprehension:</span><span class="stat-value">${report.comprehensionScore}%</span></div>
                <div class="stat-row"><span class="stat-label">🎯 Accuracy:</span><span class="stat-value">${report.averageAccuracy}%</span></div>
                <div class="stat-row"><span class="stat-label">⚡ Speed:</span><span class="stat-value">${report.averageResponseTime}ms</span></div>
            </div>
            <div class="options-container" style="margin-top:20px;">
                <button class="option-button primary" onclick="location.reload()">Play Again</button>
                <button class="option-button blue" onclick="goToMainPage()">Back</button>
            </div>
        </div>`;
}

function goToMainPage() {
    window.location.href = '../../../../';
}

document.getElementById('play-button').addEventListener('click', playSentence);
document.getElementById('repeat-button').addEventListener('click', repeatSentence);
