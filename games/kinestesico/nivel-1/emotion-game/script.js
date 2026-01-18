// Variables globales
let currentRound = 0;
let score = 0;
let currentEmotion = null;
let options = [];
let showFeedback = false;

const emotions = [
    { emoji: "😊", name: "Feliz", color: "primary" },
    { emoji: "😢", name: "Triste", color: "blue" },
    { emoji: "😠", name: "Enojado", color: "red" },
    { emoji: "😨", name: "Asustado", color: "purple" },
    { emoji: "😲", name: "Sorprendido", color: "accent" },
    { emoji: "🤔", name: "Pensativo", color: "primary" },
];

const totalRounds = 5;

// Inicializar el juego
document.addEventListener('DOMContentLoaded', () => {
    startNewRound();
});

// Iniciar una nueva ronda
function startNewRound() {
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    currentEmotion = randomEmotion;
    
    // Crear opciones con la respuesta correcta y respuestas incorrectas aleatorias
    const wrongOptions = emotions.filter(e => e.name !== randomEmotion.name);
    const shuffled = [
        randomEmotion,
        ...wrongOptions.sort(() => Math.random() - 0.5).slice(0, 2)
    ].sort(() => Math.random() - 0.5);
    
    options = shuffled;
    showFeedback = false;
    
    // Actualizar la interfaz
    updateUI();
}

// Actualizar la interfaz de usuario
function updateUI() {
    // Actualizar progreso
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('total-rounds').textContent = totalRounds;
    document.getElementById('score').textContent = score + ' puntos';
    document.getElementById('score-display').textContent = score + ' puntos';
    
    // Actualizar barra de progreso
    const progress = ((currentRound + 1) / totalRounds) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
    
    // Actualizar emoción
    document.getElementById('emotion-display').textContent = currentEmotion.emoji;
    
    // Actualizar opciones
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    options.forEach((emotion, index) => {
        const button = document.createElement('button');
        button.className = `option-button ${emotion.color}`;
        button.textContent = emotion.name;
        button.onclick = () => handleAnswer(emotion.name);
        optionsContainer.appendChild(button);
    });
    
    // Ocultar feedback
    document.getElementById('feedback').classList.add('hidden');
}

// Manejar respuesta del usuario
function handleAnswer(selectedName) {
    if (showFeedback) return;
    
    const isCorrect = selectedName === currentEmotion.name;
    const feedbackElement = document.getElementById('feedback');
    const feedbackText = document.getElementById('feedback-text');
    
    if (isCorrect) {
        score += 20;
        feedbackText.textContent = "¡Correcto! 🎉";
        feedbackElement.className = 'feedback correct';
    } else {
        feedbackText.textContent = `No es correcto. Era: ${currentEmotion.name} 😊`;
        feedbackElement.className = 'feedback incorrect';
    }
    
    feedbackElement.classList.remove('hidden');
    showFeedback = true;
    
    // Actualizar puntaje
    document.getElementById('score').textContent = score + ' puntos';
    document.getElementById('score-display').textContent = score + ' puntos';
    
    // Avanzar a la siguiente ronda o finalizar el juego
    setTimeout(() => {
        if (currentRound + 1 >= totalRounds) {
            completeGame();
        } else {
            currentRound++;
            startNewRound();
        }
    }, 2000);
}

// Completar el juego
function completeGame() {
    // Mostrar mensaje de finalización
    const emotionCard = document.querySelector('.emotion-card');
    emotionCard.innerHTML = `
        <h2>¡Juego Completado!</h2>
        <div class="emotion-display">🎉</div>
        <div class="feedback correct">
            <p>Tu puntaje final: ${score} puntos</p>
        </div>
        <div class="options-container">
            <button class="option-button primary" onclick="location.reload()">
                Jugar de Nuevo
            </button>
            <button class="option-button blue" onclick="goToMainPage()">
                Volver al Menú
            </button>
        </div>
    `;
}

// Función para volver a la página principal
function goToMainPage() {
    window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-kinestesico.html';
}
