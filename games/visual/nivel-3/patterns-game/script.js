// Variables globales
let currentRound = 0;
let score = 0;
let currentPatternData = null;
let correctAnswer = "";
let showFeedback = false;

const totalRounds = 5;

// PATRONES DEFINIDOS MANUALMENTE CON EMOJIS
const patternsDatabase = [
    {
        name: "alternancia_cuadrados_rojo_azul",
        display: ["🟥", "🟦", "🟥", "🟦", "🟥", "?"],
        correct: "🟦",
        options: ["🟥", "🟦", "🟩"]
    },
    {
        name: "alternancia_cuadrados_verde_amarillo",
        display: ["🟩", "🟨", "🟩", "🟨", "🟩", "?"],
        correct: "🟨",
        options: ["🟩", "🟨", "🟪"]
    },
    {
        name: "tres_partes_rojo_azul_verde",
        display: ["🟥", "🟦", "🟩", "🟥", "🟦", "?"],
        correct: "🟩",
        options: ["🟥", "🟦", "🟩"]
    },
    {
        name: "doble_rojo_azul",
        display: ["🟥", "🟥", "🟦", "🟦", "🟥", "?"],
        correct: "🟥",
        options: ["🟥", "🟦", "🟨"]
    },
    {
        name: "alternancia_morado_negro",
        display: ["🟪", "⬛", "🟪", "⬛", "🟪", "?"],
        correct: "⬛",
        options: ["🟪", "⬛", "⬜"]
    },
    {
        name: "tres_partes_amarillo_morado_negro",
        display: ["🟨", "🟪", "⬛", "🟨", "🟪", "?"],
        correct: "⬛",
        options: ["🟨", "🟪", "⬛"]
    },
    {
        name: "doble_verde_amarillo",
        display: ["🟩", "🟩", "🟨", "🟨", "🟩", "?"],
        correct: "🟩",
        options: ["🟩", "🟨", "🟦"]
    },
    {
        name: "alternancia_azul_verde",
        display: ["🟦", "🟩", "🟦", "🟩", "🟦", "?"],
        correct: "🟩",
        options: ["🟦", "🟩", "🟥"]
    },
    {
        name: "tres_partes_blanco_negro_rojo",
        display: ["⬜", "⬛", "🟥", "⬜", "⬛", "?"],
        correct: "🟥",
        options: ["⬜", "⬛", "🟥"]
    },
    {
        name: "doble_morado_blanco",
        display: ["🟪", "🟪", "⬜", "⬜", "🟪", "?"],
        correct: "🟪",
        options: ["🟪", "⬜", "🟦"]
    }
];

// Inicializar el juego
document.addEventListener('DOMContentLoaded', () => {
    startNewRound();
});

// Iniciar una nueva ronda
function startNewRound() {
    // Seleccionar un patrón aleatorio
    const randomPattern = patternsDatabase[Math.floor(Math.random() * patternsDatabase.length)];
    currentPatternData = randomPattern;
    correctAnswer = randomPattern.correct;
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
    
    currentPatternData.display.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'pattern-item';
        if (item === "?") {
            div.classList.add('missing');
            div.innerHTML = '<span class="question-mark">?</span>';
        } else {
            div.textContent = item;
        }
        patternDisplay.appendChild(div);
    });
    
    // Actualizar opciones
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    // Barajar opciones
    const shuffledOptions = [...currentPatternData.options].sort(() => Math.random() - 0.5);
    
    shuffledOptions.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.onclick = () => handleAnswer(option, button);
        optionsContainer.appendChild(button);
    });
    
    // Ocultar feedback
    document.getElementById('feedback').classList.add('hidden');
}

// Manejar respuesta del usuario
function handleAnswer(selected, buttonElement) {
    if (showFeedback) return;
    
    const isCorrect = selected === correctAnswer;
    const feedbackElement = document.getElementById('feedback');
    const feedbackText = document.getElementById('feedback-text');
    
    // Deshabilitar todos los botones
    const allButtons = document.querySelectorAll('.option-button');
    allButtons.forEach(btn => btn.disabled = true);
    
    if (isCorrect) {
        score += 20;
        feedbackText.textContent = "¡Correcto! ✅";
        feedbackElement.className = 'feedback correct';
        
        // Animar el botón correcto
        buttonElement.classList.add('answer-correct');
    } else {
        feedbackText.innerHTML = `Incorrecto ❌<br>La respuesta correcta era: <strong>${correctAnswer}</strong>`;
        feedbackElement.className = 'feedback incorrect';
        
        // Mostrar respuesta correcta
        allButtons.forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('answer-correct');
            } else {
                btn.classList.add('answer-incorrect');
            }
        });
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
    }, 2500);
}

// Completar el juego
function completeGame() {
    // Mostrar mensaje de finalización
    const patternCard = document.querySelector('.pattern-card');
    const accuracy = ((score / (totalRounds * 20)) * 100).toFixed(0);
    
    let message = '¡Excelente! 🏆';
    if (accuracy < 60) {
        message = '¡Sigue practicando! 💪';
    } else if (accuracy < 80) {
        message = '¡Muy buen trabajo! 🌟';
    }
    
    patternCard.innerHTML = `
        <h2>¡Juego Completado!</h2>
        <div class="completion-emoji">🎉</div>
        <div class="completion-score">
            <p>Tu puntaje final: <strong>${score} puntos</strong></p>
            <p>Precisión: <strong>${accuracy}%</strong></p>
            <p style="font-size: 20px; margin-top: 10px;">${message}</p>
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
    window.location.href = '/pages/BlueMindsMain.html';
}