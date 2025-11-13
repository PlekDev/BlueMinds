// Variables globales
let currentRound = 0;
let score = 0;
let currentImage = null;
let options = [];
let showFeedback = false;

const images = [
    { src: "https://picsum.photos/seed/coche/300/300.jpg", name: "coche", color: "primary" },
    { src: "https://picsum.photos/seed/casa/300/300.jpg", name: "casa", color: "blue" },
    { src: "https://picsum.photos/seed/pelota/300/300.jpg", name: "pelota", color: "red" },
    { src: "https://picsum.photos/seed/perro/300/300.jpg", name: "perro", color: "purple" },
    { src: "https://picsum.photos/seed/gato/300/300.jpg", name: "gato", color: "accent" },
    { src: "https://picsum.photos/seed/flor/300/300.jpg", name: "flor", color: "primary" },
];

const totalRounds = 5;

// Inicializar el juego
document.addEventListener('DOMContentLoaded', () => {
    startNewRound();
});

// Iniciar una nueva ronda
function startNewRound() {
    const randomImage = images[Math.floor(Math.random() * images.length)];
    currentImage = randomImage;
    
    // Crear opciones con la respuesta correcta y respuestas incorrectas aleatorias
    const wrongOptions = images.filter(img => img.name !== randomImage.name);
    const shuffled = [
        randomImage,
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
    
    // Actualizar imagen
    document.getElementById('current-image').src = currentImage.src;
    
    // Actualizar opciones
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    options.forEach((image, index) => {
        const button = document.createElement('button');
        button.className = `option-button ${image.color}`;
        button.textContent = image.name;
        button.onclick = () => handleAnswer(image.name);
        optionsContainer.appendChild(button);
    });
    
    // Ocultar feedback
    document.getElementById('feedback').classList.add('hidden');
}

// Manejar respuesta del usuario
function handleAnswer(selectedName) {
    if (showFeedback) return;
    
    const isCorrect = selectedName === currentImage.name;
    const feedbackElement = document.getElementById('feedback');
    const feedbackText = document.getElementById('feedback-text');
    
    if (isCorrect) {
        score += 20;
        feedbackText.textContent = "¡Correcto! 🎉";
        feedbackElement.className = 'feedback correct';
    } else {
        feedbackText.textContent = `No es correcto. Era: ${currentImage.name} 😊`;
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
    const imageCard = document.querySelector('.image-card');
    imageCard.innerHTML = `
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