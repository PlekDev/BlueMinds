// ========================
// ANALISADOR DE IMITAÇÃO AUDITIVA COM IA ADAPTATIVA
// ========================

class AdaptiveAnimalSoundAnalyzer {
    constructor() {
        this.sessionStats = {
            totalAttempts: 0,
            correctAttempts: 0,
            averageAccuracy: 0,
            discriminationScore: 0,
            imitationScore: 0,
            confusionCount: 0
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

        const attempt = {
            timestamp: new Date(),
            animal: animalName,
            expectedSound: expectedSound,
            recordedSound: recordedSound,
            isCorrect: isCorrect,
            accuracy: accuracy,
            similarity: similarity,
            confusion: confusion,
            score: score,
            timeElapsed: timeElapsed
        };

        this.attempts.push(attempt);
        this.updateSessionStats(attempt);
        this.adaptDifficulty();

        return {
            isCorrect: isCorrect,
            accuracy: accuracy,
            similarity: similarity,
            score: score,
            feedback: this.generateFeedback(isCorrect, accuracy, confusion),
            analysis: this.generateAnalysis(attempt),
            nextAdjustment: this.getNextAdjustment()
        };
    }

    compareAnimalSounds(expected, recorded) {
        const expectedLower = expected.toLowerCase().trim();
        const recordedLower = recorded.toLowerCase().trim();

        if (expectedLower === recordedLower) return true;

        const similarity = this.calculateSimilarity(expected, recorded);
        return similarity >= 75;
    }

    calculateSoundAccuracy(expected, recorded) {
        const expectedLower = expected.toLowerCase();
        const recordedLower = recorded.toLowerCase();

        let matches = 0;
        const minLen = Math.min(expectedLower.length, recordedLower.length);

        for (let i = 0; i < minLen; i++) {
            if (expectedLower[i] === recordedLower[i]) {
                matches++;
            }
        }

        return (matches / Math.max(expectedLower.length, recordedLower.length)) * 100;
    }

    calculateSimilarity(expected, recorded) {
        const expectedLower = expected.toLowerCase();
        const recordedLower = recorded.toLowerCase();

        const maxLen = Math.max(expectedLower.length, recordedLower.length);
        let matches = 0;

        for (let i = 0; i < Math.min(expectedLower.length, recordedLower.length); i++) {
            if (expectedLower[i] === recordedLower[i]) {
                matches++;
            }
        }

        if (recordedLower.includes(expectedLower) || expectedLower.includes(recordedLower)) {
            matches = Math.min(maxLen, matches + 10);
        }

        return Math.round((matches / maxLen) * 100);
    }

    detectSoundConfusion(expected, recorded) {
        const confusionPairs = {
            'au': ['miau', 'cocoricó'],
            'miau': ['au', 'piu'],
            'piu': ['miau', 'quá'],
            'muuu': ['béé', 'au'],
            'béé': ['muuu', 'piu'],
            'cocoricó': ['au', 'piu'],
            'quá': ['piu', 'muuu'],
            'sss': ['fff', 'zzz']
        };

        const expectedLower = expected.toLowerCase();
        const recordedLower = recorded.toLowerCase();

        if (confusionPairs[expectedLower]) {
            if (confusionPairs[expectedLower].includes(recordedLower)) {
                return 'Confusão auditiva com som similar';
            }
        }

        return 'Sem confusão detectada';
    }

    generateScore(accuracy, isCorrect, similarity) {
        let baseScore = accuracy;

        if (isCorrect) {
            baseScore += 30;
        }

        if (similarity >= 80) {
            baseScore += 15;
        } else if (similarity >= 60) {
            baseScore += 8;
        }

        return Math.min(100, Math.round(baseScore));
    }

    generateFeedback(isCorrect, accuracy, confusion) {
        let emoji = '';
        let message = '';
        let details = [];

        if (isCorrect) {
            emoji = '🎉';
            message = 'Imitação excelente!';
            details.push('Você reproduziu perfeitamente o som do animal');
        } else if (accuracy >= 75) {
            emoji = '👍';
            message = 'Muito perto, quase perfeito';
            details.push('Sua imitação foi muito parecida com o original');
            details.push('Tente mais uma vez para aperfeiçoar');
        } else if (accuracy >= 50) {
            emoji = '📢';
            message = 'Precisa praticar mais';
            if (confusion !== 'Sem confusão detectada') {
                details.push('⚠️ ' + confusion);
            }
            details.push('Ouça bem o som e repita devagar');
        } else {
            emoji = '💪';
            message = 'Continue tentando';
            details.push('Ouça o som várias vezes');
            details.push('Os sons dos animais precisam de prática');
        }

        return {
            emoji: emoji,
            message: message,
            details: details
        };
    }

    generateAnalysis(attempt) {
        return {
            animal: attempt.animal,
            precisao: Math.round(attempt.accuracy) + '%',
            similaridade: attempt.similarity + '%',
            confusaoDetectada: attempt.confusion,
            pontos: attempt.score
        };
    }

    updateSessionStats(attempt) {
        this.sessionStats.totalAttempts++;
        if (attempt.isCorrect) {
            this.sessionStats.correctAttempts++;
        }

        this.sessionStats.averageAccuracy =
            (this.sessionStats.averageAccuracy * (this.sessionStats.totalAttempts - 1) + attempt.accuracy) / this.sessionStats.totalAttempts;

        this.sessionStats.discriminationScore =
            (this.sessionStats.correctAttempts / this.sessionStats.totalAttempts) * 100;

        this.sessionStats.imitationScore = this.sessionStats.averageAccuracy;

        if (attempt.confusion !== 'Sem confusão detectada') {
            this.sessionStats.confusionCount++;
        }
    }

    adaptDifficulty() {
        if (this.sessionStats.totalAttempts < 2) return;

        const discriminationScore = this.sessionStats.discriminationScore;
        const imitationScore = this.sessionStats.imitationScore;

        if (discriminationScore >= 85 && imitationScore >= 80) {
            // Aumentar dificuldade
            this.currentDifficulty = 'hard';
            this.soundClarity = Math.max(0.6, this.soundClarity - 0.1);
            this.auditoryFilterLevel = 'background-noise';
        } else if (discriminationScore >= 70 && imitationScore >= 70) {
            // Manter dificuldade
            this.currentDifficulty = 'medium';
            this.soundClarity = 0.8;
            this.auditoryFilterLevel = 'none';
        } else if (discriminationScore >= 50) {
            // Reduzir levemente
            this.currentDifficulty = 'easy';
            this.soundClarity = Math.min(1.0, this.soundClarity + 0.1);
            this.auditoryFilterLevel = 'none';
        } else {
            // Reduzir significativamente
            this.currentDifficulty = 'very-easy';
            this.soundClarity = 1.0;
            this.auditoryFilterLevel = 'visual-aid';
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
        if (this.sessionStats.discriminationScore >= 85) {
            return '🌟 Excelente discriminação auditiva. Aumentando dificuldade.';
        } else if (this.sessionStats.discriminationScore >= 70) {
            return '👂 Boa discriminação. Continue assim.';
        } else if (this.sessionStats.discriminationScore >= 50) {
            return '🎯 Discriminação em desenvolvimento. Mostrando ajudas visuais.';
        } else {
            return '📚 Discriminação em treinamento. Melhorando o som.';
        }
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
// BASE DE DADOS DE ANIMAIS
// ========================

const animalDatabase = {
    'cachorro': {
        image: 'https://png.pngtree.com/png-clipart/20231004/original/pngtree-cute-dog-puppy-cartoon-png-image_13098172.png?w=400',
        sound: 'au',
        difficulty: 'easy'
    },
    'gato': {
        image: 'https://static.vecteezy.com/system/resources/previews/013/089/641/original/illustration-of-cute-colored-cat-cat-cartoon-image-in-eps10-format-suitable-for-children-s-book-design-elements-introduction-of-cats-to-children-books-or-posters-about-animal-vector.jpg?w=400',
        sound: 'miau',
        difficulty: 'easy'
    },
    'passarinho': {
        image: 'https://static.vecteezy.com/system/resources/previews/013/480/622/non_2x/cartoon-illustration-of-a-bird-vector.jpg?w=400',
        sound: 'piu',
        difficulty: 'easy'
    },
    'vaca': {
        image: 'https://img.freepik.com/premium-vector/cartoon-cow-with-black-spot-its-face-white-background_730620-516642.jpg?w=400',
        sound: 'muuu',
        difficulty: 'medium'
    },
    'ovelha': {
        image: 'https://static.vecteezy.com/system/resources/previews/004/650/604/original/a-sheep-farm-animal-cartoon-sticker-free-vector.jpg?w=400',
        sound: 'béé',
        difficulty: 'medium'
    },
    'galo': {
        image: 'https://image.freepik.com/vector-gratis/dibujos-animados-gallo-adorable_74769-26.jpg?w=400',
        sound: 'cocoricó',
        difficulty: 'hard'
    },
    'pato': {
        image: 'https://img.freepik.com/vetores-premium/pato-de-ilustracao-de-desenho-animado_323802-361.jpg?w=400',
        sound: 'quá',
        difficulty: 'medium'
    },
    'porco': {
        image: 'https://static.vecteezy.com/system/resources/previews/003/607/581/large_2x/pig-cartoon-cute-swine-illustration-vector.jpg?w=400',
        sound: 'oinc',
        difficulty: 'easy'
    }
};

// ========================
// VARIÁVEIS DO JOGO
// ========================

let currentRound = 0;
let score = 0;
let currentAnimal = null;
let selectedOption = null;
let gameStarted = false;
let isRecording = false;
let hasPlayed = false;

const analyzer = new AdaptiveAnimalSoundAnalyzer();
const totalRounds = 5;
let recognition;

// ========================
// INICIALIZAÇÃO
// ========================

document.addEventListener('DOMContentLoaded', function() {
    const gameId = 'imitacion-animales-1';
    api.getBestScore(gameId).then(bestScore => {
        document.getElementById('score-display').innerHTML =
            `🏆 Recorde: ${bestScore} pts | <span id="current-score-val">0</span> pts`;
    }).catch(() => {
        document.getElementById('score-display').innerHTML = `Atual: <span id="current-score-val">0</span> pts`;
    });
    setupSpeechRecognition();
    setupEventListeners();
    startNewRound();
});

function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript.toLowerCase().trim();
            analyzeImitation(transcript);
        };

        recognition.onerror = function(event) {
            console.error('Erro:', event.error);
            showFeedback('Erro ao gravar', false);
            stopRecording();
        };
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
        if (nextAdjustment.difficulty === 'easy') return data.difficulty === 'easy';
        if (nextAdjustment.difficulty === 'very-easy') return data.difficulty === 'easy';
        if (nextAdjustment.difficulty === 'hard') return data.difficulty !== 'easy';
        return true;
    });

    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    currentAnimal = {
        name: randomAnimal[0],
        ...randomAnimal[1]
    };

    gameStarted = false;
    isRecording = false;
    hasPlayed = false;

    updateUI();
    setupAnimationIfNeeded();
}

function setupAnimationIfNeeded() {
    const nextAdjustment = analyzer.getNextAdjustment();
    const mouthAnimation = document.getElementById('mouth-animation');

    if (nextAdjustment.showMouthAnimation) {
        mouthAnimation.style.display = 'block';
    } else {
        mouthAnimation.style.display = 'none';
    }
}

function updateUI() {
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('total-rounds').textContent = totalRounds;
    document.getElementById('score').textContent = score + ' pontos';
    document.getElementById('score-display').textContent = score + ' pontos';

    const progress = ((currentRound + 1) / totalRounds) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';

    document.getElementById('animal-name').textContent = currentAnimal.name.charAt(0).toUpperCase() + currentAnimal.name.slice(1);
    document.getElementById('animal-image').src = currentAnimal.image;

    const nextAdjustment = analyzer.getNextAdjustment();
    const badgeElement = document.getElementById('difficulty-badge');
    badgeElement.textContent = nextAdjustment.recommendation;

    document.getElementById('similarity-meter').style.display = 'none';
    document.getElementById('feedback').classList.remove('show');
    document.getElementById('recorded-text').style.display = 'none';

    const recordButton = document.getElementById('record-button');
    recordButton.innerHTML = '<i class="fas fa-microphone"></i> Gravar minha voz';
    recordButton.className = 'btn secondary';
    recordButton.style.display = 'none';
}

function playAnimalSound() {
    if (!currentAnimal) return;

    const playButton = document.getElementById('play-sound-button');
    playButton.innerHTML = '<i class="fas fa-volume-up"></i> Reproduzindo...';
    playButton.disabled = true;

    const nextAdjustment = analyzer.getNextAdjustment();
    const rate = nextAdjustment.soundClarity;

    const utterance = new SpeechSynthesisUtterance(currentAnimal.sound);
    utterance.lang = 'pt-BR';
    utterance.rate = rate;
    utterance.pitch = 1;

    utterance.onend = function() {
        playButton.innerHTML = '<i class="fas fa-volume-up"></i> Ouvir Som';
        playButton.disabled = false;
        hasPlayed = true;

        document.getElementById('record-button').style.display = 'inline-flex';

        if (nextAdjustment.showMouthAnimation) {
            animateMouth();
        }
    };

    speechSynthesis.speak(utterance);
}

function animateMouth() {
    const mouthAnimation = document.getElementById('mouth-animation');
    mouthAnimation.style.display = 'block';

    setTimeout(() => {
        mouthAnimation.style.display = 'none';
    }, 2000);
}

function toggleRecording() {
    if (!hasPlayed) {
        showFeedback('Primeiro ouça o som', false);
        return;
    }

    const recordButton = document.getElementById('record-button');

    if (!isRecording) {
        isRecording = true;
        recordButton.innerHTML = '<i class="fas fa-stop"></i> Parar gravação';
        recordButton.className = 'btn secondary recording';
        recognition.start();
    } else {
        stopRecording();
    }
}

function stopRecording() {
    isRecording = false;
    const recordButton = document.getElementById('record-button');
    recordButton.innerHTML = '<i class="fas fa-microphone"></i> Analisando...';
    recordButton.className = 'btn secondary';
    recognition.stop();
}

function analyzeImitation(transcript) {
    const timeElapsed = performance.now() - roundStartTime;
    const result = analyzer.analyze(currentAnimal.name, currentAnimal.sound, transcript, timeElapsed);

    const recordedTextElement = document.getElementById('recorded-text');
    document.getElementById('recorded-text-content').textContent = '"' + transcript + '"';
    recordedTextElement.style.display = 'block';

    document.getElementById('similarity-meter').style.display = 'block';
    document.getElementById('similarity-fill').style.width = result.similarity + '%';
    document.getElementById('similarity-text').textContent = result.similarity + '%';

    const fillElement = document.getElementById('similarity-fill');
    fillElement.className = 'similarity-fill';
    if (result.similarity >= 75) {
        fillElement.classList.add('success');
    } else if (result.similarity >= 50) {
        fillElement.classList.add('warning');
    } else {
        fillElement.classList.add('error');
    }

    const isCorrect = result.isCorrect;
    const pointsEarned = Math.floor(result.similarity / 10);

    if (isCorrect) {
        score += pointsEarned;
        const feedbackMsg = result.feedback.emoji + ' ' + result.feedback.message;
        showFeedback(feedbackMsg, true, result.feedback.details);
    } else {
        const feedbackMsg = result.feedback.emoji + ' ' + result.feedback.message;
        showFeedback(feedbackMsg, false, result.feedback.details);
    }

    document.getElementById('score').textContent = score + ' pontos';
    document.getElementById('score-display').textContent = score + ' pontos';

    document.getElementById('record-button').style.display = 'none';

    setTimeout(() => {
        document.getElementById('feedback').classList.remove('show');
        document.getElementById('feedback').style.display = 'none';

        if (currentRound + 1 >= totalRounds) {
            completeGame();
        } else {
            currentRound++;
            startNewRound();
        }
    }, 3500);
}

function showFeedback(message, isCorrect, details = []) {
    const feedbackElement = document.getElementById('feedback');
    const feedbackMessage = document.getElementById('feedback-message');
    const feedbackDetail = document.getElementById('feedback-detail');
    const analysisBox = document.getElementById('analysis-box');

    feedbackMessage.textContent = message;
    feedbackDetail.textContent = details.join(' • ');

    let analysisHTML = '<div class="stat-row"><span class="stat-label">Animal:</span><span class="stat-value">' + currentAnimal.name + '</span></div>';
    analysisHTML += '<div class="stat-row"><span class="stat-label">Som esperado:</span><span class="stat-value">' + currentAnimal.sound + '</span></div>';
    analysisHTML += '<div class="stat-row"><span class="stat-label">Pontos ganhos:</span><span class="stat-value">' + Math.floor(document.getElementById('similarity-text').textContent) / 10 + ' pts</span></div>';

    analysisBox.innerHTML = analysisHTML;

    feedbackElement.className = isCorrect ? 'feedback show correct' : 'feedback show incorrect';
    feedbackElement.style.display = 'block';
}

// --- Função completeGame atualizada ---
async function completeGame() {
    const mainCard = document.getElementById('main-card');
    const report = analyzer.getSessionReport();

    // Preparar o objeto para Koyeb
    const gameData = {
        gameId: 'imitacion-animales-1',
        style: 'auditivo',
        level: analyzer.currentDifficulty === 'hard' ? 3 : (analyzer.currentDifficulty === 'medium' ? 2 : 1),
        score: score,
        accuracy: report.averageAccuracy,
        responseTime: 0
    };

    mainCard.innerHTML = '<div class="game-completed"><h2>Salvando seu progresso...</h2></div>';

    try {
        await api.saveGameResults(gameData);
    } catch (error) {
        console.error("Erro ao salvar:", error);
    }

    // Renderizar relatório final
    mainCard.innerHTML = `
        <div class="game-completed">
            <h2 style="margin-bottom: 20px; color: #0066CC;">Sessão de Sons Concluída!</h2>
            <div class="final-score">
                <h2>Pontuação Final:</h2>
                <div class="score-number">${score}</div>
                <p>pontos</p>
            </div>
            <div class="analysis-box">
                <h3 style="text-align: center; margin-bottom: 15px; color: #0066CC;">📊 Análise Vocal</h3>
                <div class="stat-row"><span class="stat-label">🎤 Imitação:</span><span class="stat-value">${report.imitationScore}%</span></div>
                <div class="stat-row"><span class="stat-label">👂 Discriminação:</span><span class="stat-value">${report.discriminationScore}%</span></div>
                <div class="stat-row"><span class="stat-label">⚠️ Confusões:</span><span class="stat-value">${report.confusionsDetected}</span></div>
            </div>
            <div class="options-container" style="margin-top: 20px;">
                <button class="option-button primary" onclick="location.reload()">Jogar Novamente</button>
                <button class="option-button blue" onclick="goToMainPage()">Voltar</button>
            </div>
        </div>`;
}

function goToMainPage() {
    window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-auditivo.html';
}

// Iniciar tempo de rodada
const roundStartTime = performance.now();