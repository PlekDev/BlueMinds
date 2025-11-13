// Variables globales
let currentRound = 0;
let score = 0;
let currentWord = null;
let isRecording = false;
let hasPlayed = false;

const words = [
    { src: "https://picsum.photos/seed/sol/300/300.jpg", name: "sol", audio: "sol", color: "primary" },
    { src: "https://picsum.photos/seed/luna/300/300.jpg", name: "luna", audio: "luna", color: "blue" },
    { src: "https://picsum.photos/seed/estrella/300/300.jpg", name: "estrella", audio: "estrella", color: "red" },
    { src: "https://picsum.photos/seed/nube/300/300.jpg", name: "nube", audio: "nube", color: "purple" },
    { src: "https://picsum.photos/seed/lluvia/300/300.jpg", name: "lluvia", audio: "lluvia", color: "accent" },
    { src: "https://picsum.photos/seed/arbol/300/300.jpg", name: "árbol", audio: "arbol", color: "primary" },
];

const totalRounds = 5;

// Inicializar el juego
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    startNewRound();
});

// Configurar event listeners
function setupEventListeners() {
    document.getElementById('play-button').addEventListener('click', playWord);
    document.getElementById('record-button').addEventListener('click', toggleRecording);
}

// Iniciar una nueva ronda
function startNewRound() {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    currentWord = randomWord;
    hasPlayed = false;
    isRecording = false;
    
    // Actualizar la interfaz
    updateUI();
    
    // Reproducir automáticamente la palabra
    setTimeout(() => playWord(), 1000);
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
    
    // Actualizar imagen
    document.getElementById('current-image').src = currentWord.src;
    
    // Resetear medidor de similitud
    document.getElementById('similarity-fill').style.width = '0%';
    document.getElementById('similarity-text').textContent = '0%';
    
    // Resetear botón de grabación
    const recordButton = document.getElementById('record-button');
    recordButton.innerHTML = '<i class="fas fa-microphone"></i> Grabar mi voz';
    recordButton.className = 'audio-button red';
    
    // Ocultar feedback
    document.getElementById('feedback').classList.add('hidden');
}

// Reproducir la palabra
function playWord() {
    if (!currentWord) return;
    
    // Simular reproducción de audio
    const playButton = document.getElementById('play-button');
    playButton.innerHTML = '<i class="fas fa-volume-up"></i> Reproduciendo...';
    playButton.disabled = true;
    
    // Usar Speech Synthesis API para simular el audio
    const utterance = new SpeechSynthesisUtterance(currentWord.name);
    utterance.lang = 'es-ES';
    utterance.rate = 0.8;
    
    utterance.onend = () => {
        playButton.innerHTML = '<i class="fas fa-volume-up"></i> Escuchar palabra';
        playButton.disabled = false;
        hasPlayed = true;
    };
    
    speechSynthesis.speak(utterance);
}

// Iniciar/detener grabación
function toggleRecording() {
    if (!hasPlayed) {
        showFeedback("Primero escucha la palabra", false);
        return;
    }
    
    const recordButton = document.getElementById('record-button');
    
    if (!isRecording) {
        // Iniciar grabación
        isRecording = true;
        recordButton.innerHTML = '<i class="fas fa-stop"></i> Detener grabación';
        recordButton.className = 'audio-button red recording';
        
        // Simular grabación
        setTimeout(() => {
            if (isRecording) {
                stopRecording();
            }
        }, 3000);
    } else {
        // Detener grabación
        stopRecording();
    }
}

// Detener grabación y analizar
function stopRecording() {
    isRecording = false;
    const recordButton = document.getElementById('record-button');
    recordButton.innerHTML = '<i class="fas fa-microphone"></i> Analizando...';
    recordButton.className = 'audio-button red';
    
    // Simular análisis de voz
    setTimeout(() => {
        // Generar similitud aleatoria (en una implementación real, se usaría reconocimiento de voz)
        const similarity = Math.floor(Math.random() * 40) + 60; // Entre 60% y 100%
        
        // Actualizar medidor de similitud
        document.getElementById('similarity-fill').style.width = similarity + '%';
        document.getElementById('similarity-text').textContent = similarity + '%';
        
        // Determinar si es correcto
        const isCorrect = similarity >= 75;
        
        if (isCorrect) {
            score += 20;
            showFeedback("¡Excelente repetición! 🎉", true);
        } else {
            showFeedback("Intenta de nuevo, no fue muy parecido", false);
        }
        
        // Actualizar puntaje
        document.getElementById('score').textContent = score + ' puntos';
        document.getElementById('score-display').textContent = score + ' puntos';
        
        // Resetear botón de grabación
        recordButton.innerHTML = '<i class="fas fa-microphone"></i> Grabar mi voz';
        
        // Avanzar a la siguiente ronda o finalizar el juego
        setTimeout(() => {
            if (currentRound + 1 >= totalRounds) {
                completeGame();
            } else {
                currentRound++;
                startNewRound();
            }
        }, 2000);
    }, 1500);
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
    const audioCard = document.querySelector('.audio-card');
    audioCard.innerHTML = `
        <h2>¡Juego Completado!</h2>
        <div class="image-display">
            <img src="https://picsum.photos/seed/completado/300/300.jpg" alt="Juego completado">
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