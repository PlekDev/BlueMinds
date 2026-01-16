// Variables globales
let currentRound = 0;
let score = 0;
let currentMovement = null;
let isShowingMovement = false;
let hasPlayed = false;

const movements = [
    { 
        name: "Levanta los brazos", 
        instruction: "levanta los brazos",
        animation: "raise-arms",
        color: "primary" 
    },
    { 
        name: "Baja los brazos", 
        instruction: "baja los brazos",
        animation: "lower-arms",
        color: "blue" 
    },
    { 
        name: "Salta", 
        instruction: "salta",
        animation: "jump",
        color: "red" 
    },
    { 
        name: "Gira a la derecha", 
        instruction: "gira a la derecha",
        animation: "turn-right",
        color: "purple" 
    },
    { 
        name: "Gira a la izquierda", 
        instruction: "gira a la izquierda",
        animation: "turn-left",
        color: "accent" 
    },
    { 
        name: "Agáchate", 
        instruction: "agáchate",
        animation: "squat",
        color: "primary" 
    },
];

const totalRounds = 5;

// Inicializar el juego
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    startNewRound();
});

// Configurar event listeners
function setupEventListeners() {
    document.getElementById('play-button').addEventListener('click', showMovement);
    document.getElementById('done-button').addEventListener('click', completeMovement);
}

// Iniciar una nueva ronda
function startNewRound() {
    const randomMovement = movements[Math.floor(Math.random() * movements.length)];
    currentMovement = randomMovement;
    hasPlayed = false;
    isShowingMovement = false;
    
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
    
    // Resetear avatar
    resetAvatar();
    
    // Resetear instrucción
    document.getElementById('instruction-text').textContent = "Escucha la instrucción";
    
    // Resetear botones
    const playButton = document.getElementById('play-button');
    playButton.innerHTML = '<i class="fas fa-play"></i> Mostrar movimiento';
    playButton.disabled = false;
    
    const doneButton = document.getElementById('done-button');
    doneButton.disabled = true;
    
    // Ocultar feedback
    document.getElementById('feedback').classList.add('hidden');
}

// Resetear avatar a posición inicial
function resetAvatar() {
    const avatar = document.getElementById('avatar');
    avatar.className = 'avatar';
}

// Mostrar movimiento
function showMovement() {
    if (isShowingMovement) return;
    
    isShowingMovement = true;
    hasPlayed = true;
    
    const playButton = document.getElementById('play-button');
    playButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mostrando...';
    playButton.disabled = true;
    
    // Mostrar instrucción
    document.getElementById('instruction-text').textContent = currentMovement.name;
    
    // Aplicar animación al avatar
    const avatar = document.getElementById('avatar');
    avatar.classList.add(currentMovement.animation);
    
    // Reproducir instrucción de audio
    const utterance = new SpeechSynthesisUtterance(currentMovement.instruction);
    utterance.lang = 'es-ES';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
    
    // Después de mostrar el movimiento, habilitar botón de "Lo hice"
    setTimeout(() => {
        playButton.innerHTML = '<i class="fas fa-redo"></i> Repetir movimiento';
        playButton.disabled = false;
        
        const doneButton = document.getElementById('done-button');
        doneButton.disabled = false;
        
        isShowingMovement = false;
    }, 3000);
}

// Completar movimiento
function completeMovement() {
    if (!hasPlayed) return;
    
    // Simular validación del movimiento (en una implementación real, se usaría cámara o sensor)
    const isCorrect = Math.random() > 0.3; // 70% de probabilidad de ser correcto
    
    if (isCorrect) {
        score += 20;
        showFeedback("¡Excelente imitación! 🎉", true);
    } else {
        showFeedback("Intenta de nuevo, no fue exactamente igual", false);
    }
    
    // Actualizar puntaje
    document.getElementById('score').textContent = score + ' puntos';
    document.getElementById('score-display').textContent = score + ' puntos';
    
    // Deshabilitar botones
    document.getElementById('play-button').disabled = true;
    document.getElementById('done-button').disabled = true;
    
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

// Mostrar feedback
function showFeedback(message, isCorrect) {
    const feedbackElement = document.getElementById('feedback');
    const feedbackText = document.getElementById('feedback-text');
    
    feedbackText.textContent = message;
    feedbackElement.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
    feedbackElement.classList.remove('hidden');
}

// Completar el juego
function completeGame() {
    // Mostrar mensaje de finalización
    const movementCard = document.querySelector('.movement-card');
    movementCard.innerHTML = `
        <h2>¡Juego Completado!</h2>
        <div class="avatar-container">
            <div class="avatar celebrate">
                <div class="avatar-head"></div>
                <div class="avatar-body">
                    <div class="avatar-arm avatar-arm-left"></div>
                    <div class="avatar-arm avatar-arm-right"></div>
                    <div class="avatar-leg avatar-leg-left"></div>
                    <div class="avatar-leg avatar-leg-right"></div>
                </div>
            </div>
        </div>
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
    window.location.href = '../../../pages/BlueMindsMain.html';
}