// Variáveis globais
let currentRound = 0;
let score = 0;
let currentWord = null;
let userAnswer = '';
let difficulty = 'normal';
let wrongAttempts = 0;
let hintUsed = false;
let phase = 0; // 0 = início, 1 = mostrar palavra, 2 = escrever
let countdownTimer = null;
let recordedWords = [];

// Palavras por dificuldade
const wordBanks = {
    easy: [
        { word: 'gato', image: 'https://static.vecteezy.com/system/resources/previews/013/089/641/original/illustration-of-cute-colored-cat-cat-cartoon-image-in-eps10-format-suitable-for-children-s-book-design-elements-introduction-of-cats-to-children-books-or-posters-about-animal-vector.jpg?w=400&h=300&fit=crop' },
        { word: 'sol', image: 'https://static.vecteezy.com/system/resources/previews/018/800/828/original/cartoon-bright-sun-icon-png.png?w=400&h=300&fit=crop' },
        { word: 'casa', image: 'https://static.vecteezy.com/system/resources/previews/006/986/358/original/house-illustration-cartoon-vector.jpg?w=400&h=300&fit=crop' },
        { word: 'água', image: 'https://static.vecteezy.com/system/resources/previews/012/781/853/non_2x/cute-water-drop-cartoon-character-giving-water-bottle-free-vector.jpg?w=400&h=300&fit=crop' },
        { word: 'flor', image: 'https://cdn.pixabay.com/photo/2022/12/13/05/16/flowers-7652496_1280.png?w=400&h=300&fit=crop' },
    ],
    normal: [
        { word: 'borboleta', image: 'https://static.vecteezy.com/system/resources/previews/014/655/698/original/butterfly-icon-cartoon-style-vector.jpg?w=400&h=300&fit=crop' },
        { word: 'telefone', image: 'https://static.vecteezy.com/system/resources/previews/011/157/544/large_2x/mobile-phone-cartoon-icon-illustration-technology-object-icon-concept-isolated-premium-flat-cartoon-style-vector.jpg?w=400&h=300&fit=crop' },
        { word: 'bicicleta', image: 'https://static.vecteezy.com/system/resources/previews/005/239/753/non_2x/bicycle-cartoon-illustration-free-vector.jpg?w=400&h=300&fit=crop' },
        { word: 'dinossauro', image: 'https://static.vecteezy.com/system/resources/previews/009/877/405/original/cute-little-triceratops-dinosaur-cartoon-sitting-vector.jpg?w=400&h=300&fit=crop' },
        { word: 'montanha', image: 'https://img.freepik.com/vector-premium/dibujo-dibujos-animados-montana-cielo-azul-campo-hierba-verde_1084749-7629.jpg?w=400&h=300&fit=crop' },
    ],
    hard: [
        { word: 'extraordinário', image: 'https://img.freepik.com/vector-premium/persona-emocionada-asombrada-que-reacciona-algo-inesperado-concepto-efecto-guau-mujer-feliz-mirando-algo-increible-alegria-extasis-reaccion-ilustracion-vectorial-plana-aislada-sobre-fondo-blanco_198278-15226.jpg?w=400&h=300&fit=crop' },
        { word: 'hipopótamo', image: 'https://static.vecteezy.com/system/resources/previews/005/561/609/non_2x/hippo-cartoon-colored-illustration-free-vector.jpg?w=400&h=300&fit=crop' },
        { word: 'pesquisador', image: 'https://img.freepik.com/vector-premium/lindo-chico-detective-lupa-ilustraciones-vectoriales-dibujos-animados_1057-118480.jpg?w=400&h=300&fit=crop' },
        { word: 'arquitetura', image: 'https://img.freepik.com/vector-premium/arquitecto-trabajando-construccion_75487-439.jpg?w=400&h=300&fit=crop' },
        { word: 'biblioteca', image: 'https://img.freepik.com/vector-premium/ninos-dibujos-animados-que-estudian-biblioteca_29190-5145.jpg?w=400&h=300&fit=crop' },
    ]
};

const totalRounds = 5;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    showStartPhase();
});

// Event listeners
function setupEventListeners() {
    document.getElementById('start-button').addEventListener('click', startNewRound);
    document.getElementById('check-button').addEventListener('click', checkAnswer);
    document.getElementById('reset-button').addEventListener('click', resetRound);
    document.getElementById('hint-button').addEventListener('click', showHint);
    document.getElementById('write-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
    });
}

// Mostrar fase inicial
function showStartPhase() {
    document.getElementById('phase1').classList.add('hidden');
    document.getElementById('phase2').classList.add('hidden');
    document.getElementById('start-button').style.display = 'inline-flex';
    document.getElementById('check-button').style.display = 'none';
    document.getElementById('hint-button').style.display = 'none';
    document.getElementById('reset-button').style.display = 'none';

    updateUI();
}

// Selecionar banco por dificuldade
function selectWordBank() {
    if (wrongAttempts >= 2) {
        difficulty = 'easy';
        return wordBanks.easy;
    } else if (score >= 70 && currentRound > 2) {
        difficulty = 'hard';
        return wordBanks.hard;
    } else {
        difficulty = 'normal';
        return wordBanks.normal;
    }
}

// Iniciar nova rodada
function startNewRound() {
    const wordBank = selectWordBank();
    const randomIndex = Math.floor(Math.random() * wordBank.length);

    currentWord = wordBank[randomIndex];
    userAnswer = '';
    wrongAttempts = 0;
    hintUsed = false;
    recordedWords.push({ word: currentWord.word, length: currentWord.word.length });

    updateUI();
    showPhase1();
}

// Atualizar UI geral
function updateUI() {
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('score').textContent = score + ' pontos';
    document.getElementById('score-display').textContent = score + ' pontos';

    const progress = ((currentRound + 1) / totalRounds) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';

    updateDifficulty();
}

// Mostrar Fase 1: Imagem com palavra
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

// Contagem regressiva
function startCountdown(seconds) {
    let remaining = seconds;
    document.getElementById('countdown').textContent = remaining;

    const endTime = Date.now() + (seconds * 1000);

    const updateCountdown = () => {
        const now = Date.now();
        const timeLeft = Math.max(0, endTime - now);
        remaining = Math.ceil(timeLeft / 1000);

        document.getElementById('countdown').textContent = remaining;
        const fillPercent = (timeLeft / (seconds * 1000)) * 100;
        document.getElementById('countdown-fill').style.width = fillPercent + '%';

        if (timeLeft > 0) {
            countdownTimer = setTimeout(updateCountdown, 50);
        } else {
            clearTimeout(countdownTimer);
            showPhase2();
        }
    };

    updateCountdown();
}

// Mostrar Fase 2: Escrever palavra
function showPhase2() {
    document.getElementById('phase1').classList.add('hidden');
    document.getElementById('phase2').classList.remove('hidden');
    document.getElementById('start-button').style.display = 'none';
    document.getElementById('check-button').style.display = 'inline-flex';
    document.getElementById('hint-button').style.display = 'inline-flex';
    document.getElementById('reset-button').style.display = 'inline-flex';

    const input = document.getElementById('write-input');
    input.value = '';
    input.classList.remove('correct', 'incorrect');
    input.focus();

    document.getElementById('word-length-info').textContent = `Comprimento: ${currentWord.word.length} letras`;

    const complexity = currentWord.word.length <= 4 ? 'Fácil' :
                     currentWord.word.length <= 8 ? 'Normal' : 'Difícil';
    document.getElementById('word-complexity-info').textContent = `Dificuldade: ${complexity}`;
    document.getElementById('word-difficulty').classList.remove('hidden');

    phase = 2;
    document.getElementById('feedback').classList.add('hidden');
}

// Mostrar dica
function showHint() {
    if (hintUsed) {
        showFeedback("Você já usou a dica", false);
        return;
    }

    hintUsed = true;
    const word = currentWord.word;

    const hintsList = document.getElementById('hints-list');
    hintsList.innerHTML = '';

    for (let i = 0; i < word.length; i++) {
        const letterDiv = document.createElement('div');
        letterDiv.className = 'hint-letter';
        letterDiv.textContent = i === 0 || i === word.length - 1 ? word[i] : '?';
        hintsList.appendChild(letterDiv);
    }

    document.getElementById('letter-hints').classList.remove('hidden');
    showFeedback("💡 Primeira e última letra mostradas", true);
}

// Algoritmo de Levenshtein para tolerância ortográfica
function levenshteinDistance(a, b) {
    const aLower = a.toLowerCase().trim();
    const bLower = b.toLowerCase().trim();

    if (aLower === bLower) return 0;

    const m = aLower.length;
    const n = bLower.length;
    const dp = Array(n + 1).fill(null).map(() => Array(m + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (aLower[i - 1] === bLower[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }

    return dp[m][n];
}

// Verificar resposta
function checkAnswer() {
    userAnswer = document.getElementById('write-input').value.trim();

    if (!userAnswer) {
        showFeedback("Por favor escreva uma palavra", false);
        return;
    }

    const distance = levenshteinDistance(userAnswer, currentWord.word);
    const maxDistance = Math.max(userAnswer.length, currentWord.word.length);
    const similarity = 1 - (distance / maxDistance);

    const isCorrect = similarity >= 0.85;

    if (isCorrect) {
        let points = 20;
        if (hintUsed) points = 15;
        if (wrongAttempts > 0) points = Math.max(10, points - (wrongAttempts * 5));

        score += points;
        showFeedback(`Correto! "${currentWord.word}" +${points} pontos 🎉`, true);

        const input = document.getElementById('write-input');
        input.classList.add('correct');

        document.getElementById('check-button').disabled = true;
        document.getElementById('reset-button').disabled = true;
        document.getElementById('hint-button').disabled = true;

        setTimeout(() => {
            if (currentRound + 1 >= totalRounds) {
                completeGame();
            } else {
                currentRound++;
                startNewRound();
                document.getElementById('check-button').disabled = false;
                document.getElementById('reset-button').disabled = false;
                document.getElementById('hint-button').disabled = false;
            }
        }, 2500);
    } else {
        wrongAttempts++;
        showFeedback(`Incorreto. A palavra era: "${currentWord.word}"`, false);

        const input = document.getElementById('write-input');
        input.classList.add('incorrect');

        updateDifficulty();
    }

    document.getElementById('score').textContent = score + ' pontos';
    document.getElementById('score-display').textContent = score + ' pontos';
}

// Reiniciar rodada
function resetRound() {
    document.getElementById('write-input').value = '';
    document.getElementById('write-input').classList.remove('correct', 'incorrect');
    document.getElementById('write-input').focus();
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('letter-hints').classList.add('hidden');
    wrongAttempts = 0;
    hintUsed = false;
    userAnswer = '';
}

// Mostrar feedback
function showFeedback(message, isCorrect) {
    const feedbackElement = document.getElementById('feedback');
    feedbackElement.textContent = message;
    feedbackElement.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
    feedbackElement.classList.remove('hidden');
}

// Atualizar dificuldade
function updateDifficulty() {
    let newDifficulty = 'normal';

    if (wrongAttempts >= 2) {
        newDifficulty = 'easy';
    } else if (score >= 70 && currentRound > 2) {
        newDifficulty = 'hard';
    }

    const badge = document.getElementById('difficulty-badge');
    const texts = { 'easy': '🎯 Fácil', 'normal': 'Normal', 'hard': '⭐ Avançado' };
    badge.textContent = texts[newDifficulty];
}

// Completar jogo
function completeGame() {
    const avgLength = (recordedWords.reduce((sum, w) => sum + w.length, 0) / recordedWords.length).toFixed(1);
    const maxLength = Math.max(...recordedWords.map(w => w.length));
    const minLength = Math.min(...recordedWords.map(w => w.length));

    const escribeCard = document.querySelector('.escribe-card');
    escribeCard.innerHTML = `
        <h2>Jogo Concluído! 🏆</h2>
        <div class="feedback correct" style="margin-top: 20px;">
            <p><strong>Sua pontuação final:</strong> ${score} pontos</p>
        </div>
        <div class="explanation" style="margin-top: 20px;">
            <h3>Estatísticas de Palavras</h3>
            <p><strong>Comprimento médio:</strong> ${avgLength} letras</p>
            <p><strong>Intervalo:</strong> ${minLength}-${maxLength} letras</p>
            <p><strong>Nível final:</strong> ${difficulty === 'easy' ? 'Fácil 🎯' : difficulty === 'hard' ? 'Avançado ⭐' : 'Normal'}</p>
            <p style="margin-top: 10px; font-size: 14px;">Excelente trabalho memorizando e escrevendo palavras!</p>
        </div>
        <div class="action-controls" style="margin-top: 30px;">
            <button class="action-button primary" onclick="location.reload()">
                <i class="fas fa-redo"></i> Jogar Novamente
            </button>
            <button class="action-button blue" onclick="goToMainPage()">
                <i class="fas fa-home"></i> Voltar ao Menu
            </button>
        </div>
    `;
}

// Voltar à página principal
function goToMainPage() {
    window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-lecto-escritor.html';
}