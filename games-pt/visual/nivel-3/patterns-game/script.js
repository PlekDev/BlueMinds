// Variáveis globais
let currentRound = 0;
let score = 0;
let currentPatternData = null;
let correctAnswer = "";
let showFeedback = false;

const totalRounds = 5;

// PADRÕES DEFINIDOS MANUALMENTE COM EMOJIS
const patternsDatabase = [
    {
        name: "alternancia_quadrados_vermelho_azul",
        display: ["🟥", "🟦", "🟥", "🟦", "🟥", "?"],
        correct: "🟦",
        options: ["🟥", "🟦", "🟩"]
    },
    {
        name: "alternancia_quadrados_verde_amarelo",
        display: ["🟩", "🟨", "🟩", "🟨", "🟩", "?"],
        correct: "🟨",
        options: ["🟩", "🟨", "🟪"]
    },
    {
        name: "tres_partes_vermelho_azul_verde",
        display: ["🟥", "🟦", "🟩", "🟥", "🟦", "?"],
        correct: "🟩",
        options: ["🟥", "🟦", "🟩"]
    },
    {
        name: "duplo_vermelho_azul",
        display: ["🟥", "🟥", "🟦", "🟦", "🟥", "?"],
        correct: "🟥",
        options: ["🟥", "🟦", "🟨"]
    },
    {
        name: "alternancia_roxo_preto",
        display: ["🟪", "⬛", "🟪", "⬛", "🟪", "?"],
        correct: "⬛",
        options: ["🟪", "⬛", "⬜"]
    },
    {
        name: "tres_partes_amarelo_roxo_preto",
        display: ["🟨", "🟪", "⬛", "🟨", "🟪", "?"],
        correct: "⬛",
        options: ["🟨", "🟪", "⬛"]
    },
    {
        name: "duplo_verde_amarelo",
        display: ["🟩", "🟩", "🟨", "🟨", "🟩", "?"],
        correct: "🟩",
        options: ["🟩", "🟨", "🟦"]
    },
    {
        name: "alternancia_azul_verde",
        display: ["🟦", "🟩", "🟦", "🟩", "🟦", "?"],
        correct: "🟩",
        options: ["🟦", "🟩", "🟥"]
    },
    {
        name: "tres_partes_branco_preto_vermelho",
        display: ["⬜", "⬛", "🟥", "⬜", "⬛", "?"],
        correct: "🟥",
        options: ["⬜", "⬛", "🟥"]
    },
    {
        name: "duplo_roxo_branco",
        display: ["🟪", "🟪", "⬜", "⬜", "🟪", "?"],
        correct: "🟪",
        options: ["🟪", "⬜", "🟦"]
    }
];

// Inicializar o jogo
document.addEventListener('DOMContentLoaded', () => {
    startNewRound();
});

// Iniciar uma nova rodada
function startNewRound() {
    const randomPattern = patternsDatabase[Math.floor(Math.random() * patternsDatabase.length)];
    currentPatternData = randomPattern;
    correctAnswer = randomPattern.correct;
    showFeedback = false;

    updateUI();
    audioManager.speak(`Rodada ${currentRound + 1}. O que falta no padrão? Observe a sequência e escolha a opção correta`, 1);
}

// Atualizar interface
function updateUI() {
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('total-rounds').textContent = totalRounds;
    document.getElementById('score').textContent = score + ' pontos';
    document.getElementById('score-display').textContent = score + ' pontos';

    const progress = ((currentRound + 1) / totalRounds) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';

    const patternDisplay = document.getElementById('pattern-display');
    patternDisplay.innerHTML = '';

    currentPatternData.display.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'pattern-item';
        if (item === "?") {
            div.classList.add('missing');
            div.innerHTML = '<span class="question-mark">?</span>';
        } else {
            div.textContent = item;
        }
        patternDisplay.appendChild(div);
    });

    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    const shuffledOptions = [...currentPatternData.options].sort(() => Math.random() - 0.5);

    shuffledOptions.forEach((option) => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.onclick = () => handleAnswer(option, button);
        optionsContainer.appendChild(button);
    });

    document.getElementById('feedback').classList.add('hidden');
}

// Lidar com a resposta do usuário
function handleAnswer(selected, buttonElement) {
    if (showFeedback) return;

    const isCorrect = selected === correctAnswer;
    const feedbackElement = document.getElementById('feedback');
    const feedbackText = document.getElementById('feedback-text');

    const allButtons = document.querySelectorAll('.option-button');
    allButtons.forEach(btn => btn.disabled = true);

    if (isCorrect) {
        score += 20;
        feedbackText.textContent = "Correto! ✅";
        feedbackElement.className = 'feedback correct';
        audioManager.speak('Correto. Você identificou o padrão corretamente', 0.95);
        buttonElement.classList.add('answer-correct');
        playSuccessSound();
    } else {
        feedbackText.innerHTML = `Incorreto ❌<br>A resposta correta era: <strong>${correctAnswer}</strong>`;
        feedbackElement.className = 'feedback incorrect';
        audioManager.speak(`Incorreto. A resposta correta era ${correctAnswer}`, 0.95);
        allButtons.forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('answer-correct');
            } else {
                btn.classList.add('answer-incorrect');
            }
        });
    }

    feedbackElement.classList.remove('hidden');
    showFeedback = true;

    document.getElementById('score').textContent = score + ' pontos';
    document.getElementById('score-display').textContent = score + ' pontos';

    setTimeout(() => {
        if (currentRound + 1 >= totalRounds) {
            completeGame();
        } else {
            currentRound++;
            startNewRound();
        }
    }, 2500);
}

// Reproduzir som de sucesso
function playSuccessSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [523, 659, 784];
        notes.forEach((freq, idx) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime + idx * 0.1);
            oscillator.stop(audioContext.currentTime + idx * 0.1 + 0.2);
        });
    } catch(e) {}
}

// Completar o jogo
function completeGame() {
    const patternCard = document.querySelector('.pattern-card');
    const accuracy = ((score / (totalRounds * 20)) * 100).toFixed(0);

    let message = 'Excelente! 🏆';
    let audioMessage = 'Excelente';

    if (accuracy < 60) {
        message = 'Continue praticando! 💪';
        audioMessage = 'Continue praticando';
    } else if (accuracy < 80) {
        message = 'Muito bom trabalho! 🌟';
        audioMessage = 'Muito bom trabalho';
    }

    audioManager.speak(`Jogo concluído. Pontuação: ${score} pontos. Precisão: ${accuracy} por cento. ${audioMessage}`, 0.95);

    patternCard.innerHTML = `
        <h2>Jogo Concluído!</h2>
        <div class="completion-emoji">🎉</div>
        <div class="completion-score">
            <p>Sua pontuação final: <strong>${score} pontos</strong></p>
            <p>Precisão: <strong>${accuracy}%</strong></p>
            <p style="font-size: 20px; margin-top: 10px;">${message}</p>
        </div>
        <div class="options-container">
            <button class="option-button" onclick="location.reload()">
                Jogar Novamente
            </button>
            <button class="option-button" onclick="goToMainPage()">
                Voltar ao Menu
            </button>
        </div>
    `;
}

// Função para voltar à página principal
function goToMainPage() {
    window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-visual.html';
}