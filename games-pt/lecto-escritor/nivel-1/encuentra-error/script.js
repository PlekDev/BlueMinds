// Variáveis globais
let currentRound = 0;
let score = 0;
let currentExercise = null;
let selectedOption = null;
let difficulty = 'normal';
let wrongAttempts = 0;
let hintUsed = false;
let errorFrequency = {}; // Rastrear erros recorrentes

const exercises = {
    easy: [
        {
            sentence: "O gato são bonito.",
            errorWord: "são",
            correctWord: "é",
            options: ["é", "somos", "és"],
            errorType: "verbo",
            explanation: "O sujeito 'o gato' é singular, por isso o verbo deve ser 'É' (singular), não 'SÃO' (plural).",
            hint: "O gato é um ou vários? Procure a palavra que seja singular."
        },
        {
            sentence: "Os menino correm rápido.",
            errorWord: "menino",
            correctWord: "meninos",
            options: ["meninos", "menina", "meninas"],
            errorType: "número",
            explanation: "'Os' é plural, então deve ir com 'MENINOS' (plural), não 'MENINO' (singular).",
            hint: "A palavra antes diz 'OS' (plural), então a seguinte também deve ser plural."
        },
        {
            sentence: "A gata é branca e grande.",
            errorWord: "grandona",
            correctWord: "grande",
            options: ["grandes", "grande", "grandas"],
            errorType: "gênero/número",
            explanation: "Muito bem. 'GRANDE' é correto porque funciona igual para singular e plural.",
            hint: "Os adjetivos devem concordar em número com o substantivo."
        }
    ],
    normal: [
        {
            sentence: "Os carros é muito rápidos.",
            errorWord: "é",
            correctWord: "são",
            options: ["são", "é", "és"],
            errorType: "verbo",
            explanation: "'Os carros' (plural) precisa do verbo 'SÃO' (plural). 'É' é só para singular como 'O carro É'.",
            hint: "Há um ou vários carros? O verbo deve ser plural como o substantivo."
        },
        {
            sentence: "Ela tem uns livros vermelho.",
            errorWord: "vermelho",
            correctWord: "vermelhos",
            options: ["vermelhos", "vermelha", "vermelhas"],
            errorType: "número",
            explanation: "'Uns livros' é plural masculino, então o adjetivo deve ser 'VERMELHOS' (plural), não 'VERMELHO' (singular).",
            hint: "Se há vários livros, a cor também deve estar no plural."
        },
        {
            sentence: "O professor disse aos alunos que trabalhiem muito.",
            errorWord: "trabalhiem",
            correctWord: "trabalhem",
            options: ["trabalhem", "trabalham", "trabalhar"],
            errorType: "modo verbal",
            explanation: "Correto. 'TRABALHEM' é subjuntivo e é o adequado depois de 'que'.",
            hint: "Depois de 'que' costuma ir subjuntivo quando é uma ordem ou desejo."
        }
    ],
    hard: [
        {
            sentence: "Se eu taria rico, viajaria pelo mundo.",
            errorWord: "taria",
            correctWord: "fosse",
            options: ["fosse", "sonhasse", "tivesse"],
            errorType: "tempo verbal",
            explanation: "Em condicionais, a prótase (primeira parte) deve ir no imperfeito do subjuntivo 'FOSSE', não no condicional 'SERIA'.",
            hint: "Em 'Se...' as estruturas condicionais têm regras especiais de conjugação."
        },
        {
            sentence: "Apesar dos seus erros, o aluno andou com os seus estudos.",
            errorWord: "andou",
            correctWord: "continuou",
            options: ["continuou", "continua", "continuar"],
            errorType: "tempo verbal",
            explanation: "Correto. 'CONTINUOU' (pretérito) é o tempo adequado para narrar uma ação passada.",
            hint: "Procure consistência temporal em toda a frase."
        },
        {
            sentence: "Embora allia sido difícil, nós conseguiremos sucesso.",
            errorWord: "allia",
            correctWord: "tenha",
            options: ["tenha", "tem", "tinha"],
            errorType: "modo verbal",
            explanation: "Correto. 'TENHA' (presente do subjuntivo) é obrigatório depois de 'embora'.",
            hint: "Expressões de concessão como 'embora' requerem subjuntivo."
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
}

// Iniciar uma nova rodada
function startNewRound() {
    const difficultyPool = selectDifficultyPool();
    const randomIndex = Math.floor(Math.random() * difficultyPool.length);

    currentExercise = difficultyPool[randomIndex];
    selectedOption = null;
    wrongAttempts = 0;
    hintUsed = false;

    updateUI();
    updateDifficulty();
}

// Selecionar pool de dificuldade conforme desempenho
function selectDifficultyPool() {
    if (wrongAttempts >= 3) {
        difficulty = 'easy';
        return exercises.easy;
    } else if (score >= 80 && currentRound > 2) {
        difficulty = 'hard';
        return exercises.hard;
    } else {
        difficulty = 'normal';
        return exercises.normal;
    }
}

// Atualizar interface
function updateUI() {
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('total-rounds').textContent = totalRounds;
    document.getElementById('score').textContent = score + ' pontos';
    document.getElementById('score-display').textContent = score + ' pontos';

    const progress = ((currentRound + 1) / totalRounds) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';

    // Mostrar frase com erro destacado
    const sentenceText = document.getElementById('sentence-text');
    const parts = currentExercise.sentence.split(currentExercise.errorWord);
    sentenceText.innerHTML = parts[0] +
        `<span class="error-word">${currentExercise.errorWord}</span>` +
        parts[1];

    // Mostrar tipo de erro
    const badges = {
        'verbo': '🔤 Erro: Verbo',
        'número': '📊 Erro: Número',
        'gênero': '♀️♂️ Erro: Gênero',
        'tempo verbal': '⏰ Erro: Tempo Verbal',
        'modo verbal': '📝 Erro: Modo Verbal',
        'gênero/número': '📊 Erro: Gênero/Número'
    };
    document.getElementById('word-type-badge').textContent = badges[currentExercise.errorType] || 'Erro Gramatical';

    // Gerar opções
    const container = document.getElementById('options-container');
    container.innerHTML = '';

    currentExercise.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.addEventListener('click', () => selectOption(option, button));
        container.appendChild(button);
    });

    // Limpar feedback
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('explanation').classList.add('hidden');
    document.getElementById('error-hint').classList.add('hidden');
}

// Selecionar opção
function selectOption(option, button) {
    document.querySelectorAll('.option-button').forEach(btn => {
        btn.classList.remove('selected');
    });

    button.classList.add('selected');
    selectedOption = option;
}

// Mostrar dica
function showHint() {
    if (hintUsed) {
        showFeedback("Você já usou a dica", false);
        return;
    }

    hintUsed = true;
    document.getElementById('hint-text').textContent = currentExercise.hint;
    document.getElementById('error-hint').classList.remove('hidden');
    showFeedback("💡 Dica exibida", true);
}

// Verificar resposta
function checkAnswer() {
    if (!selectedOption) {
        showFeedback("Você deve selecionar uma opção", false);
        return;
    }

    const isCorrect = selectedOption === currentExercise.correctWord;

    if (isCorrect) {
        let points = hintUsed ? 15 : 20;
        score += points;

        const key = currentExercise.errorType;
        errorFrequency[key] = (errorFrequency[key] || 0) + 1;

        showFeedback(`Correto! +${points} pontos 🎉`, true);

        document.querySelectorAll('.option-button').forEach(btn => {
            if (btn.textContent === selectedOption) {
                btn.classList.add('correct');
            }
        });

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
        showFeedback("Incorreto. Tente novamente", false);

        document.querySelectorAll('.option-button').forEach(btn => {
            if (btn.textContent === selectedOption) {
                btn.classList.add('incorrect');
            }
        });

        updateDifficulty();
    }

    document.getElementById('score').textContent = score + ' pontos';
    document.getElementById('score-display').textContent = score + ' pontos';
}

// Mostrar explicação
function showExplanation() {
    document.getElementById('explanation-text').textContent = currentExercise.explanation;
    document.getElementById('explanation').classList.remove('hidden');
}

// Reiniciar rodada
function resetRound() {
    selectedOption = null;
    document.querySelectorAll('.option-button').forEach(btn => {
        btn.classList.remove('selected', 'incorrect', 'correct');
    });
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('explanation').classList.add('hidden');
    document.getElementById('error-hint').classList.add('hidden');
    wrongAttempts = 0;
    hintUsed = false;
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

    if (wrongAttempts >= 3) {
        newDifficulty = 'easy';
    } else if (score >= 80 && currentRound > 2) {
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
    const errorSummary = Object.entries(errorFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([type, count]) => `${type} (${count})`)
        .join(', ');

    const errorCard = document.querySelector('.error-card');
    errorCard.innerHTML = `
        <h2>Jogo Concluído! 🏆</h2>
        <div class="feedback correct" style="margin-top: 20px;">
            <p><strong>Sua pontuação final:</strong> ${score} pontos</p>
        </div>
        <div class="explanation" style="margin-top: 20px;">
            <h3>Resumo dos Erros Praticados</h3>
            <p>Você trabalhou principalmente em: ${errorSummary || 'Vários tipos de erros'}</p>
            <p style="margin-top: 10px; font-size: 14px;">Continue praticando essas estruturas para melhorar sua gramática.</p>
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