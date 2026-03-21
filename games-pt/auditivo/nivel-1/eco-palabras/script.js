// ========================
// O ECO DAS PALAVRAS - SCRIPT COMPLETO
// Com análise de pronúncia avançada
// ========================

// Variáveis globais
let currentRound = 0;
let score = 0;
let currentWord = null;
let isRecording = false;
let hasPlayed = false;
let difficulty = 'easy';
let recognitionActive = false;
var analyzer = analyzer || null;
let roundStartTime = null;
let roundTimes = [];

const words = [
    { src: "https://tse1.mm.bing.net/th/id/OIP.z589HEF6wuRZZR-B9C49RQHaFK?rs=1&pid=ImgDetMain&o=7&rm=3", name: "sol", audio: "sol", color: "primary", difficulty: 'easy' },
    { src: "https://img.freepik.com/vector-premium/icono-luna-lindo-estilo-dibujos-animados_74102-7166.jpg?w=2000", name: "lua", audio: "lua", color: "blue", difficulty: 'easy' },
    { src: "https://img.freepik.com/vector-premium/estrella-dibujada-mano-plana-elegante-mascota-personaje-dibujos-animados-dibujo-pegatina-icono-concepto-aislado_730620-302755.jpg", name: "estrela", audio: "estrela", color: "red", difficulty: 'medium' },
    { src: "https://static.vecteezy.com/system/resources/previews/024/190/108/non_2x/cute-cartoon-cloud-kawaii-weather-illustrations-for-kids-free-png.png", name: "nuvem", audio: "nuvem", color: "purple", difficulty: 'easy' },
    { src: "https://img.freepik.com/fotos-premium/estilo-ilustracion-vectorial-lluvia-dibujos-animados_750724-13162.jpg", name: "chuva", audio: "chuva", color: "accent", difficulty: 'hard' },
    { src: "https://img.freepik.com/vector-premium/ilustracion-vectorial-dibujos-animados-dinosaurio-lindo_104589-158.jpg", name: "dinossauro", audio: "dinossauro", color: "green", difficulty: 'hard' },
    { src: "https://img.freepik.com/vector-premium/dibujos-animados-mariposa-linda-aislado-blanco_29190-4712.jpg", name: "borboleta", audio: "borboleta", color: "pink", difficulty: 'hard' },
    { src: "https://img.freepik.com/vector-premium/computadora-portatil-dibujos-animados-aislada-blanco_29190-4354.jpg", name: "computador", audio: "computador", color: "blue", difficulty: 'hard' },
    { src: "https://static.vecteezy.com/system/resources/previews/008/132/083/non_2x/green-tree-cartoon-isolated-on-white-background-illustration-of-green-tree-cartoon-free-vector.jpg", name: "árvore", audio: "arvore", color: "primary", difficulty: 'medium' },
];

const totalRounds = 5;
let recognition;

// ========================
// INICIALIZAÇÃO DO JOGO
// ========================

document.addEventListener('DOMContentLoaded', function() {
  loadHighScore();
  setupSpeechRecognition();
  setupEventListeners();
  initializeAnalyzer();
  startNewRound();
});

// ========================
// CONFIGURAR RECONHECIMENTO DE VOZ
// ========================

function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = function() {
            recognitionActive = true;
            console.log('Reconhecimento de voz iniciado');
        };

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript.toLowerCase().trim();
            console.log('Transcript:', transcript);
            analyzePronounciation(transcript);
        };

        recognition.onerror = function(event) {
          console.error('Erro no reconhecimento de voz:', event.error);

            if (event.error === 'network') {
                showFeedback('Erro de rede. Certifique-se de estar no Chrome/Edge e ter internet.', false);
            } else if (event.error === 'not-allowed') {
                showFeedback('Ops! Preciso de permissão para usar o microfone.', false);
            }

            // IMPORTANTE: Resetar o estado para que a criança possa tentar de novo
            stopRecording();
            isRecording = false;
            const recordButton = document.getElementById('record-button');
            recordButton.innerHTML = '<i class="fas fa-microphone"></i> Tentar gravar novamente';
        };

        recognition.onend = function() {
            recognitionActive = false;
            console.log('Reconhecimento de voz finalizado');
        };
    } else {
        console.warn('Web Speech API não suportada neste navegador');
        alert('Seu navegador não suporta reconhecimento de voz. Por favor, use Chrome, Edge ou Safari.');
    }
}

// ========================
// INICIALIZAR ANALISADOR
// ========================

function initializeAnalyzer() {
    if (typeof PronunciationAnalyzer !== 'undefined') {
        if(!analyzer){
          analyzer = new PronunciationAnalyzer();
        }
        console.log('Analisador de pronúncia inicializado');
    }
}

// ========================
// CONFIGURAR EVENT LISTENERS
// ========================

function setupEventListeners() {
    const playButton = document.getElementById('play-button');
    const recordButton = document.getElementById('record-button');

    if (playButton) {
        playButton.addEventListener('click', playWord);
    }

    if (recordButton) {
        recordButton.addEventListener('click', toggleRecording);
    }
}

// ========================
// INICIAR NOVA RODADA
// ========================

function startNewRound() {
    console.log("--- Iniciando Rodada ---");
    console.log("Dificuldade atual:", difficulty);

    // 1. Limpamos histórico de erros do analisador
    if (analyzer) {
        analyzer.userHistory.failedPhonemes = [];
    }

    // 2. Filtragem segura
    let filteredWords = words.filter(w => {
        return w.difficulty.trim().toLowerCase() === difficulty.trim().toLowerCase();
    });

    console.log("Palavras encontradas para esta dificuldade:", filteredWords.length);

    // 3. Se não encontrar nada, usar nível 'easy' por padrão
    if (filteredWords.length === 0) {
        console.warn("Dificuldade não encontrada, forçando para 'easy'");
        filteredWords = words.filter(w => w.difficulty === 'easy');
    }

    // 4. Seleção aleatória
    const randomWord = filteredWords[Math.floor(Math.random() * filteredWords.length)];
    currentWord = randomWord;

    console.log("Palavra selecionada:", currentWord.name);

    hasPlayed = false;
    isRecording = false;

    roundStartTime = Date.now();
    updateUI();
    setTimeout(playWord, 1000);
}

// Função para obter e exibir o recorde
async function loadHighScore() {
    try {
        const gameId = 'eco-palabras-1';
        const bestScore = await api.getBestScore(gameId);

        const highScoreElement = document.getElementById('high-score-text');
        if (highScoreElement) {
            highScoreElement.textContent = `${bestScore} pts`;
        }
        return bestScore;
    } catch (error) {
        console.error("Erro ao carregar recorde:", error);
        return 0;
    }
}

// ========================
// ATUALIZAR INTERFACE
// ========================

function updateUI() {
    // Atualizar número da rodada
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('total-rounds').textContent = totalRounds;

    // Atualizar pontuação
    document.getElementById('score').textContent = score + ' pontos';
    document.getElementById('score-display').textContent = score + ' pontos';

    // Atualizar barra de progresso
    const progress = ((currentRound + 1) / totalRounds) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';

    // Atualizar imagem
    document.getElementById('current-image').src = currentWord.src;

    // Atualizar badge de dificuldade
    const badgeElement = document.getElementById('difficulty-badge');
    let diffText = 'Normal';
    if (difficulty === 'easy') {
        diffText = 'Fácil';
    } else if (difficulty === 'hard') {
        diffText = 'Difícil';
    }
    badgeElement.textContent = 'Dificuldade: ' + diffText;
    badgeElement.className = 'difficulty-badge ' + difficulty;

    // Limpar medidor de similaridade
    document.getElementById('similarity-meter').style.display = 'none';
    document.getElementById('similarity-fill').style.width = '0%';
    document.getElementById('similarity-text').textContent = '0%';
    document.getElementById('similarity-fill').className = 'similarity-fill';

    // Resetar botão de gravação
    const recordButton = document.getElementById('record-button');
    recordButton.innerHTML = '<i class="fas fa-microphone"></i> Gravar minha voz';
    recordButton.className = 'audio-button red';

    // Limpar feedback
    document.getElementById('feedback').classList.remove('show');
    document.getElementById('recorded-text').classList.remove('show');
}

// ========================
// REPRODUZIR PALAVRA
// ========================

function playWord() {
    if (!currentWord) return;

    const playButton = document.getElementById('play-button');
    playButton.innerHTML = '<i class="fas fa-volume-up"></i> Reproduzindo...';
    playButton.disabled = true;

    // Criar utterance para síntese de voz
    const utterance = new SpeechSynthesisUtterance(currentWord.name);
    utterance.lang = 'pt-BR';
    utterance.rate = difficulty === 'hard' ? 0.6 : 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = function() {
        playButton.innerHTML = '<i class="fas fa-volume-up"></i> Ouvir palavra';
        playButton.disabled = false;
        hasPlayed = true;
    };

    utterance.onerror = function(event) {
        console.error('Erro na síntese de voz:', event.error);
        playButton.innerHTML = '<i class="fas fa-volume-up"></i> Ouvir palavra';
        playButton.disabled = false;
        hasPlayed = true;
    };

    speechSynthesis.speak(utterance);
}

// ========================
// GRAVAR VOZ
// ========================

function toggleRecording() {
    if (!hasPlayed) {
        showFeedback('Primeiro ouça a palavra', false);
        return;
    }

    const recordButton = document.getElementById('record-button');

    if (!isRecording) {
        // Iniciar gravação
        isRecording = true;
        recordButton.innerHTML = '<i class="fas fa-stop"></i> Parar gravação';
        recordButton.className = 'audio-button red recording';

        if (recognition) {
            recognition.start();
        } else {
            showFeedback('Erro: Reconhecimento de voz não disponível', false);
            stopRecording();
        }
    } else {
        // Parar gravação
        stopRecording();
    }
}

// ========================
// PARAR GRAVAÇÃO
// ========================

function stopRecording() {
    isRecording = false;
    const recordButton = document.getElementById('record-button');
    recordButton.innerHTML = '<i class="fas fa-microphone"></i> Analisando...';
    recordButton.className = 'audio-button red';

    if (recognition) {
        recognition.stop();
    }
}

// ========================
// ANALISAR PRONÚNCIA
// ========================

function analyzePronounciation(transcript) {
    // Inicializar analisador se não existir
    if (!analyzer) {
        analyzer = new PronunciationAnalyzer();
    }

    // Analisar usando a classe PronunciationAnalyzer
    const result = analyzer.analyze(currentWord.name, transcript);
    const similarity = result.score;

    // Mostrar texto gravado
    const recordedTextElement = document.getElementById('recorded-text');
    document.getElementById('recorded-text-content').textContent = '"' + transcript + '"';
    recordedTextElement.classList.add('show');

    // Atualizar medidor de similaridade
    document.getElementById('similarity-meter').style.display = 'block';
    document.getElementById('similarity-fill').style.width = similarity + '%';
    document.getElementById('similarity-text').textContent = similarity + '%';

    // Mudar cor do medidor conforme resultado
    const fillElement = document.getElementById('similarity-fill');
    fillElement.className = 'similarity-fill';
    if (similarity >= 70) {
        fillElement.classList.add('success');
    } else if (similarity >= 50) {
        fillElement.classList.add('warning');
    } else {
        fillElement.classList.add('error');
    }

    // Determinar se está correto
    const isCorrect = similarity >= 70;
    const pointsEarned = Math.floor(similarity / 10);

    // Mostrar feedback
    if (isCorrect) {
        score += pointsEarned;
        const feedbackMsg = result.feedback.emoji + ' ' + result.feedback.messages[0];
        showFeedback(feedbackMsg, true);

        if (similarity >= 95 && difficulty === 'medium') {
            difficulty = 'hard';
        } else if (similarity >= 90 && difficulty === 'easy') {
            difficulty = 'medium';
        }
    } else {
        const feedbackMsg = result.feedback.emoji + ' ' + result.feedback.messages[0];
        showFeedback(feedbackMsg, false);

        // Reduzir dificuldade se estiver indo mal
        if (similarity < 50 && difficulty !== 'easy') {
            difficulty = 'easy';
        }
    }

    // Atualizar pontuação na tela
    document.getElementById('score').textContent = score + ' pontos';
    document.getElementById('score-display').textContent = score + ' pontos';

    // Log para debug
    console.log('Resultado:', {
        palavra: currentWord.name,
        gravado: transcript,
        similaridade: similarity,
        pontos: pointsEarned,
        erros: result.errors,
        feedback: result.feedback
    });
    const responseTime = Date.now() - roundStartTime;
    roundTimes.push(responseTime);

    console.log(`Rodada ${currentRound + 1}: ${responseTime}ms`);

    // Avançar para próxima rodada após 2.5 segundos
    setTimeout(function() {
        if (currentRound + 1 >= totalRounds) {
            completeGame();
        } else {
            currentRound++;
            startNewRound();
        }
    }, 2500);
}

// ========================
// MOSTRAR FEEDBACK
// ========================

function showFeedback(message, isCorrect) {
    const feedbackElement = document.getElementById('feedback');
    const feedbackText = document.getElementById('feedback-text');

    feedbackText.textContent = message;

    if (isCorrect) {
        feedbackElement.className = 'feedback correct show';
    } else {
        feedbackElement.className = 'feedback incorrect show';
    }
}

// ========================
// COMPLETAR JOGO
// ========================

async function completeGame() {
    const audioCard = document.getElementById('audio-card');
    const reportData = getPlayerReport();
    const promedio = Math.round(score / totalRounds);
    const totalTime = roundTimes.reduce((acc,time) => acc + time, 0);
    const averageResponseTime = Math.round(totalTime / roundTimes.length);
    const gameData = {
        gameId: 'eco-palabras-1',
        style: 'auditivo',
        level: difficulty === 'hard' ? 3 : (difficulty === 'easy' ? 1 : 2),
        score: score,
        accuracy: reportData ? reportData.averageScore : Math.round(score / totalRounds),
        responseTime: averageResponseTime
    };

    try {
    console.log("Tentando salvar na api ", gameData);
      await api.saveGameResults(gameData);
      console.log('Progresso salvo no backend');

    } catch (error){
      console.error('Erro ao salvar ', error);
    }

    // Obter relatório se o analisador estiver disponível
    let reporteExtra = '';
    if (analyzer) {
        const report = analyzer.getProgressReport();
        if (report.weakPhonemes.length > 0) {
            reporteExtra = '<p style="color: #6B7280; font-size: 14px; margin-top: 15px;">Sons para praticar: ' + report.weakPhonemes.join(', ') + '</p>';
        }
    }

    let html = '<div class="game-completed">';
    html += '<h2 style="margin-bottom: 20px; color: #0066CC;">Jogo Concluído!</h2>';
    html += '<div class="final-score">';
    html += '<h2>Sua pontuação final:</h2>';
    html += '<div class="score-number">' + score + '</div>';
    html += '<p>pontos</p>';
    html += '</div>';
    html += '<p style="color: #6B7280; margin-bottom: 20px;">Média: ' + promedio + '% por rodada</p>';
    html += reporteExtra;
    html += '<div class="options-container">';
    html += '<button class="option-button primary" onclick="location.reload()">';
    html += '<i class="fas fa-redo"></i> Jogar Novamente';
    html += '</button>';
    html += '<button class="option-button blue" onclick="goToMainPage()">';
    html += '<i class="fas fa-arrow-left"></i> Voltar ao Menu';
    html += '</button>';
    html += '</div>';
    html += '</div>';

    audioCard.innerHTML = html;
}

// ========================
// VOLTAR À PÁGINA PRINCIPAL
// ========================

function goToMainPage() {
    window.location.href = '../../../../selectores/selector-auditivo.html';
}

// ========================
// FUNÇÕES AUXILIARES
// ========================

/**
 * Obter relatório de progresso do jogador
 * Útil para mostrar ao pai ou terapeuta
 */
function getPlayerReport() {
    if (!analyzer) {
        return null;
    }

    const report = analyzer.getProgressReport();

    return {
        totalAttempts: report.totalAttempts,
        averageScore: report.averageScore,
        strongPhonemes: report.strongPhonemes,
        weakPhonemes: report.weakPhonemes,
        recommendedFocus: report.recommendedFocus,
        totalScore: score,
        currentDifficulty: difficulty
    };
}

/**
 * Exibir relatório no console (para debug)
 */
function logReport() {
    const report = getPlayerReport();
    console.table(report);
    console.log('Histórico completo:', analyzer.userHistory.attempts);
}