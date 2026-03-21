// Variáveis globais
let currentRound = 0;
let score = 0;
let currentSentence = null;
let words = [];
let droppedWords = [];
let draggedElement = null;
let difficulty = 'normal';
let wrongAttempts = 0;
let hintUsed = false;
let hintLevel = 0; // 0 = sem dica, 1 = dica visual, 2 = primeira palavra marcada

const sentences = [
    {
        words: [
            { text: "O", color: "blue" },
            { text: "cachorro", color: "red" },
            { text: "corre", color: "green" }
        ],
        image: "https://img.freepik.com/vector-premium/lindo-perrito-corriendo-ilustracion-dibujos-animados-vector_2699-745.jpg"
    },
    {
        words: [
            { text: "A", color: "blue" },
            { text: "menina", color: "red" },
            { text: "pula", color: "green" }
        ],
        image: "https://img.freepik.com/vector-premium/nina-saltando-aislado-blanco_253263-210.jpg?w=2000"
    },
    {
        words: [
            { text: "O", color: "blue" },
            { text: "gato", color: "red" },
            { text: "dorme", color: "green" }
        ],
        image: "https://img.freepik.com/vector-premium/dibujo-dibujos-animados-gato-durmiendo_29937-9676.jpg?w=2000"
    },
    {
        words: [
            { text: "O", color: "blue" },
            { text: "pássaro", color: "red" },
            { text: "voa", color: "green" }
        ],
        image: "https://th.bing.com/th/id/R.ce83d3472f6439efaade884fc47b6f1e?rik=L55fb4CfQuAcOQ&riu=http%3a%2f%2fst.depositphotos.com%2f1199300%2f1509%2fv%2f950%2fdepositphotos_15093187-stock-illustration-flying-bird-cartoon-isolated-on.jpg&ehk=8pgE4ap73POBZLUYjAbuQHk4wtZjcI0d%2bviTP29cANQ%3d&risl=&pid=ImgRaw&r=0"
    },
    {
        words: [
            { text: "O", color: "blue" },
            { text: "sol", color: "red" },
            { text: "brilha", color: "green" }
        ],
        image: "https://png.pngtree.com/background/20230519/original/pngtree-cartoon-sun-in-a-sunny-landscape-picture-image_2666701.jpg"
    }
];

const totalRounds = 5;

// Inicializar o jogo
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    startNewRound();
});

// Configurar event listeners
function setupEventListeners() {
    document.getElementById('check-button').addEventListener('click', checkSentence);
    document.getElementById('reset-button').addEventListener('click', resetSentence);
    document.getElementById('hint-button').addEventListener('click', showHint);

    document.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    document.addEventListener('drop', (e) => {
        e.preventDefault();
    });
}

// Iniciar uma nova rodada
function startNewRound() {
    const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
    currentSentence = randomSentence;

    words = [...randomSentence.words].sort(() => Math.random() - 0.5);
    droppedWords = [];
    wrongAttempts = 0;
    hintUsed = false;
    hintLevel = 0;

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

    document.getElementById('sentence-image').src = currentSentence.image;

    const wordsBank = document.getElementById('words-bank');
    wordsBank.innerHTML = '';

    words.forEach((word, index) => {
        const wordElement = createWordElement(word, index);
        wordsBank.appendChild(wordElement);
    });

    const dropZone = document.getElementById('sentence-drop-zone');
    dropZone.innerHTML = '';

    for (let i = 0; i < currentSentence.words.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'word-slot';
        slot.id = `slot-${i}`;
        slot.dataset.slotIndex = i;
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('drop', (e) => handleDrop(e, i));
        dropZone.appendChild(slot);
    }

    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('order-hint').classList.add('hidden');
}

// Criar elemento de palavra
function createWordElement(word, index) {
    const wordElement = document.createElement('div');
    wordElement.className = `word-item word-${word.color}`;
    wordElement.textContent = word.text;
    wordElement.draggable = true;
    wordElement.dataset.index = index;

    wordElement.addEventListener('dragstart', (e) => {
        draggedElement = e.target;
        e.target.style.opacity = '0.6';
    });

    wordElement.addEventListener('dragend', (e) => {
        e.target.style.opacity = '1';
    });

    return wordElement;
}

// Lidar com dragover
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = 'rgba(0, 102, 204, 0.1)';
}

// Lidar com drop
function handleDrop(e, slotIndex) {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';

    if (!draggedElement) return;

    const index = parseInt(draggedElement.dataset.index);
    const word = words[index];
    const slot = document.getElementById(`slot-${slotIndex}`);

    if (slot.innerHTML) {
        const existingWord = slot.querySelector('.word-item');
        if (existingWord) {
            existingWord.style.display = '';
            document.getElementById('words-bank').appendChild(existingWord);
        }
    }

    const newWordElement = document.createElement('div');
    newWordElement.className = `word-item word-${word.color}`;
    newWordElement.textContent = word.text;
    newWordElement.style.cursor = 'pointer';

    newWordElement.addEventListener('click', () => {
        newWordElement.remove();
        draggedElement.style.display = '';
        const idx = droppedWords.findIndex(w => w.slotIndex === slotIndex);
        if (idx !== -1) droppedWords.splice(idx, 1);
        slot.classList.remove('filled');
    });

    slot.innerHTML = '';
    slot.appendChild(newWordElement);
    slot.classList.add('filled');

    draggedElement.style.display = 'none';

    droppedWords = droppedWords.filter(w => w.slotIndex !== slotIndex);
    droppedWords.push({ index, word, slotIndex });
}

// Reiniciar frase
function resetSentence() {
    droppedWords.forEach(item => {
        const slot = document.getElementById(`slot-${item.slotIndex}`);
        slot.innerHTML = '';
        slot.classList.remove('filled');
    });

    const wordItems = document.querySelectorAll('.word-item');
    wordItems.forEach(item => item.style.display = '');

    droppedWords = [];
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('order-hint').classList.add('hidden');
}

// Mostrar dica progressiva
function showHint() {
    if (hintLevel >= 2) {
        showFeedback("Você já usou todas as dicas disponíveis", false);
        return;
    }

    hintLevel++;
    hintUsed = true;
    const hintDiv = document.getElementById('order-hint');
    hintDiv.innerHTML = '';

    if (hintLevel === 1) {
        hintDiv.classList.remove('hidden');
        hintDiv.className = 'order-hint visible';

        currentSentence.words.forEach((word, idx) => {
            const hint = document.createElement('div');
            hint.className = `hint-item hint-color word-${word.color}`;
            hint.innerHTML = `<span class="hint-position">${idx + 1}</span><span class="hint-word hidden-hint">${word.text}</span>`;
            hintDiv.appendChild(hint);
        });

        showFeedback("💡 Dica 1: As cores indicam a ordem. Veja qual cor vem primeiro, segundo, terceiro.", true);
    } else if (hintLevel === 2) {
        hintDiv.classList.remove('hidden');
        hintDiv.className = 'order-hint visible';

        currentSentence.words.forEach((word, idx) => {
            const hint = document.createElement('div');
            hint.className = `hint-item word-${word.color}`;

            if (idx === 0) {
                hint.innerHTML = `<span class="hint-word">${word.text}</span> <span class="hint-label">1ª palavra</span>`;
            } else {
                hint.innerHTML = `<span class="hint-position">${idx + 1}</span>`;
            }
            hintDiv.appendChild(hint);
        });

        showFeedback("💡 Dica 2: A primeira palavra é: <strong>" + currentSentence.words[0].text + "</strong>", true);
    }
}

// Verificar frase
function checkSentence() {
    if (droppedWords.length !== currentSentence.words.length) {
        showFeedback("Você deve usar todas as palavras (" + currentSentence.words.length + ")", false);
        wrongAttempts++;
        updateDifficulty();
        return;
    }

    droppedWords.sort((a, b) => a.slotIndex - b.slotIndex);

    let isCorrect = true;
    let errorDetails = [];

    for (let i = 0; i < droppedWords.length; i++) {
        if (droppedWords[i].word.text !== currentSentence.words[i].text) {
            isCorrect = false;
            errorDetails.push(`Posição ${i + 1}: encontrei "${droppedWords[i].word.text}", esperava "${currentSentence.words[i].text}"`);
        }
    }

    if (isCorrect) {
        let points = 20;
        if (hintLevel === 1) points = 15;
        if (hintLevel === 2) points = 10;

        score += points;
        showFeedback(`Frase correta! +${points} pontos 🎉`, true);

        const imageDisplay = document.getElementById('image-display');
        imageDisplay.classList.add('success');

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

                imageDisplay.classList.remove('success');
            }
        }, 2000);
    } else {
        wrongAttempts++;
        updateDifficulty();
        let message = "A frase não está correta.\n" + errorDetails.join("\n");
        showFeedback(message, false);
    }

    document.getElementById('score').textContent = score + ' pontos';
    document.getElementById('score-display').textContent = score + ' pontos';
}

// Mostrar feedback
function showFeedback(message, isCorrect) {
    const feedbackElement = document.getElementById('feedback');

    if (message.includes('\n')) {
        feedbackElement.innerHTML = `<div>${message.split('\n')[0]}</div><div class="error-details">${message.split('\n').slice(1).join('<br>')}</div>`;
    } else {
        feedbackElement.innerHTML = message;
    }

    feedbackElement.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
    feedbackElement.classList.remove('hidden');
}

// Atualizar dificuldade
function updateDifficulty() {
    if (wrongAttempts === 0) {
        difficulty = 'normal';
    } else if (wrongAttempts >= 2) {
        difficulty = 'easy';
    }

    const badge = document.getElementById('difficulty-badge');
    badge.textContent = difficulty === 'easy' ? '🎯 Fácil' : difficulty === 'hard' ? '⭐ Avançado' : 'Normal';
}

// Completar jogo
function completeGame() {
    const sentenceCard = document.querySelector('.sentence-card');
    sentenceCard.innerHTML = `
        <h2>Jogo Concluído! 🏆</h2>
        <div class="image-display">
            <img src="dino-feliz.jpeg" alt="Jogo concluído">
        </div>
        <div class="feedback correct">
            <p><strong>Sua pontuação final:</strong> ${score} pontos</p>
        </div>
        <div class="action-controls">
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