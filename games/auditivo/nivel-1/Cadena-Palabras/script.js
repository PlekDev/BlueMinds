// ========================
// ANALIZADOR DE MEMORIA AUDITIVA
// ========================

class AuditoryMemoryAnalyzer {
    constructor() {
        this.sessionStats = {
            totalAttempts: 0,
            correctAttempts: 0,
            totalTime: 0,
            averageAccuracy: 0,
            memoryScore: 0,
            processingSpeed: 0
        };
        this.attempts = [];
    }

    analyze(expectedSequence, selectedSequence, timeElapsed) {
        const startTime = performance.now();
        
        // Verificar si el orden es correcto
        const isCorrect = JSON.stringify(expectedSequence) === JSON.stringify(selectedSequence);
        
        // Calcular accuracy parcial (cuántos en orden correcto)
        let partialMatches = 0;
        for (let i = 0; i < Math.min(expectedSequence.length, selectedSequence.length); i++) {
            if (expectedSequence[i] === selectedSequence[i]) {
                partialMatches++;
            } else {
                break;
            }
        }
        const accuracy = (partialMatches / expectedSequence.length) * 100;
        
        // Calcular velocidad de procesamiento (ms por palabra)
        const processingSpeed = timeElapsed / expectedSequence.length;
        
        // Generar score
        const score = this.generateScore(accuracy, isCorrect, processingSpeed, selectedSequence.length);
        
        // Registrar intento
        const attempt = {
            timestamp: new Date(),
            expectedSequence: expectedSequence,
            selectedSequence: selectedSequence,
            isCorrect: isCorrect,
            accuracy: accuracy,
            partialMatches: partialMatches,
            timeElapsed: timeElapsed,
            processingSpeed: processingSpeed,
            score: score
        };
        
        this.attempts.push(attempt);
        this.updateSessionStats(attempt);
        
        return {
            isCorrect: isCorrect,
            accuracy: accuracy,
            partialMatches: partialMatches,
            score: score,
            timeElapsed: timeElapsed,
            processingSpeed: processingSpeed,
            feedback: this.generateFeedback(isCorrect, accuracy, partialMatches, expectedSequence.length),
            analysis: this.generateAnalysis(attempt)
        };
    }

    generateScore(accuracy, isCorrect, processingSpeed, sequenceLength) {
        // Puntaje base según accuracy
        let baseScore = accuracy;
        
        // Bonus por respuesta correcta
        if (isCorrect) {
            baseScore += 20;
        }
        
        // Ajuste por velocidad (respuestas más rápidas)
        if (processingSpeed < 2000) {
            baseScore += 10;
        } else if (processingSpeed < 5000) {
            baseScore += 5;
        }
        
        // Ajuste por dificultad (más palabras = más difícil)
        if (sequenceLength === 4) {
            baseScore += 5;
        } else if (sequenceLength === 5) {
            baseScore += 10;
        }
        
        return Math.min(100, Math.round(baseScore));
    }

    generateFeedback(isCorrect, accuracy, partialMatches, totalWords) {
        let emoji = '';
        let message = '';
        let details = [];
        
        if (isCorrect) {
            emoji = '🎉';
            message = '¡Perfecto! Orden correcto';
            details.push('Recordaste todas las palabras en orden');
        } else if (accuracy >= 75) {
            emoji = '👍';
            message = 'Muy bien, casi lo tienes';
            details.push('Acertaste ' + partialMatches + ' de ' + totalWords + ' palabras');
            details.push('Intenta nuevamente con más atención');
        } else if (accuracy >= 50) {
            emoji = '📝';
            message = 'Necesitas practicar más';
            details.push('Recordaste ' + partialMatches + ' palabras');
            details.push('Escucha de nuevo con mucha atención');
        } else {
            emoji = '💪';
            message = 'Sigue intentando';
            details.push('La memoria auditiva se mejora con práctica');
            details.push('Presiona "Repetir" para intentar de nuevo');
        }
        
        return {
            emoji: emoji,
            message: message,
            details: details
        };
    }

    generateAnalysis(attempt) {
        return {
            exactness: attempt.isCorrect ? 'Exacto' : 'Incompleto',
            memorized: attempt.partialMatches + '/' + attempt.expectedSequence.length,
            responseTime: Math.round(attempt.timeElapsed) + 'ms',
            processingSpeed: Math.round(attempt.processingSpeed) + 'ms/palabra',
            score: attempt.score
        };
    }

    updateSessionStats(attempt) {
        this.sessionStats.totalAttempts++;
        if (attempt.isCorrect) {
            this.sessionStats.correctAttempts++;
        }
        this.sessionStats.totalTime += attempt.timeElapsed;
        this.sessionStats.averageAccuracy = 
            (this.sessionStats.averageAccuracy * (this.sessionStats.totalAttempts - 1) + attempt.accuracy) / this.sessionStats.totalAttempts;
        this.sessionStats.memoryScore = 
            (this.sessionStats.correctAttempts / this.sessionStats.totalAttempts) * 100;
    }

    getSessionReport() {
        return {
            totalAttempts: this.sessionStats.totalAttempts,
            correctAttempts: this.sessionStats.correctAttempts,
            averageAccuracy: Math.round(this.sessionStats.averageAccuracy),
            memoryScore: Math.round(this.sessionStats.memoryScore),
            averageResponseTime: Math.round(this.sessionStats.totalTime / Math.max(1, this.sessionStats.totalAttempts))
        };
    }
}

// ========================
// VARIABLES DEL JUEGO
// ========================

let currentRound = 0;
let score = 0;
let difficulty = 'easy';
let sequenceLength = 3;
let currentSequence = [];
let selectedSequence = [];
let allWords = [];
let gameStarted = false;
let isAnalyzing = false;
let roundStartTime = 0;

const analyzer = new AuditoryMemoryAnalyzer();
const totalRounds = 5;

// Base de datos de palabras con imágenes
const wordDatabase = {
    'manzana': 'https://img.freepik.com/vector-premium/dibujos-animados-clipart-manzana-dibujo-ilustracion_871209-13267.jpg?w=2000',
    'pera': 'https://img.freepik.com/vector-gratis/fruta-pera-aislada-sobre-fondo-blanco_1308-117166.jpg?semt=ais_hybrid&w=740',
    'uva': 'https://static.vecteezy.com/system/resources/previews/021/964/649/large_2x/grapes-fruit-cartoon-colored-clipart-illustration-free-vector.jpg',
    'platano': 'https://static.vecteezy.com/system/resources/previews/004/557/519/original/fruit-banana-cartoon-object-vector.jpg',
    'naranja': 'https://img.freepik.com/vector-premium/ilustracion-vectorial-dibujos-animados-color-naranja_871209-3168.jpg?w=2000',
    'fresa': 'https://i.pinimg.com/originals/c8/32/6a/c8326ac10514ba82a4ee79bcd8992c17.jpg',
    'sandia': 'https://static.vecteezy.com/system/resources/previews/007/570/246/original/cartoon-watermelon-slice-fruits-vector.jpg',
    'limon': 'https://static.vecteezy.com/system/resources/previews/004/485/242/original/lemon-fruit-illustrations-free-vector.jpg'
};

// ========================
// INICIALIZACIÓN
// ========================

document.addEventListener('DOMContentLoaded', function() {
    startNewRound();
});

function startNewRound() {
    // Cancelar cualquier síntesis de voz en progreso
    speechSynthesis.cancel();
    
    // Ajustar dificultad según ronda
    if (currentRound < 2) {
        difficulty = 'easy';
        sequenceLength = 3;
    } else if (currentRound < 4) {
        difficulty = 'medium';
        sequenceLength = 4;
    } else {
        difficulty = 'hard';
        sequenceLength = 5;
    }

    // Limpiar UI completamente
    clearSelection();
    document.getElementById('feedback').classList.remove('show');
    document.getElementById('feedback').style.display = 'none';
    document.getElementById('sequence-display').style.display = 'none';
    
    updateUI();
    generateNewSequence();
    gameStarted = false;
    selectedSequence = [];
    updateSelectedSequence();

    document.getElementById('play-button').style.display = 'inline-flex';
    document.getElementById('repeat-button').style.display = 'none';
    document.getElementById('check-button').style.display = 'none';
}

function updateUI() {
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('total-rounds').textContent = totalRounds;
    document.getElementById('score').textContent = score + ' puntos';
    document.getElementById('score-display').textContent = score + ' puntos';

    const progress = ((currentRound + 1) / totalRounds) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';

    const badgeElement = document.getElementById('difficulty-badge');
    let diffText = 'Fácil';
    if (difficulty === 'medium') diffText = 'Medio';
    if (difficulty === 'hard') diffText = 'Difícil';
    badgeElement.textContent = 'Dificultad: ' + diffText;
    badgeElement.className = 'difficulty-badge ' + difficulty;

    const instructionElement = document.getElementById('instruction-text');
    let instructionText = 'Escucha ' + sequenceLength + ' palabras y selecciona las imágenes en orden';
    instructionElement.textContent = instructionText;
}

function generateNewSequence() {
    const keys = Object.keys(wordDatabase);
    currentSequence = [];
    
    // Seleccionar palabras aleatorias para la cadena
    while (currentSequence.length < sequenceLength) {
        const randomWord = keys[Math.floor(Math.random() * keys.length)];
        if (!currentSequence.includes(randomWord)) {
            currentSequence.push(randomWord);
        }
    }

    // Generar todas las opciones (cadena + distractores)
    allWords = [...currentSequence];
    
    while (allWords.length < 4) {
        const randomWord = keys[Math.floor(Math.random() * keys.length)];
        if (!allWords.includes(randomWord)) {
            allWords.push(randomWord);
        }
    }

    // Mezclar las opciones
    allWords = allWords.sort(() => Math.random() - 0.5);

    renderImages();
}

function renderImages() {
    const grid = document.getElementById('images-grid');
    grid.innerHTML = '';

    allWords.forEach(word => {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.innerHTML = `
            <img src="${wordDatabase[word]}" alt="${word}">
            <div class="image-label">${word}</div>
        `;
        card.addEventListener('click', () => selectImage(word, card));
        grid.appendChild(card);
    });
}

function selectImage(word, element) {
    if (isAnalyzing) return;
    if (!gameStarted) return;

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

    if (selectedSequence.length === sequenceLength) {
        document.getElementById('check-button').style.display = 'inline-flex';
    } else {
        document.getElementById('check-button').style.display = 'none';
    }
}

function updateSelectedSequence() {
    const container = document.getElementById('selected-items');
    
    if (selectedSequence.length === 0) {
        container.innerHTML = '<span style="color: #9CA3AF;">Selecciona las imágenes en orden</span>';
        return;
    }

    container.innerHTML = selectedSequence.map((word, index) => `
        <div class="selected-item">
            ${index + 1}. ${word}
            <button class="remove-btn" onclick="removeFromSelection(${index})">×</button>
        </div>
    `).join('');
}

function removeFromSelection(index) {
    selectedSequence.splice(index, 1);
    updateSelectedSequence();
    
    // Actualizar cards visuales
    const cards = document.querySelectorAll('.image-card');
    cards.forEach(card => card.classList.remove('selected', 'incorrect'));
    
    selectedSequence.forEach(word => {
        cards.forEach(card => {
            if (card.querySelector('.image-label').textContent === word) {
                card.classList.add('selected');
            }
        });
    });

    document.getElementById('check-button').style.display = 'none';
}

function clearSelection() {
    selectedSequence = [];
    updateSelectedSequence();
    
    document.querySelectorAll('.image-card').forEach(card => {
        card.classList.remove('selected', 'incorrect');
    });
    
    document.getElementById('check-button').style.display = 'none';
}

function playSequence() {
    if (gameStarted) return;
    
    gameStarted = true;
    roundStartTime = performance.now();
    
    const sequenceDisplay = document.getElementById('sequence-display');
    sequenceDisplay.style.display = 'flex';
    
    const utterances = currentSequence.map(word => word);
    const speechRate = difficulty === 'hard' ? 1.0 : difficulty === 'medium' ? 0.85 : 0.7;
    
    playSequenceAudio(utterances, 0, speechRate);
}

function playSequenceAudio(words, index, speechRate) {
    if (index >= words.length) {
        document.getElementById('sequence-display').style.display = 'none';
        document.getElementById('repeat-button').style.display = 'inline-flex';
        return;
    }

    const utterance = new SpeechSynthesisUtterance(words[index]);
    utterance.lang = 'es-ES';
    utterance.rate = speechRate;
    utterance.pitch = 1;
    
    const sequenceText = document.getElementById('sequence-text');
    sequenceText.textContent = words.slice(0, index + 1).join(', ');

    utterance.onend = () => {
        setTimeout(() => {
            playSequenceAudio(words, index + 1, speechRate);
        }, 800);
    };

    speechSynthesis.speak(utterance);
}

function repeatSequence() {
    clearSelection();
    playSequence();
}

function checkAnswer() {
    if (isAnalyzing || selectedSequence.length !== sequenceLength) return;
    
    isAnalyzing = true;
    const timeElapsed = performance.now() - roundStartTime;

    const result = analyzer.analyze(currentSequence, selectedSequence, timeElapsed);
    
    // Mostrar feedback
    showFeedback(result);
    
    // Actualizar puntuación
    score += result.score;
    document.getElementById('score').textContent = score + ' puntos';
    document.getElementById('score-display').textContent = score + ' puntos';

    // Marcar respuestas incorrectas
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

    // Pasar a siguiente ronda
    setTimeout(() => {
        // Limpiar feedback antes de cambiar de ronda
        document.getElementById('feedback').classList.remove('show');
        document.getElementById('feedback').style.display = 'none';
        isAnalyzing = false;
        
        if (currentRound + 1 >= totalRounds) {
            completeGame();
        } else {
            currentRound++;
            startNewRound();
        }
    }, 3500);
}

function showFeedback(result) {
    const feedbackElement = document.getElementById('feedback');
    const feedbackMessage = document.getElementById('feedback-message');
    const feedbackDetail = document.getElementById('feedback-detail');
    const analysisBox = document.getElementById('analysis-box');

    feedbackMessage.textContent = result.feedback.emoji + ' ' + result.feedback.message;
    feedbackDetail.textContent = result.feedback.details.join(' • ');

    let analysisHTML = '<div class="stat-row"><span class="stat-label">Exactitud:</span><span class="stat-value">' + result.accuracy.toFixed(0) + '%</span></div>';
    analysisHTML += '<div class="stat-row"><span class="stat-label">Memorizadas:</span><span class="stat-value">' + result.analysis.memorized + '</span></div>';
    analysisHTML += '<div class="stat-row"><span class="stat-label">Tiempo:</span><span class="stat-value">' + result.analysis.responseTime + '</span></div>';
    analysisHTML += '<div class="stat-row"><span class="stat-label">Velocidad:</span><span class="stat-value">' + result.analysis.processingSpeed + '</span></div>';
    analysisHTML += '<div class="stat-row"><span class="stat-label">Puntos:</span><span class="stat-value">' + result.score + ' pts</span></div>';

    analysisBox.innerHTML = analysisHTML;

    feedbackElement.className = result.isCorrect ? 'feedback show correct' : 'feedback show incorrect';
    feedbackElement.style.display = 'block';
}

function completeGame() {
    const mainCard = document.getElementById('main-card');
    const report = analyzer.getSessionReport();

    let html = '<div class="game-completed">';
    html += '<h2 style="margin-bottom: 20px; color: #0066CC;">¡Juego Completado!</h2>';
    html += '<div class="final-score">';
    html += '<h2>Puntuación Final:</h2>';
    html += '<div class="score-number">' + score + '</div>';
    html += '<p>puntos</p>';
    html += '</div>';
    html += '<div class="analysis-box">';
    html += '<div class="stat-row"><span class="stat-label">Respuestas Correctas:</span><span class="stat-value">' + report.correctAttempts + '/' + report.totalAttempts + '</span></div>';
    html += '<div class="stat-row"><span class="stat-label">Exactitud Promedio:</span><span class="stat-value">' + report.averageAccuracy + '%</span></div>';
    html += '<div class="stat-row"><span class="stat-label">Puntuación de Memoria:</span><span class="stat-value">' + report.memoryScore + '%</span></div>';
    html += '<div class="stat-row"><span class="stat-label">Velocidad Promedio:</span><span class="stat-value">' + report.averageResponseTime + 'ms</span></div>';
    html += '</div>';
    html += '<div class="options-container" style="margin-top: 20px;">';
    html += '<button class="option-button primary" onclick="location.reload()"><i class="fas fa-redo"></i> Jugar de Nuevo</button>';
    html += '<button class="option-button blue" onclick="goToMainPage()"><i class="fas fa-arrow-left"></i> Volver</button>';
    html += '</div>';
    html += '</div>';

    mainCard.innerHTML = html;
}

function goToMainPage() {
    window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-auditivo.html';
}

// Event Listeners
document.getElementById('play-button').addEventListener('click', playSequence);
document.getElementById('repeat-button').addEventListener('click', repeatSequence);
document.getElementById('check-button').addEventListener('click', checkAnswer);