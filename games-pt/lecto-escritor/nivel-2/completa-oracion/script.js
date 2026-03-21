// Variáveis globais
let currentRound = 0;
let score = 0;
let currentExercise = null;
let userAnswer = '';
let difficulty = 'normal';
let wrongAttempts = 0;
let hintUsed = false;
let startTime = 0;
let comprehensionLevel = 'normal';
let visualMemoryLevel = 'normal';
let spellingErrors = {};

// Algoritmo de distância de Levenshtein para tolerância ortográfica
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

const exercises = {
    easy: [
        {
            image: 'https://img.freepik.com/vector-premium/lindo-gato-naranja-durmiendo-clipart-ninos-personaje-gato-dibujos-animados_594975-459.jpg?w=400&h=300&fit=crop',
            before: 'O',
            after: 'dorme na casa.',
            correctAnswer: 'gato',
            alternatives: ['gatos', 'gata', 'gatinho'],
            explanation: 'A imagem mostra um gato dormindo. Completamos com a palavra singular "gato".',
            wordType: 'substantivo',
            difficulty: 1
        },
        {
            image: 'https://img.freepik.com/vector-premium/ilustracion-vectorial-dibujos-animados-pajaro-lindo-cantando_869472-1107.jpg?w=400&h=300&fit=crop',
            before: 'O pássaro',
            after: 'no galho.',
            correctAnswer: 'canta',
            alternatives: ['cantou', 'cantam', 'cantarei'],
            explanation: 'Um pássaro singular precisa de verbo singular. "Canta" é o verbo correto no presente.',
            wordType: 'verbo',
            difficulty: 1
        },
        {
            image: 'https://image.freepik.com/vector-gratis/pelota-deportiva-roja-pelota-goma-o-cuero-dibujos-animados-que-ninos-jueguen-al-aire-libre-juegos-ninos-ilustracion-vectorial-plana_81894-5611.jpg?w=400&h=300&fit=crop',
            before: 'A bola é',
            after: '.',
            correctAnswer: 'vermelha',
            alternatives: ['vermelhinha', 'vermelhos', 'vermelhas'],
            explanation: 'Bola é feminino singular. O adjetivo deve concordar: "vermelha".',
            wordType: 'adjetivo',
            difficulty: 1
        }
    ],
    normal: [
        {
            image: 'https://image.freepik.com/vector-gratis/ninos-jugando-parque_23-2147584893.jpg?w=400&h=300&fit=crop',
            before: 'Os meninos',
            after: 'no parque todos os dias.',
            correctAnswer: 'brincam',
            alternatives: ['brinca', 'voavam', 'comeram'],
            explanation: 'Meninos é plural. O verbo deve ser "brincam" (plural, presente do indicativo).',
            wordType: 'verbo conjugado',
            difficulty: 2
        },
        {
            image: 'https://img.freepik.com/vector-premium/dibujo-mariposa-flores-mariposas-flores_730620-512566.jpg?w=400&h=300&fit=crop',
            before: 'A borboleta',
            after: 'sobre as flores com suas asas bonitas.',
            correctAnswer: 'descansa',
            alternatives: ['descansam', 'barriga', 'descansinho'],
            explanation: 'Borboleta é singular. "Descansa" é a forma correta na terceira pessoa do singular.',
            wordType: 'verbo conjugado',
            difficulty: 2
        },
        {
            image: 'https://static.vecteezy.com/system/resources/previews/044/841/151/original/cartoon-elephant-animal-illustration-vector.jpg?w=400&h=300&fit=crop',
            before: 'O elefante é um animal',
            after: '.',
            correctAnswer: 'gigante',
            alternatives: ['pequenino', 'médio', 'enormes'],
            explanation: 'Precisamos de um adjetivo singular que descreva o elefante. "Gigante" é perfeito.',
            wordType: 'adjetivo',
            difficulty: 2
        }
    ],
    hard: [
        {
            image: 'https://img.freepik.com/premium-vector/cute-conductor-leading-orchestra-cartoon-vector_1022901-101517.jpg?w=400&h=300&fit=crop',
            before: 'A orquestra sinfônica',
            after: 'uma sonata extraordinária no concerto.',
            correctAnswer: 'interpretava',
            alternatives: ['interpreta', 'interpretou', 'interpretarão'],
            explanation: 'Precisa do pretérito imperfeito. "Interpretava" descreve uma ação passada em andamento.',
            wordType: 'verbo complexo',
            difficulty: 3
        },
        {
            image: 'https://img.freepik.com/vector-premium/ninos-arqueologos-ninos-arqueologia-dibujos-animados-nino-arqueologo-o-paleontologo-historia-excavacion-ninos-que-trabajan-explorando-fosiles-antiguos-suelo-ilustracion-vectorial-reciente_81894-14923.jpg?w=400&h=300&fit=crop',
            before: 'O pesquisador',
            after: 'os artefatos arqueológicos com precisão científica.',
            correctAnswer: 'examinava',
            alternatives: ['examina', 'examinou', 'examinaria'],
            explanation: 'O pretérito imperfeito descreve uma ação passada repetida. "Examinava" é correto.',
            wordType: 'verbo complexo',
            difficulty: 3
        },
        {
            image: 'https://static.vecteezy.com/system/resources/previews/005/520/150/non_2x/cartoon-drawing-of-a-construction-worker-vector.jpg?w=400&h=300&fit=crop',
            before: 'Embora o trabalho fosse',
            after: ', a equipe persistiu em alcançar o objetivo.',
            correctAnswer: 'árduo',
            alternatives: ['árdua', 'fácil', 'árduas'],
            explanation: 'Trabalho é masculino singular. "Árduo" é o adjetivo que concorda corretamente.',
            wordType: 'adjetivo formal',
            difficulty: 3
        }
    ]
};

const totalRounds = 5;

// Inicializar o jogo
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    startNewRound();
});

// Configurar event listeners
function setupEventListeners() {
    document.getElementById('check-button').addEventListener('click', checkAnswer);
    document.getElementById('reset-button').addEventListener('click', resetRound);
    document.getElementById('hint-button').addEventListener('click', showHint);
    document.getElementById('answer-input').addEventListener('input', (e) => {
        userAnswer = e.target.value;
    });
    document.getElementById('answer-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
}

// Selecionar pool de dificuldade
function selectDifficultyPool() {
    if (wrongAttempts >= 2) {
        difficulty = 'easy';
        return exercises.easy;
    } else if (score >= 70 && currentRound > 2) {
        difficulty = 'hard';
        return exercises.hard;
    } else {
        difficulty = 'normal';
        return exercises.normal;
    }
}

// Iniciar nova rodada
function startNewRound() {
    const difficultyPool = selectDifficultyPool();
    const randomIndex = Math.floor(Math.random() * difficultyPool.length);

    currentExercise = difficultyPool[randomIndex];
    userAnswer = '';
    wrongAttempts = 0;
    hintUsed = false;
    startTime = Date.now();

    updateUI();
    updateDifficulty();
}

// Atualizar interface
function updateUI() {
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('total-rounds').textContent = totalRounds;
    document.getElementById('score').textContent = score + ' pontos';
    document.getElementById('score-display').textContent = score + ' pontos';

    const progress = ((currentRound + 1) / totalRounds) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';

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

// Mostrar sugestões de palavras
function showSuggestions() {
    const suggestionsList = document.getElementById('suggestions-list');
    suggestionsList.innerHTML = '';

    const allSuggestions = [currentExercise.correctAnswer, ...currentExercise.alternatives];
    const shuffled = allSuggestions.sort(() => Math.random() - 0.5);

    shuffled.forEach(word => {
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

// Mostrar dica
function showHint() {
    if (hintUsed) {
        showFeedback("Você já usou a dica", false);
        return;
    }

    hintUsed = true;

    document.getElementById('spelling-text').textContent = `A palavra começa com "${currentExercise.correctAnswer[0]}" e tem ${currentExercise.correctAnswer.length} letras.`;
    document.getElementById('spelling-hint').classList.remove('hidden');

    showFeedback("💡 Dica exibida", true);
}

// Verificar resposta
function checkAnswer() {
    const userInputTrimmed = userAnswer.trim();

    if (!userInputTrimmed) {
        showFeedback("Por favor, escreva uma resposta", false);
        return;
    }

    const distance = levenshteinDistance(userInputTrimmed, currentExercise.correctAnswer);
    const maxDistance = Math.max(userInputTrimmed.length, currentExercise.correctAnswer.length);
    const similarity = 1 - (distance / maxDistance);

    const isCorrect = similarity >= 0.85;

    if (isCorrect) {
        const responseTime = (Date.now() - startTime) / 1000;

        let points = 20;
        if (hintUsed) points = 15;
        if (responseTime > 30) points = Math.max(10, points - 5);

        score += points;

        showFeedback(`Correto! +${points} pontos 🎉`, true);

        const answerInput = document.getElementById('answer-input');
        answerInput.classList.add('correct');

        analyzePerformance(responseTime);

        setTimeout(() => {
            showExplanation();
        }, 500);

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
        }, 3000);
    } else {
        wrongAttempts++;

        const key = currentExercise.wordType;
        spellingErrors[key] = (spellingErrors[key] || 0) + 1;

        showFeedback(`Incorreto. A resposta é: "${currentExercise.correctAnswer}"`, false);

        const answerInput = document.getElementById('answer-input');
        answerInput.classList.add('incorrect');

        updateDifficulty();
    }

    document.getElementById('score').textContent = score + ' pontos';
    document.getElementById('score-display').textContent = score + ' pontos';
}

// Analisar desempenho
function analyzePerformance(responseTime) {
    if (wrongAttempts === 0) {
        comprehensionLevel = 'Excelente';
    } else if (wrongAttempts === 1) {
        comprehensionLevel = 'Normal';
    } else {
        comprehensionLevel = 'Precisa de apoio';
    }

    if (responseTime < 10) {
        visualMemoryLevel = 'Excelente';
    } else if (responseTime < 20) {
        visualMemoryLevel = 'Normal';
    } else {
        visualMemoryLevel = 'Precisa de prática';
    }

    document.getElementById('comprehension-level').textContent = comprehensionLevel;
    document.getElementById('visual-memory').textContent = visualMemoryLevel;
    document.getElementById('analysis-info').classList.remove('hidden');
}

// Mostrar explicação
function showExplanation() {
    document.getElementById('explanation-text').textContent = currentExercise.explanation;
    document.getElementById('explanation').classList.remove('hidden');
}

// Reiniciar rodada
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

    wrongAttempts = 0;
    hintUsed = false;
    startTime = Date.now();
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
    const badgeTexts = {
        'easy': '🎯 Fácil',
        'normal': 'Normal',
        'hard': '⭐ Avançado'
    };
    badge.textContent = badgeTexts[newDifficulty];
}

// Completar jogo
function completeGame() {
    const errorSummary = Object.entries(spellingErrors)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([type, count]) => `${type} (${count})`)
        .join(', ');

    const completaCard = document.querySelector('.completa-card');
    completaCard.innerHTML = `
        <h2>Jogo Concluído! 🏆</h2>
        <div class="feedback correct" style="margin-top: 20px;">
            <p><strong>Sua pontuação final:</strong> ${score} pontos</p>
        </div>
        <div class="explanation" style="margin-top: 20px;">
            <h3>Resumo do seu desempenho</h3>
            <p><strong>Compreensão leitora:</strong> ${comprehensionLevel}</p>
            <p><strong>Memória visual:</strong> ${visualMemoryLevel}</p>
            ${errorSummary ? `<p><strong>Áreas para melhorar:</strong> ${errorSummary}</p>` : ''}
            <p style="margin-top: 10px; font-size: 14px;">Continue praticando para melhorar sua escrita e compreensão!</p>
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

// Função para voltar à página principal
function goToMainPage() {
    window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-lecto-escritor.html';
}