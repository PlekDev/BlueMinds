// Variables globales
let sequence = [];
let playerSequence = [];
let isShowingSequence = false;
let currentLevel = 1;
let score = 0;
let highlightedColor = null;
let feedback = "";

const colors = ["🔴", "🔵", "🟢", "🟡", "🟣", "🟠"];
const maxLevel = 5;

// Inicializar el juego
document.addEventListener('DOMContentLoaded', () => {
    startNewLevel();
});

// Iniciar un nuevo nivel
function startNewLevel() {
    const newSequence = [];
    for (let i = 0; i < currentLevel + 2; i++) {
        newSequence.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    
    sequence = newSequence;
    playerSequence = [];
    feedback = "";
    
    // Actualizar la interfaz
    updateUI();
    
    // Mostrar la secuencia después de un breve retraso
    setTimeout(() => {
        showSequence(newSequence);
    }, 1000);
}

// Mostrar la secuencia de colores
async function showSequence(seq) {
    isShowingSequence = true;
    document.getElementById('status-message').textContent = '👀 ¡Mira la secuencia!';
    
    for (let i = 0; i < seq.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        highlightColor(seq[i]);
        await new Promise(resolve => setTimeout(resolve, 600));
        unhighlightColor();
    }
    
    isShowingSequence = false;
    document.getElementById('status-message').textContent = '¡Tu turno! Repite la secuencia';
}

// Resaltar un color
function highlightColor(color) {
    highlightedColor = color;
    const button = document.querySelector(`[data-color="${color}"]`);
    if (button) {
        button.classList.add('highlighted');
    }
}

// Quitar resaltado de color
function unhighlightColor() {
    if (highlightedColor) {
        const button = document.querySelector(`[data-color="${highlightedColor}"]`);
        if (button) {
            button.classList.remove('highlighted');
        }
        highlightedColor = null;
    }
}

// Manejar clic en un color
function handleColorClick(color) {
    if (isShowingSequence) return;
    
    // Añadir a la secuencia del jugador
    playerSequence.push(color);
    
    // Flash del color
    highlightColor(color);
    setTimeout(() => unhighlightColor(), 300);
    
    // Verificar si la secuencia es correcta hasta ahora
    const isCorrect = sequence[playerSequence.length - 1] === color;
    
    if (!isCorrect) {
        feedback = "¡Ups! Intenta de nuevo 😊";
        score = Math.max(0, score - 5);
        showFeedback(feedback, false);
        
        setTimeout(() => {
            startNewLevel();
        }, 2000);
        return;
    }
    
    // Verificar si la secuencia está completa
    if (playerSequence.length === sequence.length) {
        const levelScore = currentLevel * 20;
        score += levelScore;
        feedback = "¡Excelente! 🎉";
        showFeedback(feedback, true);
        
        setTimeout(() => {
            if (currentLevel >= maxLevel) {
                completeGame();
            } else {
                currentLevel++;
                startNewLevel();
            }
        }, 1500);
    }
    
    // Actualizar la interfaz
    updateUI();
}

// Mostrar retroalimentación
function showFeedback(message, isCorrect) {
    const feedbackElement = document.getElementById('feedback');
    const feedbackText = document.getElementById('feedback-text');
    
    feedbackText.textContent = message;
    
    if (isCorrect) {
        feedbackElement.className = 'feedback correct';
    } else {
        feedbackElement.className = 'feedback incorrect';
    }
    
    feedbackElement.classList.remove('hidden');
}

// Actualizar la interfaz de usuario
function updateUI() {
    // Actualizar progreso
    document.getElementById('current-level').textContent = currentLevel;
    document.getElementById('max-level').textContent = maxLevel;
    document.getElementById('score').textContent = score + ' puntos';
    document.getElementById('score-display').textContent = score + ' puntos';
    
    // Actualizar barra de progreso
    const progress = (currentLevel / maxLevel) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
    
    // Actualizar información de secuencia
    document.getElementById('sequence-progress').textContent = playerSequence.length;
    document.getElementById('sequence-length').textContent = sequence.length;
}

// Completar el juego
function completeGame() {
    // Mostrar mensaje de finalización
    const statusCard = document.querySelector('.status-card');
    statusCard.innerHTML = `
        <div class="status-message">
            ¡Juego Completado!
        </div>
        <div class="feedback correct">
            <p>Tu puntaje final: ${score} puntos</p>
        </div>
    `;
    
    // Ocultar botones de color
    document.querySelector('.color-grid').style.display = 'none';
    
    // Añadir botones de acción
    const colorCard = document.querySelector('.color-card');
    colorCard.innerHTML = `
        <div class="options-container" style="display: flex; gap: 15px; justify-content: center;">
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
    window.location.href = 'https://plekdev.github.io/BlueMinds/pages/BlueMindsMain.html';
}