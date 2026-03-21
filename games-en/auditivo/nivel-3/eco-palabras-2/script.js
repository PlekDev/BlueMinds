// ========================
// ADAPTIVE ANIMAL SOUND ANALYZER (Level 3)
// ========================

class AdaptiveAnimalSoundAnalyzer {
    constructor() {
        this.sessionStats = {
            totalAttempts: 0, correctAttempts: 0, averageAccuracy: 0,
            discriminationScore: 0, imitationScore: 0, confusionCount: 0
        };
        this.attempts = [];
        this.difficultyLevel = 1;
        this.soundClarity = 0.8;
        this.auditoryFilterLevel = 'none';
        this.currentDifficulty = 'easy';
    }

    analyze(animalName, expectedSound, recordedSound, timeElapsed) {
        const isCorrect = this.compareAnimalSounds(expectedSound, recordedSound);
        const accuracy = this.calculateSoundAccuracy(expectedSound, recordedSound);
        const similarity = this.calculateSimilarity(expectedSound, recordedSound);
        const confusion = this.detectSoundConfusion(expectedSound, recordedSound);
        const score = this.generateScore(accuracy, isCorrect, similarity);

        const attempt = { timestamp: new Date(), animal: animalName, expectedSound, recordedSound, isCorrect, accuracy, similarity, confusion, score, timeElapsed };
        this.attempts.push(attempt);
        this.updateSessionStats(attempt);
        this.adaptDifficulty();

        return {
            isCorrect, accuracy, similarity, score,
            feedback: this.generateFeedback(isCorrect, accuracy, confusion),
            analysis: this.generateAnalysis(attempt),
            nextAdjustment: this.getNextAdjustment()
        };
    }

    compareAnimalSounds(expected, recorded) {
        const expectedLower = expected.toLowerCase().trim();
        const recordedLower = recorded.toLowerCase().trim();
        if (expectedLower === recordedLower) return true;
        return this.calculateSimilarity(expected, recorded) >= 75;
    }

    calculateSoundAccuracy(expected, recorded) {
        const expectedLower = expected.toLowerCase();
        const recordedLower = recorded.toLowerCase();
        let matches = 0;
        const minLen = Math.min(expectedLower.length, recordedLower.length);
        for (let i = 0; i < minLen; i++) {
            if (expectedLower[i] === recordedLower[i]) matches++;
        }
        return (matches / Math.max(expectedLower.length, recordedLower.length)) * 100;
    }

    calculateSimilarity(expected, recorded) {
        const exp = expected.toLowerCase();
        const rec = recorded.toLowerCase();
        const maxLen = Math.max(exp.length, rec.length);
        let matches = 0;
        for (let i = 0; i < Math.min(exp.length, rec.length); i++) {
            if (exp[i] === rec[i]) matches++;
        }
        if (rec.includes(exp) || exp.includes(rec)) matches = Math.min(maxLen, matches + 10);
        return Math.round((matches / maxLen) * 100);
    }

    detectSoundConfusion(expected, recorded) {
        const confusionPairs = {
            'woof': ['meow', 'cock-a-doodle-doo'],
            'meow': ['woof', 'tweet'],
            'tweet': ['meow', 'quack'],
            'moo': ['baa', 'woof'],
            'baa': ['moo', 'tweet'],
            'cock-a-doodle-doo': ['woof', 'tweet'],
            'quack': ['tweet', 'moo'],
            'oink': ['woof', 'moo']
        };
        const exp = expected.toLowerCase();
        const rec = recorded.toLowerCase();
        if (confusionPairs[exp] && confusionPairs[exp].includes(rec)) return 'Auditory confusion with similar sound';
        return 'No confusion detected';
    }

    generateScore(accuracy, isCorrect, similarity) {
        let baseScore = accuracy;
        if (isCorrect) baseScore += 30;
        if (similarity >= 80) baseScore += 15;
        else if (similarity >= 60) baseScore += 8;
        return Math.min(100, Math.round(baseScore));
    }

    generateFeedback(isCorrect, accuracy, confusion) {
        let emoji = '', message = '', details = [];
        if (isCorrect) {
            emoji = '🎉'; message = 'Excellent imitation!';
            details.push('You perfectly reproduced the animal sound');
        } else if (accuracy >= 75) {
            emoji = '👍'; message = 'Very close, almost perfect!';
            details.push('Your imitation was very similar to the original');
            details.push('Try once more to perfect it');
        } else if (accuracy >= 50) {
            emoji = '📢'; message = 'Keep practicing!';
            if (confusion !== 'No confusion detected') details.push('⚠️ ' + confusion);
            details.push('Listen to the sound carefully and repeat slowly');
        } else {
            emoji = '💪'; message = 'Keep trying!';
            details.push('Listen to the sound several times');
            details.push('Animal sounds take practice');
        }
        return { emoji, message, details };
    }

    generateAnalysis(attempt) {
        return {
            animal: attempt.animal,
            accuracy: Math.round(attempt.accuracy) + '%',
            similarity: attempt.similarity + '%',
            confusionDetected: attempt.confusion,
            points: attempt.score
        };
    }

    updateSessionStats(attempt) {
        this.sessionStats.totalAttempts++;
        if (attempt.isCorrect) this.sessionStats.correctAttempts++;
        this.sessionStats.averageAccuracy =
            (this.sessionStats.averageAccuracy * (this.sessionStats.totalAttempts - 1) + attempt.accuracy) / this.sessionStats.totalAttempts;
        this.sessionStats.discriminationScore = (this.sessionStats.correctAttempts / this.sessionStats.totalAttempts) * 100;
        this.sessionStats.imitationScore = this.sessionStats.averageAccuracy;
        if (attempt.confusion !== 'No confusion detected') this.sessionStats.confusionCount++;
    }

    adaptDifficulty() {
        if (this.sessionStats.totalAttempts < 2) return;
        const ds = this.sessionStats.discriminationScore;
        const is_ = this.sessionStats.imitationScore;
        if (ds >= 85 && is_ >= 80) {
            this.currentDifficulty = 'hard';
            this.soundClarity = Math.max(0.6, this.soundClarity - 0.1);
            this.auditoryFilterLevel = 'background-noise';
        } else if (ds >= 70 && is_ >= 70) {
            this.currentDifficulty = 'medium';
            this.soundClarity = 0.8; this.auditoryFilterLevel = 'none';
        } else if (ds >= 50) {
            this.currentDifficulty = 'easy';
            this.soundClarity = Math.min(1.0, this.soundClarity + 0.1);
            this.auditoryFilterLevel = 'none';
        } else {
            this.currentDifficulty = 'very-easy';
            this.soundClarity = 1.0; this.auditoryFilterLevel = 'visual-aid';
        }
    }

    getNextAdjustment() {
        return {
            difficulty: this.currentDifficulty,
            soundClarity: this.soundClarity,
            auditoryFilterLevel: this.auditoryFilterLevel,
            showMouthAnimation: this.auditoryFilterLevel === 'visual-aid',
            recommendation: this.generateRecommendation()
        };
    }

    generateRecommendation() {
        if (this.sessionStats.discriminationScore >= 85) return '🌟 Excellent auditory discrimination! Increasing difficulty.';
        if (this.sessionStats.discriminationScore >= 70) return '👂 Good discrimination. Keep it up!';
        if (this.sessionStats.discriminationScore >= 50) return '🎯 Discrimination developing. Showing visual aids.';
        return '📚 Discrimination in training. Improving sound clarity.';
    }

    getSessionReport() {
        return {
            totalAttempts: this.sessionStats.totalAttempts,
            correctAttempts: this.sessionStats.correctAttempts,
            averageAccuracy: Math.round(this.sessionStats.averageAccuracy),
            discriminationScore: Math.round(this.sessionStats.discriminationScore),
            imitationScore: Math.round(this.sessionStats.imitationScore),
            confusionsDetected: this.sessionStats.confusionCount
        };
    }
}

// ========================
// ENGLISH ANIMAL DATABASE
// ========================

const animalDatabase = {
    'dog': {
        image: 'https://png.pngtree.com/png-clipart/20231004/original/pngtree-cute-dog-puppy-cartoon-png-image_13098172.png',
        sound: 'woof', difficulty: 'easy'
    },
    'cat': {
        image: 'https://static.vecteezy.com/system/resources/previews/013/089/641/original/illustration-of-cute-colored-cat-cat-cartoon-image-in-eps10-format-suitable-for-children-s-book-design-elements-introduction-of-cats-to-children-books-or-posters-about-animal-vector.jpg',
        sound: 'meow', difficulty: 'easy'
    },
    'bird': {
        image: 'https://static.vecteezy.com/system/resources/previews/013/480/622/non_2x/cartoon-illustration-of-a-bird-vector.jpg',
        sound: 'tweet', difficulty: 'easy'
    },
    'cow': {
        image: 'https://img.freepik.com/premium-vector/cartoon-cow-with-black-spot-its-face-white-background_730620-516642.jpg',
        sound: 'moo', difficulty: 'medium'
    },
    'sheep': {
        image: 'https://static.vecteezy.com/system/resources/previews/004/650/604/original/a-sheep-farm-animal-cartoon-sticker-free-vector.jpg',
        sound: 'baa', difficulty: 'medium'
    },
    'rooster': {
        image: 'https://image.freepik.com/vector-gratis/dibujos-animados-gallo-adorable_74769-26.jpg',
        sound: 'cock-a-doodle-doo', difficulty: 'hard'
    },
    'duck': {
        image: 'https://img.freepik.com/vetores-premium/pato-de-ilustracao-de-desenho-animado_323802-361.jpg',
        sound: 'quack', difficulty: 'medium'
    },
    'pig': {
        image: 'https://static.vecteezy.com/system/resources/previews/003/607/581/large_2x/pig-cartoon-cute-swine-illustration-vector.jpg',
        sound: 'oink', difficulty: 'easy'
    }
};

// ========================
// GAME VARIABLES
// ========================

let currentRound = 0;
let score = 0;
let currentAnimal = null;
let gameStarted = false;
let isRecording = false;
let hasPlayed = false;
const roundStartTime = performance.now();

const analyzer = new AdaptiveAnimalSoundAnalyzer();
const totalRounds = 5;
let recognition;

// ========================
// INITIALIZATION
// ========================

document.addEventListener('DOMContentLoaded', function () {
    setupSpeechRecognition();
    setupEventListeners();
    startNewRound();
});

function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript.toLowerCase().trim();
            analyzeImitation(transcript);
        };

        recognition.onerror = function (event) {
            console.error('Recognition error:', event.error);
            showFeedback('Error recording. Please try again.', false);
            stopRecording();
        };
    } else {
        alert('Your browser does not support voice recognition. Please use Chrome, Edge or Safari.');
    }
}

function setupEventListeners() {
    document.getElementById('play-sound-button').addEventListener('click', playAnimalSound);
    document.getElementById('record-button').addEventListener('click', toggleRecording);
}

function startNewRound() {
    speechSynthesis.cancel();
    const nextAdjustment = analyzer.getNextAdjustment();
    const animals = Object.entries(animalDatabase).filter(([name, data]) => {
        if (nextAdjustment.difficulty === 'easy' || nextAdjustment.difficulty === 'very-easy') return data.difficulty === 'easy';
        if (nextAdjustment.difficulty === 'hard') return data.difficulty !== 'easy';
        return true;
    });

    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    currentAnimal = { name: randomAnimal[0], ...randomAnimal[1] };

    gameStarted = false;
    isRecording = false;
    hasPlayed = false;

    updateUI();
    setupAnimationIfNeeded();
}

function setupAnimationIfNeeded() {
    const nextAdjustment = analyzer.getNextAdjustment();
    document.getElementById('mouth-animation').style.display = nextAdjustment.showMouthAnimation ? 'block' : 'none';
}

function updateUI() {
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('total-rounds').textContent = totalRounds;
    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';

    const progress = ((currentRound + 1) / totalRounds) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';

    const name = currentAnimal.name.charAt(0).toUpperCase() + currentAnimal.name.slice(1);
    document.getElementById('animal-name').textContent = name;
    document.getElementById('animal-image').src = currentAnimal.image;

    const nextAdjustment = analyzer.getNextAdjustment();
    document.getElementById('difficulty-badge').textContent = nextAdjustment.recommendation;

    document.getElementById('similarity-meter').style.display = 'none';
    document.getElementById('feedback').classList.remove('show');
    document.getElementById('recorded-text').style.display = 'none';

    const recordButton = document.getElementById('record-button');
    recordButton.innerHTML = '<i class="fas fa-microphone"></i> Record my voice';
    recordButton.className = 'btn secondary';
    recordButton.style.display = 'none';
}

function playAnimalSound() {
    if (!currentAnimal) return;
    const playButton = document.getElementById('play-sound-button');
    playButton.innerHTML = '<i class="fas fa-volume-up"></i> Playing...';
    playButton.disabled = true;

    const nextAdjustment = analyzer.getNextAdjustment();
    const utterance = new SpeechSynthesisUtterance(currentAnimal.sound);
    utterance.lang = 'en-US';
    utterance.rate = nextAdjustment.soundClarity;
    utterance.pitch = 1;

    utterance.onend = function () {
        playButton.innerHTML = '<i class="fas fa-volume-up"></i> Listen to Sound';
        playButton.disabled = false;
        hasPlayed = true;
        document.getElementById('record-button').style.display = 'inline-flex';
        if (nextAdjustment.showMouthAnimation) animateMouth();
    };
    speechSynthesis.speak(utterance);
}

function animateMouth() {
    const mouthAnimation = document.getElementById('mouth-animation');
    mouthAnimation.style.display = 'block';
    setTimeout(() => { mouthAnimation.style.display = 'none'; }, 2000);
}

function toggleRecording() {
    if (!hasPlayed) { showFeedback('Listen to the sound first', false); return; }
    const recordButton = document.getElementById('record-button');
    if (!isRecording) {
        isRecording = true;
        recordButton.innerHTML = '<i class="fas fa-stop"></i> Stop recording';
        recordButton.className = 'btn secondary recording';
        if (recognition) recognition.start();
        else { showFeedback('Voice recognition not available', false); stopRecording(); }
    } else {
        stopRecording();
    }
}

function stopRecording() {
    isRecording = false;
    const recordButton = document.getElementById('record-button');
    recordButton.innerHTML = '<i class="fas fa-microphone"></i> Analyzing...';
    recordButton.className = 'btn secondary';
    if (recognition) recognition.stop();
}

function analyzeImitation(transcript) {
    const timeElapsed = performance.now() - roundStartTime;
    const result = analyzer.analyze(currentAnimal.name, currentAnimal.sound, transcript, timeElapsed);

    document.getElementById('recorded-text-content').textContent = '"' + transcript + '"';
    document.getElementById('recorded-text').style.display = 'block';

    document.getElementById('similarity-meter').style.display = 'block';
    document.getElementById('similarity-fill').style.width = result.similarity + '%';
    document.getElementById('similarity-text').textContent = result.similarity + '%';

    const fillElement = document.getElementById('similarity-fill');
    fillElement.className = 'similarity-fill';
    if (result.similarity >= 75) fillElement.classList.add('success');
    else if (result.similarity >= 50) fillElement.classList.add('warning');
    else fillElement.classList.add('error');

    const pointsEarned = Math.floor(result.similarity / 10);
    if (result.isCorrect) score += pointsEarned;

    showFeedback(result.feedback.emoji + ' ' + result.feedback.message, result.isCorrect, result.feedback.details);

    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';
    document.getElementById('record-button').style.display = 'none';

    setTimeout(() => {
        document.getElementById('feedback').classList.remove('show');
        document.getElementById('feedback').style.display = 'none';
        if (currentRound + 1 >= totalRounds) completeGame();
        else { currentRound++; startNewRound(); }
    }, 3500);
}

function showFeedback(message, isCorrect, details = []) {
    const feedbackElement = document.getElementById('feedback');
    document.getElementById('feedback-message').textContent = message;
    document.getElementById('feedback-detail').textContent = details.join(' • ');

    let html = '<div class="stat-row"><span class="stat-label">Animal:</span><span class="stat-value">' + (currentAnimal ? currentAnimal.name : '') + '</span></div>';
    html += '<div class="stat-row"><span class="stat-label">Expected sound:</span><span class="stat-value">' + (currentAnimal ? currentAnimal.sound : '') + '</span></div>';
    html += '<div class="stat-row"><span class="stat-label">Points earned:</span><span class="stat-value">' + (parseInt(document.getElementById('similarity-text').textContent) / 10 | 0) + ' pts</span></div>';
    document.getElementById('analysis-box').innerHTML = html;

    feedbackElement.className = isCorrect ? 'feedback show correct' : 'feedback show incorrect';
    feedbackElement.style.display = 'block';
}

async function completeGame() {
    const mainCard = document.getElementById('main-card');
    const report = analyzer.getSessionReport();

    mainCard.innerHTML = `
        <div class="game-completed">
            <h2 style="margin-bottom:20px;color:#0066CC;">Sound Session Complete!</h2>
            <div class="final-score">
                <h2>Final Score:</h2>
                <div class="score-number">${score}</div>
                <p>points</p>
            </div>
            <div class="analysis-box">
                <h3 style="text-align:center;margin-bottom:15px;color:#0066CC;">📊 Vocal Analysis</h3>
                <div class="stat-row"><span class="stat-label">🎤 Imitation:</span><span class="stat-value">${report.imitationScore}%</span></div>
                <div class="stat-row"><span class="stat-label">👂 Discrimination:</span><span class="stat-value">${report.discriminationScore}%</span></div>
                <div class="stat-row"><span class="stat-label">⚠️ Confusions:</span><span class="stat-value">${report.confusionsDetected}</span></div>
            </div>
            <div class="options-container" style="margin-top:20px;">
                <button class="option-button primary" onclick="location.reload()">Play Again</button>
                <button class="option-button blue" onclick="goToMainPage()">Back</button>
            </div>
        </div>`;
}

function goToMainPage() {
    window.location.href = '../../../../selectores/selector-auditivo.html';
}
