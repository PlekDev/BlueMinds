// Variáveis globais
let currentRound = 0;
let score = 0;
let currentExercise = null;
let selectedImage = null;
let difficulty = 'normal';
let wrongAttempts = 0;
let hintUsed = false;
let readingErrors = {};
let responseTime = 0;
let startTime = 0;
let classificationPattern = [];
let totalReadingTime = 0;

// Analytics para adaptação IA
const analytics = {
    errors: {
        semantic: 0,
        phonetic: 0,
        visual: 0
    },
    responseTimes: [],
    hintUsageRate: 0,
    correctFirstAttempt: 0
};

// Palavras por dificuldade
const wordBanks = {
    easy: [
        {
            sentence: "O gato dorme.",
            correctImageIndex: 0,
            difficultWords: ['gato'],
            category: 'animals',
            errorType: 'semantic',
            explanation: "A frase descreve um gato dormindo. É uma ação simples e clara.",
            images: [
                { src: 'https://img2.clipart-library.com/27/cat-sleeping-clipart/cat-sleeping-clipart-3.jpg?w=300&h=200&fit=crop', label: 'Gato dormindo' },
                { src: 'https://image.shutterstock.com/image-vector/little-doggy-cute-puppy-playing-600w-255443107.jpg?w=300&h=200&fit=crop', label: 'Cachorro brincando' },
                { src: 'https://static.vecteezy.com/system/resources/previews/003/286/369/original/cartoon-character-exotic-shorthair-cat-running-vector.jpg?w=300&h=200&fit=crop', label: 'Gato correndo' }
            ]
        },
        {
            sentence: "O menino brinca no parque.",
            correctImageIndex: 1,
            difficultWords: ['parque'],
            category: 'places',
            errorType: 'semantic',
            explanation: "A frase fala de um menino brincando. O parque é o lugar onde a ação acontece.",
            images: [
                { src: 'https://thumbs.dreamstime.com/z/caricatura-de-un-ni%C3%B1o-que-barre-el-suelo-ni%C3%B1os-haciendo-tareas-dom%C3%A9sticas-en-concepto-casa-dibujo-198013814.jpg?w=300&h=200&fit=crop', label: 'Menino em casa' },
                { src: 'https://static.vecteezy.com/system/resources/previews/008/666/296/non_2x/kids-playing-outdoor-in-park-vector.jpg?w=300&h=200&fit=crop', label: 'Menino no parque' },
                { src: 'https://static.vecteezy.com/system/resources/previews/002/538/755/large_2x/happy-cute-cartoon-school-children-vector.jpg?w=300&h=200&fit=crop', label: 'Menino na escola' }
            ]
        },
        {
            sentence: "O passarinho canta.",
            correctImageIndex: 2,
            difficultWords: ['passarinho'],
            category: 'animals',
            errorType: 'semantic',
            explanation: "Um passarinho é um pássaro pequeno. A ação é cantar.",
            images: [
                { src: 'https://static.vecteezy.com/system/resources/previews/005/162/515/original/cartoon-blue-bird-sitting-in-a-nest-free-vector.jpg?w=300&h=200&fit=crop', label: 'Pássaro no ninho' },
                { src: 'https://img.freepik.com/vector-premium/pajaro-azul-dibujos-animados-sentado-rama-arbol_29190-5361.jpg?w=300&h=200&fit=crop', label: 'Pássaro no galho' },
                { src: 'https://img.freepik.com/vector-premium/ilustracion-vectorial-dibujos-animados-pajaro-lindo-cantando_869472-1107.jpg?w=300&h=200&fit=crop', label: 'Pássaro cantando' }
            ]
        }
    ],
    normal: [
        {
            sentence: "A borboleta voa entre as flores.",
            correctImageIndex: 1,
            difficultWords: ['borboleta', 'flores'],
            category: 'nature',
            errorType: 'semantic',
            explanation: "Uma borboleta é um inseto colorido que voa. Ela fica entre flores naturalmente.",
            images: [
                { src: 'https://img.freepik.com/vector-premium/lindo-gato-flor-vector-dibujos-animados-sobre-fondo-blanco_1026278-7253.jpg?w=300&h=200&fit=crop', label: 'Gato nas flores' },
                { src: 'https://img.freepik.com/vector-premium/mariposas-vuelo-flor-jardin_1308-4021.jpg?w=300&h=200&fit=crop', label: 'Borboleta nas flores' },
                { src: 'https://static.vecteezy.com/system/resources/previews/017/675/147/original/cute-cartoon-postcard-sunny-lawn-with-bees-flying-under-red-daisy-flowers-and-grass-isolated-on-white-background-bees-are-collecting-honey-in-the-sunny-summer-day-vector.jpg?w=300&h=200&fit=crop', label: 'Abelha nas flores' }
            ]
        },
        {
            sentence: "O elefante caminha lentamente pela savana.",
            correctImageIndex: 0,
            difficultWords: ['elefante', 'savana'],
            category: 'animals',
            errorType: 'semantic',
            explanation: "Um elefante é um animal grande. A savana é o seu habitat natural.",
            images: [
                { src: 'https://i.pinimg.com/736x/9a/e4/39/9ae43949a771f9fb650c7786fed63cdc--elephants.jpg?w=300&h=200&fit=crop', label: 'Elefante na savana' },
                { src: 'https://img.freepik.com/vector-premium/feliz-leon-dibujos-animados-sabana_133260-14519.jpg?w=300&h=200&fit=crop', label: 'Leão na savana' },
                { src: 'https://static.vecteezy.com/system/resources/previews/060/831/743/non_2x/giraffe-eating-leaves-from-tree-with-green-foliage-in-simple-nature-background-illustration-vector.jpg?w=300&h=200&fit=crop', label: 'Girafa comendo' }
            ]
        },
        {
            sentence: "O crocodilo nada no rio.",
            correctImageIndex: 2,
            difficultWords: ['crocodilo'],
            category: 'animals',
            errorType: 'semantic',
            explanation: "Um crocodilo é um réptil que vive na água. Nadar é sua atividade principal.",
            images: [
                { src: 'https://static.vecteezy.com/system/resources/previews/003/278/420/large_2x/animal-character-funny-crocodile-in-cartoon-style-vector.jpg?w=300&h=200&fit=crop', label: 'Crocodilo em terra' },
                { src: 'https://static.vecteezy.com/system/resources/previews/021/458/217/non_2x/cute-green-snake-cartoon-on-white-background-vector.jpg?w=300&h=200&fit=crop', label: 'Cobra no rio' },
                { src: 'https://img.freepik.com/vector-premium/cocodrilo-agua-cocodrilo-anfibio-reptil-salvaje-verde-enojado-salvaje-animal-natacion-dibujos-animados-fondo_80590-4822.jpg?w=300&h=200&fit=crop', label: 'Crocodilo nadando' }
            ]
        }
    ],
    hard: [
        {
            sentence: "A majestosa orquestra sinfônica interpretava uma sonata extraordinária.",
            correctImageIndex: 1,
            difficultWords: ['majestosa', 'orquestra', 'sinfônica', 'interpretava', 'sonata', 'extraordinária'],
            category: 'arts',
            errorType: 'phonetic',
            explanation: "Descreve músicos tocando instrumentos juntos. As palavras complexas tornam a leitura mais desafiadora.",
            images: [
                { src: 'https://static.vecteezy.com/system/resources/previews/016/704/376/original/cartoon-illustration-acoustic-guitar-colorful-musical-instrument-vector.jpg?w=300&h=200&fit=crop', label: 'Guitarra sozinha' },
                { src: 'https://img.freepik.com/vector-premium/conjunto-grupo-orquesta-conductor-escenario_7496-856.jpg?w=300&h=200&fit=crop', label: 'Orquestra tocando' },
                { src: 'https://static.vecteezy.com/system/resources/previews/016/269/586/original/open-air-concert-illustration-concept-on-white-background-vector.jpg?w=300&h=200&fit=crop', label: 'Show moderno' }
            ]
        },
        {
            sentence: "O hipopótamo mergulha profundamente no pântano lodoso.",
            correctImageIndex: 0,
            difficultWords: ['hipopótamo', 'mergulha', 'profundamente', 'pântano', 'lodoso'],
            category: 'animals',
            errorType: 'visual',
            explanation: "Descreve um hipopótamo no seu ambiente aquático. Palavras complexas para vocabulário avançado.",
            images: [
                { src: 'https://static.vecteezy.com/system/resources/previews/005/561/609/non_2x/hippo-cartoon-colored-illustration-free-vector.jpg?w=300&h=200&fit=crop', label: 'Hipopótamo na água' },
                { src: 'https://static.vecteezy.com/system/resources/previews/044/841/151/original/cartoon-elephant-animal-illustration-vector.jpg?w=300&h=200&fit=crop', label: 'Elefante' },
                { src: 'https://png.pngtree.com/png-clipart/20220823/original/pngtree-the-cute-baby-rhino-with-the-excited-expression-png-image_8451466.png?w=300&h=200&fit=crop', label: 'Rinoceronte' }
            ]
        },
        {
            sentence: "O diligente pesquisador examinava meticulosamente os artefatos arqueológicos.",
            correctImageIndex: 2,
            difficultWords: ['diligente', 'pesquisador', 'examinava', 'meticulosamente', 'artefatos', 'arqueológicos'],
            category: 'professions',
            errorType: 'phonetic',
            explanation: "Descreve um arqueólogo trabalhando. Vocabulário acadêmico para estimular o pensamento crítico.",
            images: [
                { src: 'https://static.vecteezy.com/system/resources/previews/000/299/564/large_2x/childrens-doing-activities-in-library-vector.jpg?w=300&h=200&fit=crop', label: 'Biblioteca' },
                { src: 'https://c8.alamy.com/compes/2gak438/diseno-de-dibujos-animados-de-cientifico-de-pie-en-el-laboratorio-2gak438.jpg?w=300&h=200&fit=crop', label: 'Laboratório científico' },
                { src: 'https://img.freepik.com/vector-premium/ninos-arqueologos-ninos-arqueologia-dibujos-animados-nino-arqueologo-o-paleontologo-historia-excavacion-ninos-que-trabajan-explorando-fosiles-antiguos-suelo-ilustracion-vectorial-reciente_81894-14923.jpg?w=300&h=200&fit=crop', label: 'Arqueólogo escavando' }
            ]
        }
    ]
};

const totalRounds = 5;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    startNewRound();
});

// Event listeners
function setupEventListeners() {
    document.getElementById('check-button').addEventListener('click', checkAnswer);
    document.getElementById('reset-button').addEventListener('click', resetRound);
    document.getElementById('hint-button').addEventListener('click', showHint);
    document.getElementById('read-button').addEventListener('click', readSentence);
}

// Utilitário para dividir palavras em sílabas
function splitSyllables(word) {
    const syllableMap = {
        'borboleta': 'bor-bo-le-ta',
        'telefone': 'te-le-fo-ne',
        'bicicleta': 'bi-ci-cle-ta',
        'elefante': 'e-le-fan-te',
        'passarinho': 'pas-sa-ri-nho',
        'crocodilo': 'cro-co-di-lo',
        'canguru': 'can-gu-ru',
        'hipopótamo': 'hi-po-pó-ta-mo',
        'dinossauro': 'di-nos-sau-ro',
        'pinguim': 'pin-guim',
        'majestosa': 'ma-jes-to-sa',
        'orquestra': 'or-ques-tra',
        'sinfônica': 'sin-fô-ni-ca',
        'interpretava': 'in-ter-pre-ta-va',
        'sonata': 'so-na-ta',
        'extraordinária': 'ex-tra-or-di-ná-ria',
        'diligente': 'di-li-gen-te',
        'pesquisador': 'pes-qui-sa-dor',
        'examinava': 'e-xa-mi-na-va',
        'meticulosamente': 'me-ti-cu-lo-sa-men-te',
        'artefatos': 'ar-te-fa-tos',
        'arqueológicos': 'ar-que-o-ló-gi-cos'
    };
    return syllableMap[word.toLowerCase()] || word;
}

// Selecionar pool por dificuldade adaptativa
function selectDifficultyPool() {
    const avgResponseTime = analytics.responseTimes.length > 0
        ? analytics.responseTimes.reduce((a, b) => a + b, 0) / analytics.responseTimes.length
        : 0;

    const errorRate = (analytics.errors.semantic + analytics.errors.phonetic + analytics.errors.visual) / Math.max(currentRound, 1);

    if (wrongAttempts >= 2 || errorRate > 0.4 || avgResponseTime > 15000) {
        difficulty = 'easy';
        return wordBanks.easy;
    } else if (score >= 70 && currentRound > 2 && errorRate < 0.15 && avgResponseTime < 8000) {
        difficulty = 'hard';
        return wordBanks.hard;
    } else {
        difficulty = 'normal';
        return wordBanks.normal;
    }
}

// Iniciar nova rodada
function startNewRound() {
    const wordBank = selectDifficultyPool();
    const randomIndex = Math.floor(Math.random() * wordBank.length);

    currentExercise = wordBank[randomIndex];
    selectedImage = null;
    wrongAttempts = 0;
    hintUsed = false;
    startTime = Date.now();

    updateUI();
    updateDifficulty();
}

// Atualizar UI geral
function updateUI() {
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('total-rounds').textContent = totalRounds;
    document.getElementById('score').textContent = score + ' pontos';
    document.getElementById('score-display').textContent = score + ' pontos';

    const progress = ((currentRound + 1) / totalRounds) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';

    document.getElementById('sentence-display').textContent = currentExercise.sentence;

    if (currentExercise.difficultWords.length > 0) {
        const difficultWordsDiv = document.getElementById('difficult-words');
        difficultWordsDiv.innerHTML = '';

        currentExercise.difficultWords.forEach(word => {
            const wordDiv = document.createElement('div');
            wordDiv.className = 'difficult-word';
            const syllables = splitSyllables(word);
            wordDiv.innerHTML = `
                <div>${word}</div>
                <div class="syllables">${syllables}</div>
            `;
            wordDiv.addEventListener('click', () => speakWord(word));
            difficultWordsDiv.appendChild(wordDiv);
        });

        document.getElementById('word-difficulty').classList.remove('hidden');
    }

    const imagesContainer = document.getElementById('images-container');
    imagesContainer.innerHTML = '';

    currentExercise.images.forEach((image, index) => {
        const imageCard = document.createElement('div');
        imageCard.className = 'image-card';
        imageCard.innerHTML = `
            <img src="${image.src}" alt="${image.label}">
            <div class="image-label">${image.label}</div>
        `;
        imageCard.addEventListener('click', () => selectImage(index, imageCard));
        imagesContainer.appendChild(imageCard);
    });

    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('explanation').classList.add('hidden');
}

// Selecionar imagem
function selectImage(index, element) {
    document.querySelectorAll('.image-card').forEach(card => {
        card.classList.remove('selected');
    });

    element.classList.add('selected');
    selectedImage = index;
}

// Ler frase em voz alta
function readSentence() {
    const utterance = new SpeechSynthesisUtterance(currentExercise.sentence);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;

    const button = document.getElementById('read-button');
    button.classList.add('playing');

    utterance.onend = () => {
        button.classList.remove('playing');
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}

// Falar palavra individual
function speakWord(word) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.8;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}

// Mostrar dica inteligente
function showHint() {
    if (hintUsed) {
        showFeedback("Você já usou a dica", false);
        return;
    }

    hintUsed = true;
    analytics.hintUsageRate++;

    const correctCard = document.querySelectorAll('.image-card')[currentExercise.correctImageIndex];
    correctCard.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.5)';
    correctCard.style.borderColor = 'rgba(34, 197, 94, 0.5)';

    showFeedback("💡 A imagem correta está destacada com um brilho verde", true);
}

// Verificar resposta COM ANALYTICS
function checkAnswer() {
    responseTime = Date.now() - startTime;
    analytics.responseTimes.push(responseTime);

    if (selectedImage === null) {
        showFeedback("Você deve selecionar uma imagem", false);
        return;
    }

    const isCorrect = selectedImage === currentExercise.correctImageIndex;

    if (isCorrect) {
        classificationPattern.push({
            category: currentExercise.category,
            correct: true,
            hintUsed: hintUsed,
            timeMs: responseTime
        });

        if (wrongAttempts === 0) {
            analytics.correctFirstAttempt++;
        }

        let points = 20;
        if (hintUsed) points = 15;
        if (responseTime > 10000) points -= 5;

        score += points;

        showFeedback(`Correto! +${points} pontos 🎉`, true);

        const correctCard = document.querySelectorAll('.image-card')[currentExercise.correctImageIndex];
        correctCard.classList.add('correct');

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
        classificationPattern.push({
            category: currentExercise.category,
            correct: false,
            errorType: currentExercise.errorType,
            timeMs: responseTime
        });

        if (currentExercise.errorType === 'semantic') {
            analytics.errors.semantic++;
        } else if (currentExercise.errorType === 'phonetic') {
            analytics.errors.phonetic++;
        } else if (currentExercise.errorType === 'visual') {
            analytics.errors.visual++;
        }

        wrongAttempts++;
        showFeedback("Incorreto. Tente novamente", false);

        const incorrectCard = document.querySelectorAll('.image-card')[selectedImage];
        incorrectCard.classList.add('incorrect');

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
    selectedImage = null;
    document.querySelectorAll('.image-card').forEach(card => {
        card.classList.remove('selected', 'incorrect', 'correct');
        card.style.boxShadow = '';
        card.style.borderColor = '';
    });
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('explanation').classList.add('hidden');
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

// Completar jogo COM ANÁLISE DETALHADA
function completeGame() {
    const avgResponseTime = (analytics.responseTimes.reduce((a, b) => a + b, 0) / analytics.responseTimes.length / 1000).toFixed(1);
    const totalErrors = analytics.errors.semantic + analytics.errors.phonetic + analytics.errors.visual;

    let mainErrorType = 'Nenhum';
    let maxErrors = 0;
    if (analytics.errors.semantic > maxErrors) {
        maxErrors = analytics.errors.semantic;
        mainErrorType = 'Compreensão Semântica';
    }
    if (analytics.errors.phonetic > maxErrors) {
        maxErrors = analytics.errors.phonetic;
        mainErrorType = 'Pronúncia/Fonética';
    }
    if (analytics.errors.visual > maxErrors) {
        maxErrors = analytics.errors.visual;
        mainErrorType = 'Memória Visual';
    }

    const categoryPerformance = {};
    classificationPattern.forEach(item => {
        if (!categoryPerformance[item.category]) {
            categoryPerformance[item.category] = { correct: 0, total: 0 };
        }
        categoryPerformance[item.category].total++;
        if (item.correct) categoryPerformance[item.category].correct++;
    });

    const bestCategory = Object.entries(categoryPerformance).sort((a, b) =>
        (b[1].correct / b[1].total) - (a[1].correct / a[1].total)
    )[0];

    const leeCard = document.querySelector('.lee-card');
    leeCard.innerHTML = `
        <h2>Jogo Concluído! 🏆</h2>
        <div class="feedback correct" style="margin-top: 20px;">
            <p><strong>Sua pontuação final:</strong> ${score} pontos</p>
        </div>
        <div class="explanation" style="margin-top: 20px;">
            <h3>📊 Análise de Desempenho</h3>
            <p><strong>Tempo médio de resposta:</strong> ${avgResponseTime}s</p>
            <p><strong>Acertos na primeira tentativa:</strong> ${analytics.correctFirstAttempt}/${totalRounds}</p>
            <p><strong>Erros totais:</strong> ${totalErrors}</p>
            ${totalErrors > 0 ? `<p><strong>Tipo de erro mais frequente:</strong> ${mainErrorType} (${maxErrors})</p>` : '<p><strong>Sem erros! Excelente desempenho.</strong></p>'}
            <p><strong>Categoria mais forte:</strong> ${bestCategory ? bestCategory[0].toUpperCase() : 'N/A'}</p>
            <p style="margin-top: 10px; font-size: 14px; color: #555;">
                ${score >= 90 ? '🌟 Excelente! Você demonstra ótima compreensão leitora e associação visual.' :
                  score >= 70 ? '✨ Bom trabalho! Continue praticando para melhorar.' :
                  '💪 Precisa de mais prática. Você consegue!'}
            </p>
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