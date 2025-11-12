// Variables globales
let currentRound = 0;
let score = 0;
let pattern = [];
let options = [];
let correctAnswer = "";
let showFeedback = false;

const shapes = ["🔴", "🔵", "🟢", "🟡", "⭐", "❤️", "🔷", "🔶"];
const totalRounds = 5;

// Inicializar el juego
document.addEventListener('DOMContentLoaded', () => {
    startNewRound();
});

// Iniciar una nueva ronda
function startNewRound() {
    // Crear un patrón simple que se repite
    const patternTypes = [
        // Alternancia simple
        () => {
            const a = shapes[Math.floor(Math.random() * 4)];
            const b = shapes[Math.floor(Math.random() * 4) + 4];
            return [a, b, a, b, a, "?"];
        },
        // Patrón de tres partes
        () => {
            const a = shapes[Math.floor(Math.random() * 3)];
            const b = shapes[Math.floor(Math.random() * 3) + 3];
            const c = shapes[Math.floor(Math.random() * 3) + 5];
            return [a, b, c, a, b, "?"];
        },
        // Patrón doble
        () => {
            const a = shapes[Math.floor(Math.random() * 4)];
            const b = shapes[Math.floor(Math.random() * 4) + 4];
            return [a, a, b, b, a, "?"];
        },
    ];

    const generatePattern = patternTypes[Math.floor(Math.random() * patternTypes.length)];
    const newPattern = generatePattern();
    
    // Encontrar qué debería reemplazar "?"
    let answer = "";
    if (newPattern[0] === newPattern[2] && newPattern[1] === newPattern[3]) {
        // Patrón alternante
        answer = newPattern[1];
    } else if (newPattern[0] === newPattern[1] && newPattern[2] === newPattern[3]) {
        // Patrón doble
        answer = newPattern[0];
    } else {
        // Patrón de tres partes
        const idx = newPattern.indexOf("?");
        answer = newPattern[idx % (newPattern.filter(s => s !== "?").length)];
    }

    pattern = newPattern;
    correctAnswer = answer;
    
    // Crear opciones de respuesta
    const wrongOptions = shapes.filter(s => s !== answer).slice(0, 2);
    const shuffled = [answer, ...wrongOptions].sort(() => Math.random() - 0.5);
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
    
    // Actualizar patrón
    const patternDisplay = document.getElementById('pattern-display');
    patternDisplay.innerHTML = '';
    
    pattern.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'pattern-item';
        if (item === "?") {
            div.classList.add('missing');
        }
        div.textContent = item;
        patternDisplay.appendChild(div);
    });
    
    // Actualizar opciones
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.onclick = () => handleAnswer(option);
        optionsContainer.appendChild(button);
    });
    
    // Ocultar feedback
    document.getElementById('feedback').classList.add('hidden');
}

// Manejar respuesta del usuario
function handleAnswer(selected) {
    if (showFeedback) return;
    
    const isCorrect = selected === correctAnswer;
    const feedbackElement = document.getElementById('feedback');
    const feedbackText = document.getElementById('feedback-text');
    
    if (isCorrect) {
        score += 20;
        feedbackText.textContent = "¡Perfecto! 🎉";
        feedbackElement.className = 'feedback correct';
    } else {
        feedbackText.textContent = `Incorrecto. Era: ${correctAnswer} 😊`;
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
    const patternCard = document.querySelector('.pattern-card');
    patternCard.innerHTML = `
        <h2>¡Juego Completado!</h2>
        <div class="pattern-display">
            <div class="pattern-item">🎉</div>
        </div>
        <div class="feedback correct">
            <p>Tu puntaje final: ${score} puntos</p>
        </div>
        <div class="options-container">
            <button class="option-button" onclick="location.reload()">
                Jugar de Nuevo
            </button>
            <button class="option-button" onclick="goToMainPage()">
                Volver al Menú
            </button>
        </div>
    `;
}

// Función para volver a la página principal
function goToMainPage() {
    window.location.href = '../../pages/BlueMindsMain.html';
}