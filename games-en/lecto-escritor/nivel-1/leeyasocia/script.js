// Global variables
let currentRound = 0;
let score = 0;
let currentExercise = null;
let selectedImage = null;
let difficulty = 'normal';
let wrongAttempts = 0;
let hintUsed = false;

const exercises = {
    easy: [
        {
            sentence: "The cat is sleeping.",
            correctImageIndex: 0,
            difficultWords: ['sleeping'],
            explanation: "The sentence describes a cat sleeping. It is a simple and clear action.",
            images: [
                { src: 'https://img2.clipart-library.com/27/cat-sleeping-clipart/cat-sleeping-clipart-3.jpg', label: 'Sleeping cat' },
                { src: 'https://image.shutterstock.com/image-vector/little-doggy-cute-puppy-playing-600w-255443107.jpg', label: 'Playing dog' },
                { src: 'https://static.vecteezy.com/system/resources/previews/003/286/369/original/cartoon-character-exotic-shorthair-cat-running-vector.jpg', label: 'Running cat' }
            ]
        },
        {
            sentence: "The boy plays in the park.",
            correctImageIndex: 1,
            difficultWords: ['park'],
            explanation: "The sentence is about a boy playing. The park is the place where the action happens.",
            images: [
                { src: 'https://thumbs.dreamstime.com/z/caricatura-de-un-ni%C3%B1o-que-barre-el-suelo-ni%C3%B1os-haciendo-tareas-dom%C3%A9sticas-en-concepto-casa-dibujo-198013814.jpg', label: 'Boy at home' },
                { src: 'https://static.vecteezy.com/system/resources/previews/008/666/296/non_2x/kids-playing-outdoor-in-park-vector.jpg', label: 'Boy at park' },
                { src: 'https://static.vecteezy.com/system/resources/previews/002/538/755/large_2x/happy-cute-cartoon-school-children-vector.jpg', label: 'Boy at school' }
            ]
        },
        {
            sentence: "The little bird sings.",
            correctImageIndex: 2,
            difficultWords: ['bird'],
            explanation: "A little bird is a small bird. The action is singing.",
            images: [
                { src: 'https://static.vecteezy.com/system/resources/previews/005/162/515/original/cartoon-blue-bird-sitting-in-a-nest-free-vector.jpg', label: 'Bird in nest' },
                { src: 'https://img.freepik.com/vector-premium/pajaro-azul-dibujos-animados-sentado-rama-arbol_29190-5361.jpg', label: 'Bird on branch' },
                { src: 'https://img.freepik.com/vector-premium/ilustracion-vectorial-dibujos-animados-pajaro-lindo-cantando_869472-1107.jpg', label: 'Bird singing' }
            ]
        }
    ],
    normal: [
        {
            sentence: "The butterfly flies among the flowers.",
            correctImageIndex: 1,
            difficultWords: ['butterfly', 'flowers'],
            explanation: "A butterfly is a colorful insect that flies. It naturally flies among flowers.",
            images: [
                { src: 'https://img.freepik.com/vector-premium/lindo-gato-flor-vector-dibujos-animados-sobre-fondo-blanco_1026278-7253.jpg', label: 'Cat in flowers' },
                { src: 'https://img.freepik.com/vector-premium/mariposas-vuelo-flor-jardin_1308-4021.jpg', label: 'Butterfly in flowers' },
                { src: 'https://static.vecteezy.com/system/resources/previews/017/675/147/original/cute-cartoon-postcard-sunny-lawn-with-bees-flying-under-red-daisy-flowers-and-grass-isolated-on-white-background-bees-are-collecting-honey-in-the-sunny-summer-day-vector.jpg', label: 'Bee in flowers' }
            ]
        },
        {
            sentence: "The elephant walks slowly across the savanna.",
            correctImageIndex: 0,
            difficultWords: ['elephant', 'savanna'],
            explanation: "An elephant is a large animal. The savanna is its natural habitat.",
            images: [
                { src: 'https://i.pinimg.com/736x/9a/e4/39/9ae43949a771f9fb650c7786fed63cdc--elephants.jpg', label: 'Elephant on savanna' },
                { src: 'https://img.freepik.com/vector-premium/feliz-leon-dibujos-animados-sabana_133260-14519.jpg', label: 'Lion on savanna' },
                { src: 'https://static.vecteezy.com/system/resources/previews/060/831/743/non_2x/giraffe-eating-leaves-from-tree-with-green-foliage-in-simple-nature-background-illustration-vector.jpg', label: 'Giraffe eating' }
            ]
        },
        {
            sentence: "The crocodile swims in the river.",
            correctImageIndex: 2,
            difficultWords: ['crocodile'],
            explanation: "A crocodile is a reptile that lives in water. Swimming is its main activity.",
            images: [
                { src: 'https://static.vecteezy.com/system/resources/previews/003/278/420/large_2x/animal-character-funny-crocodile-in-cartoon-style-vector.jpg', label: 'Crocodile on land' },
                { src: 'https://static.vecteezy.com/system/resources/previews/021/458/217/non_2x/cute-green-snake-cartoon-on-white-background-vector.jpg', label: 'Snake in river' },
                { src: 'https://img.freepik.com/vector-premium/cocodrilo-agua-cocodrilo-anfibio-reptil-salvaje-verde-enojado-salvaje-animal-natacion-dibujos-animados-fondo_80590-4822.jpg', label: 'Crocodile swimming' }
            ]
        }
    ],
    hard: [
        {
            sentence: "The majestic symphony orchestra performed an extraordinary sonata.",
            correctImageIndex: 1,
            difficultWords: ['majestic', 'orchestra', 'symphony', 'performed', 'sonata', 'extraordinary'],
            explanation: "This describes musicians playing instruments together. Complex words make reading more challenging.",
            images: [
                { src: 'https://static.vecteezy.com/system/resources/previews/016/704/376/original/cartoon-illustration-acoustic-guitar-colorful-musical-instrument-vector.jpg', label: 'Solo guitar' },
                { src: 'https://img.freepik.com/vector-premium/conjunto-grupo-orquesta-conductor-escenario_7496-856.jpg', label: 'Orchestra playing' },
                { src: 'https://static.vecteezy.com/system/resources/previews/016/269/586/original/open-air-concert-illustration-concept-on-white-background-vector.jpg', label: 'Modern concert' }
            ]
        },
        {
            sentence: "The hippo submerges deeply in the muddy swamp.",
            correctImageIndex: 0,
            difficultWords: ['hippo', 'submerges', 'deeply', 'swamp', 'muddy'],
            explanation: "This describes a hippopotamus in its aquatic environment. Complex vocabulary for advanced readers.",
            images: [
                { src: 'https://static.vecteezy.com/system/resources/previews/005/561/609/non_2x/hippo-cartoon-colored-illustration-free-vector.jpg', label: 'Hippo in water' },
                { src: 'https://static.vecteezy.com/system/resources/previews/044/841/151/original/cartoon-elephant-animal-illustration-vector.jpg', label: 'Elephant' },
                { src: 'https://png.pngtree.com/png-clipart/20220823/original/pngtree-the-cute-baby-rhino-with-the-excited-expression-png-image_8451466.png', label: 'Rhinoceros' }
            ]
        },
        {
            sentence: "The diligent researcher meticulously examined the archaeological artifacts.",
            correctImageIndex: 2,
            difficultWords: ['diligent', 'researcher', 'meticulously', 'examined', 'archaeological', 'artifacts'],
            explanation: "This describes an archaeologist working. Academic vocabulary to stimulate critical thinking.",
            images: [
                { src: 'https://static.vecteezy.com/system/resources/previews/000/299/564/large_2x/childrens-doing-activities-in-library-vector.jpg', label: 'Library' },
                { src: 'https://c8.alamy.com/compes/2gak438/diseno-de-dibujos-animados-de-cientifico-de-pie-en-el-laboratorio-2gak438.jpg', label: 'Science lab' },
                { src: 'https://img.freepik.com/vector-premium/ninos-arqueologos-ninos-arqueologia-dibujos-animados-nino-arqueologo-o-paleontologo-historia-excavacion-ninos-que-trabajan-explorando-fosiles-antiguos-suelo-ilustracion-vectorial-reciente_81894-14923.jpg', label: 'Archaeologist digging' }
            ]
        }
    ]
};

const totalRounds = 5;

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    startNewRound();
});

function setupEventListeners() {
    document.getElementById('check-button').addEventListener('click', checkAnswer);
    document.getElementById('reset-button').addEventListener('click', resetRound);
    document.getElementById('hint-button').addEventListener('click', showHint);
    document.getElementById('read-button').addEventListener('click', readSentence);
}

function selectDifficultyPool() {
    if (wrongAttempts >= 2) { difficulty = 'easy'; return exercises.easy; }
    if (score >= 70 && currentRound > 2) { difficulty = 'hard'; return exercises.hard; }
    difficulty = 'normal';
    return exercises.normal;
}

function startNewRound() {
    const difficultyPool = selectDifficultyPool();
    const randomIndex = Math.floor(Math.random() * difficultyPool.length);
    currentExercise = difficultyPool[randomIndex];
    selectedImage = null;
    wrongAttempts = 0;
    hintUsed = false;
    updateUI();
    updateDifficulty();
}

function updateUI() {
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('total-rounds').textContent = totalRounds;
    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';

    const progress = ((currentRound + 1) / totalRounds) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';

    document.getElementById('sentence-display').textContent = currentExercise.sentence;

    if (currentExercise.difficultWords.length > 0) {
        const div = document.getElementById('difficult-words');
        div.innerHTML = '';
        currentExercise.difficultWords.forEach(word => {
            const wordDiv = document.createElement('div');
            wordDiv.className = 'difficult-word';
            wordDiv.innerHTML = `<div>${word}</div>`;
            wordDiv.addEventListener('click', () => speakWord(word));
            div.appendChild(wordDiv);
        });
        document.getElementById('word-difficulty').classList.remove('hidden');
    }

    const imagesContainer = document.getElementById('images-container');
    imagesContainer.innerHTML = '';
    currentExercise.images.forEach((image, index) => {
        const imageCard = document.createElement('div');
        imageCard.className = 'image-card';
        imageCard.innerHTML = `<img src="${image.src}" alt="${image.label}"><div class="image-label">${image.label}</div>`;
        imageCard.addEventListener('click', () => selectImage(index, imageCard));
        imagesContainer.appendChild(imageCard);
    });

    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('explanation').classList.add('hidden');
}

function selectImage(index, element) {
    document.querySelectorAll('.image-card').forEach(card => card.classList.remove('selected'));
    element.classList.add('selected');
    selectedImage = index;
}

function readSentence() {
    const utterance = new SpeechSynthesisUtterance(currentExercise.sentence);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    const button = document.getElementById('read-button');
    button.classList.add('playing');
    utterance.onend = () => button.classList.remove('playing');
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}

function speakWord(word) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}

function showHint() {
    if (hintUsed) { showFeedback("You already used the hint", false); return; }
    hintUsed = true;
    const correctCard = document.querySelectorAll('.image-card')[currentExercise.correctImageIndex];
    correctCard.style.boxShadow = '0 0 20px rgba(34,197,94,0.5)';
    correctCard.style.borderColor = 'rgba(34,197,94,0.5)';
    showFeedback("💡 The correct image is highlighted", true);
}

function checkAnswer() {
    if (selectedImage === null) { showFeedback("You must select an image", false); return; }

    const isCorrect = selectedImage === currentExercise.correctImageIndex;

    if (isCorrect) {
        let points = hintUsed ? 15 : 20;
        score += points;
        showFeedback(`Correct! +${points} points 🎉`, true);
        document.querySelectorAll('.image-card')[currentExercise.correctImageIndex].classList.add('correct');
        setTimeout(() => showExplanation(), 500);

        document.getElementById('check-button').disabled = true;
        document.getElementById('reset-button').disabled = true;
        document.getElementById('hint-button').disabled = true;

        setTimeout(() => {
            if (currentRound + 1 >= totalRounds) completeGame();
            else {
                currentRound++;
                startNewRound();
                document.getElementById('check-button').disabled = false;
                document.getElementById('reset-button').disabled = false;
                document.getElementById('hint-button').disabled = false;
            }
        }, 3000);
    } else {
        wrongAttempts++;
        showFeedback("Incorrect. Try again", false);
        document.querySelectorAll('.image-card')[selectedImage].classList.add('incorrect');
        updateDifficulty();
    }

    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';
}

function showExplanation() {
    document.getElementById('explanation-text').textContent = currentExercise.explanation;
    document.getElementById('explanation').classList.remove('hidden');
}

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

function showFeedback(message, isCorrect) {
    const el = document.getElementById('feedback');
    el.textContent = message;
    el.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
    el.classList.remove('hidden');
}

function updateDifficulty() {
    const newDifficulty = wrongAttempts >= 2 ? 'easy' : (score >= 70 && currentRound > 2 ? 'hard' : 'normal');
    document.getElementById('difficulty-badge').textContent = { easy: '🎯 Easy', normal: 'Normal', hard: '⭐ Advanced' }[newDifficulty];
}

function completeGame() {
    document.querySelector('.lee-card').innerHTML = `
        <h2>Game Complete! 🏆</h2>
        <div class="feedback correct" style="margin-top:20px;"><p><strong>Your final score:</strong> ${score} points</p></div>
        <div class="explanation" style="margin-top:20px;">
            <h3>Performance Summary</h3>
            <p>You completed all reading and matching activities. Excellent work identifying the correct images!</p>
            <p style="margin-top:10px;font-size:14px;">Keep reading to improve your vocabulary and comprehension.</p>
        </div>
        <div class="action-controls" style="margin-top:30px;">
            <button class="action-button primary" onclick="location.reload()"><i class="fas fa-redo"></i> Play Again</button>
            <button class="action-button blue" onclick="goToMainPage()"><i class="fas fa-home"></i> Back to Menu</button>
        </div>`;
}

function goToMainPage() { window.location.href = '../../../'; }
