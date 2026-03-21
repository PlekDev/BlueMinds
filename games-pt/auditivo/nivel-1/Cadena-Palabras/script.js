// ========================
// ANALISADOR DE MEMÓRIA AUDITIVA
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

        // Verificar se a ordem está correta
        const isCorrect = JSON.stringify(expectedSequence) === JSON.stringify(selectedSequence);

        // Calcular precisão parcial (quantas na ordem correta)
        let partialMatches = 0;
        for (let i = 0; i < Math.min(expectedSequence.length, selectedSequence.length); i++) {
            if (expectedSequence[i] === selectedSequence[i]) {
                partialMatches++;
            } else {
                break;
            }
        }
        const accuracy = (partialMatches / expectedSequence.length) * 100;

        // Calcular velocidade de processamento (ms por palavra)
        const processingSpeed = timeElapsed / expectedSequence.length;

        // Gerar pontuação
        const score = this.generateScore(accuracy, isCorrect, processingSpeed, selectedSequence.length);

        // Registrar tentativa
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
        // Pontuação base pela precisão
        let baseScore = accuracy;

        // Bônus por resposta correta
        if (isCorrect) {
            baseScore += 20;
        }

        // Ajuste por velocidade (respostas mais rápidas)
        if (processingSpeed < 2000) {
            baseScore += 10;
        } else if (processingSpeed < 5000) {
            baseScore += 5;
        }

        // Ajuste por dificuldade (mais palavras = mais difícil)
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
            message = 'Perfeito! Ordem correta';
            details.push('Você lembrou todas as palavras em ordem');
        } else if (accuracy >= 75) {
            emoji = '👍';
            message = 'Muito bem, quase lá';
            details.push('Você acertou ' + partialMatches + ' de ' + totalWords + ' palavras');
            details.push('Tente novamente com mais atenção');
        } else if (accuracy >= 50) {
            emoji = '📝';
            message = 'Você precisa praticar mais';
            details.push('Você lembrou ' + partialMatches + ' palavras');
            details.push('Ouça novamente com muita atenção');
        } else {
            emoji = '💪';
            message = 'Continue tentando';
            details.push('A memória auditiva melhora com a prática');
            details.push('Pressione "Repetir" para tentar de novo');
        }

        return {
            emoji: emoji,
            message: message,
            details: details
        };
    }

    generateAnalysis(attempt) {
        return {
            exactness: attempt.isCorrect ? 'Exato' : 'Incompleto',
            memorized: attempt.partialMatches + '/' + attempt.expectedSequence.length,
            responseTime: Math.round(attempt.timeElapsed) + 'ms',
            processingSpeed: Math.round(attempt.processingSpeed) + 'ms/palavra',
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
// VARIÁVEIS DO JOGO
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

// Banco de dados de palavras com imagens
const wordDatabase = {
    'maçã': 'https://img.freepik.com/vector-premium/dibujos-animados-clipart-manzana-dibujo-ilustracion_871209-13267.jpg?w=2000',
    'pera': 'https://img.freepik.com/vector-gratis/fruta-pera-aislada-sobre-fondo-blanco_1308-117166.jpg?semt=ais_hybrid&w=740',
    'uva': 'https://static.vecteezy.com/system/resources/previews/021/964/649/large_2x/grapes-fruit-cartoon-colored-clipart-illustration-free-vector.jpg',
    'banana': 'https://static.vecteezy.com/system/resources/previews/004/557/519/original/fruit-banana-cartoon-object-vector.jpg',
    'laranja': 'https://img.freepik.com/vector-premium/ilustracion-vectorial-dibujos-animados-color-naranja_871209-3168.jpg?w=2000',
    'morango': 'https://i.pinimg.com/originals/c8/32/6a/c8326ac10514ba82a4ee79bcd8992c17.jpg',
    'melancia': 'https://static.vecteezy.com/system/resources/previews/007/570/246/original/cartoon-watermelon-slice-fruits-vector.jpg',
    'limão': 'https://static.vecteezy.com/system/resources/previews/004/485/242/original/lemon-fruit-illustrations-free-vector.jpg'
};

// ========================
// INICIALIZAÇÃO
// ========================

document.addEventListener('DOMContentLoaded', async function() {
// 1. Tentar carregar o recorde pessoal
    try {
        const gameId = 'cadena-palabras-1'; // ID único para este jogo
        const bestScore = await api.getBestScore(gameId);

        // Buscamos um lugar para exibir, por exemplo junto à pontuação atual
        const scoreContainer = document.querySelector('.score-container');
        if (scoreContainer) {
            const highSubstitute = document.createElement('div');
            highSubstitute.className = 'high-score-tag';
            highSubstitute.innerHTML = `⭐ Recorde: <span id="high-score">${bestScore}</span> pts`;
            highSubstitute.style = "font-size: 0.8rem; color: #f59e0b; font-weight: bold; margin-top: 5px;";
            scoreContainer.appendChild(highSubstitute);
        }
    } catch (error) {
        console.log("Não foi possível carregar o recorde (possivelmente modo visitante)");
    }
    startNewRound();
});

function startNewRound() {
    // Cancelar qualquer síntese de voz em andamento
    speechSynthesis.cancel();

    // Ajustar dificuldade conforme a rodada
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

    // Limpar UI completamente
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
    document.getElementById('score').textContent = score + ' pontos';
    document.getElementById('score-display').textContent = score + ' pontos';

    const progress = ((currentRound + 1) / totalRounds) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';

    const badgeElement = document.getElementById('difficulty-badge');
    let diffText = 'Fácil';
    if (difficulty === 'medium') diffText = 'Médio';
    if (difficulty === 'hard') diffText = 'Difícil';
    badgeElement.textContent = 'Dificuldade: ' + diffText;
    badgeElement.className = 'difficulty-badge ' + difficulty;

    const instructionElement = document.getElementById('instruction-text');
    let instructionText = 'Ouça ' + sequenceLength + ' palavras e selecione as imagens em ordem';
    instructionElement.textContent = instructionText;
}

function generateNewSequence() {
    const keys = Object.keys(wordDatabase);
    currentSequence = [];

    // Selecionar palavras aleatórias para a sequência
    while (currentSequence.length < sequenceLength) {
        const randomWord = keys[Math.floor(Math.random() * keys.length)];
        if (!currentSequence.includes(randomWord)) {
            currentSequence.push(randomWord);
        }
    }

    // Gerar todas as opções (sequência + distratores)
    allWords = [...currentSequence];

    while (allWords.length < 4) {
        const randomWord = keys[Math.floor(Math.random() * keys.length)];
        if (!allWords.includes(randomWord)) {
            allWords.push(randomWord);
        }
    }

    // Embaralhar as opções
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
        container.innerHTML = '<span style="color: #9CA3AF;">Selecione as imagens em ordem</span>';
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

    // Atualizar cards visuais
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
    if (gameStarted && isAnalyzing) return; // Evitar clique duplo

    gameStarted = true;
    roundStartTime = performance.now();

    const sequenceDisplay = document.getElementById('sequence-display');
    sequenceDisplay.style.display = 'flex';

    // Cancelamos qualquer voz anterior por segurança
    window.speechSynthesis.cancel();

    const speechRate = difficulty === 'hard' ? 1.0 : (difficulty === 'medium' ? 0.85 : 0.7);

    playSequenceAudio(currentSequence, 0, speechRate);
}

// 1. Função para obter a voz de forma segura
function getPortugueseVoice() {
    const voices = window.speechSynthesis.getVoices();
    // Prioridade: Brasil, depois Portugal, depois qualquer português
    return voices.find(v => v.lang === 'pt-BR') ||
           voices.find(v => v.lang.includes('pt')) ||
           voices[0];
}

function playSequenceAudio(words, index, speechRate) {
    if (index >= words.length) {
        setTimeout(() => {
            document.getElementById('sequence-display').style.display = 'none';
            document.getElementById('repeat-button').style.display = 'inline-flex';
        }, 1000);
        return;
    }

    const sequenceDisplay = document.getElementById('sequence-display');
    const sequenceText = document.getElementById('sequence-text');

    // Mostramos o container e a palavra
    sequenceDisplay.style.display = 'flex';
    sequenceText.textContent = words[index];

    // --- EFEITO VISUAL (Neuro-feedback) ---
    sequenceText.style.transform = 'scale(1.5)';
    sequenceText.style.color = '#FF5733'; // Cor chamativa
    sequenceText.style.transition = 'all 0.3s ease';

    setTimeout(() => {
        sequenceText.style.transform = 'scale(1)';
        sequenceText.style.color = '#0066CC';
    }, 400);

    // --- TENTATIVA DE VOZ (Se funcionar, ótimo; se não, a criança lê) ---
    try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(words[index]);
        utterance.lang = 'pt-BR';
        utterance.rate = speechRate;
        window.speechSynthesis.speak(utterance);
    } catch (e) {
        console.warn("API de voz não suportada neste navegador.");
    }

    // Próxima palavra baseada no tempo (independente de ter tocado ou não)
    setTimeout(() => {
        playSequenceAudio(words, index + 1, speechRate);
    }, 1200); // 1.2 segundos por palavra para dar tempo de processar
}

// 2. IMPORTANTE: Forçar o carregamento de vozes no início
window.speechSynthesis.getVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
        console.log("Vozes carregadas: ", window.speechSynthesis.getVoices().length);
    };
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

    // Atualizar pontuação
    score += result.score;
    document.getElementById('score').textContent = score + ' pontos';
    document.getElementById('score-display').textContent = score + ' pontos';

    // Marcar respostas incorretas
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

    // Passar para a próxima rodada
    setTimeout(() => {
        // Limpar feedback antes de mudar de rodada
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

    let analysisHTML = '<div class="stat-row"><span class="stat-label">Precisão:</span><span class="stat-value">' + result.accuracy.toFixed(0) + '%</span></div>';
    analysisHTML += '<div class="stat-row"><span class="stat-label">Memorizadas:</span><span class="stat-value">' + result.analysis.memorized + '</span></div>';
    analysisHTML += '<div class="stat-row"><span class="stat-label">Tempo:</span><span class="stat-value">' + result.analysis.responseTime + '</span></div>';
    analysisHTML += '<div class="stat-row"><span class="stat-label">Velocidade:</span><span class="stat-value">' + result.analysis.processingSpeed + '</span></div>';
    analysisHTML += '<div class="stat-row"><span class="stat-label">Pontos:</span><span class="stat-value">' + result.score + ' pts</span></div>';

    analysisBox.innerHTML = analysisHTML;

    feedbackElement.className = result.isCorrect ? 'feedback show correct' : 'feedback show incorrect';
    feedbackElement.style.display = 'block';
}

const API_URL = 'https://crude-sailfish-blueminds-65b642e8.koyeb.app/api';

async function completeGame() {
    const mainCard = document.getElementById('main-card');
    const report = analyzer.getSessionReport();

    // --- NOVO: Lógica de salvamento no Backend ---
    const token = localStorage.getItem('token'); // Recuperamos o JWT

    const gameData = {
        gameId: 'cadena-palabras-1',
        style: 'auditivo',
        level: difficulty === 'hard' ? 3 : (difficulty === 'medium' ? 2 : 1),
        score: score,
        accuracy: report.averageAccuracy,
        responseTime: report.averageResponseTime
    };

        try {
          await api.saveGameResults(gameData);
          console.log('Progresso salvo com sucesso');
        } catch (error) {
            console.error('❌ Erro ao conectar com o servidor:', error);
        }
    // --- FIM DA LÓGICA DE BACKEND ---

    // Código original de UI (mantido igual)
    let html = '<div class="game-completed">';
    html += '<h2 style="margin-bottom: 20px; color: #0066CC;">Jogo Concluído!</h2>';
    html += '<div class="final-score">';
    html += '<h2>Pontuação Final:</h2>';
    html += '<div class="score-number">' + score + '</div>';
    html += '<p>pontos</p>';
    html += '</div>';
    html += '<div class="analysis-box">';
    html += '<div class="stat-row"><span class="stat-label">Respostas Corretas:</span><span class="stat-value">' + report.correctAttempts + '/' + report.totalAttempts + '</span></div>';
    html += '<div class="stat-row"><span class="stat-label">Precisão Média:</span><span class="stat-value">' + report.averageAccuracy + '%</span></div>';
    html += '<div class="stat-row"><span class="stat-label">Pontuação de Memória:</span><span class="stat-value">' + report.memoryScore + '%</span></div>';
    html += '<div class="stat-row"><span class="stat-label">Velocidade Média:</span><span class="stat-value">' + report.averageResponseTime + 'ms</span></div>';
    html += '</div>';
    html += '<div class="options-container" style="margin-top: 20px;">';
    html += '<button class="option-button primary" onclick="location.reload()"><i class="fas fa-redo"></i> Jogar Novamente</button>';
    html += '<button class="option-button blue" onclick="goToMainPage()"><i class="fas fa-arrow-left"></i> Voltar</button>';
    html += '</div>';
    html += '</div>';

    mainCard.innerHTML = html;
}

function goToMainPage() {
    window.location.href = '../../../../selectores/selector-auditivo.html';
}

// Pré-carregar vozes para evitar que a primeira palavra falhe
window.speechSynthesis.getVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}

// Event Listeners
document.getElementById('play-button').addEventListener('click', playSequence);
document.getElementById('repeat-button').addEventListener('click', repeatSequence);
document.getElementById('check-button').addEventListener('click', checkAnswer);