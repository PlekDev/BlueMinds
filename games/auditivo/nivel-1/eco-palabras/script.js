// Variables globales
let currentRound = 0;
let score = 0;
let currentWord = null;
let isRecording = false;
let hasPlayed = false;

const words = [
    { src: "https://tse1.mm.bing.net/th/id/OIP.z589HEF6wuRZZR-B9C49RQHaFK?rs=1&pid=ImgDetMain&o=7&rm=3", name: "sol", audio: "sol", color: "primary" },
    { src: "https://img.freepik.com/vector-premium/icono-luna-lindo-estilo-dibujos-animados_74102-7166.jpg?w=2000", name: "luna", audio: "luna", color: "blue" },
    { src: "https://img.freepik.com/vector-premium/estrella-dibujada-mano-plana-elegante-mascota-personaje-dibujos-animados-dibujo-pegatina-icono-concepto-aislado_730620-302755.jpg", name: "estrella", audio: "estrella", color: "red" },
    { src: "https://static.vecteezy.com/system/resources/previews/024/190/108/non_2x/cute-cartoon-cloud-kawaii-weather-illustrations-for-kids-free-png.png", name: "nube", audio: "nube", color: "purple" },
    { src: "https://img.freepik.com/fotos-premium/estilo-ilustracion-vectorial-lluvia-dibujos-animados_750724-13162.jpg", name: "lluvia", audio: "lluvia", color: "accent" },
    { src: "https://static.vecteezy.com/system/resources/previews/008/132/083/non_2x/green-tree-cartoon-isolated-on-white-background-illustration-of-green-tree-cartoon-free-vector.jpg", name: "árbol", audio: "arbol", color: "primary" },
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
            <img src="https://img.freepik.com/vector-gratis/personaje-feliz-dibujos-animados-ganando-premio_23-2147880844.jpg?w=1380&t=st=1664713364~exp=1664713964~hmac=0fdd3e22a937b74843cf341e4f575247c075c0495a5e4f7ac7983f37a3e1d9ed" alt="Juego completado">
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
    window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-auditivo.html';
    
}