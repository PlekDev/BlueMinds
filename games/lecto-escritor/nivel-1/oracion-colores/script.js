// Variables globales
let currentRound = 0;
let score = 0;
let currentSentence = null;
let words = [];
let droppedWords = [];
let draggedElement = null;

const sentences = [
    { 
        words: [
            { text: "El", color: "blue" },
            { text: "perro", color: "red" },
            { text: "corre", color: "green" }
        ],
        image: "https://img.freepik.com/vector-premium/lindo-perrito-corriendo-ilustracion-dibujos-animados-vector_2699-745.jpg",
        color: "primary" 
    },
    { 
        words: [
            { text: "La", color: "blue" },
            { text: "niña", color: "red" },
            { text: "salta", color: "green" }
        ],
        image: "https://img.freepik.com/vector-premium/nina-saltando-aislado-blanco_253263-210.jpg?w=2000",
        color: "blue" 
    },
    { 
        words: [
            { text: "El", color: "blue" },
            { text: "gato", color: "red" },
            { text: "duerme", color: "green" }
        ],
        image: "https://img.freepik.com/vector-premium/dibujo-dibujos-animados-gato-durmiendo_29937-9676.jpg?w=2000",
        color: "red" 
    },
    { 
        words: [
            { text: "El", color: "blue" },
            { text: "pájaro", color: "red" },
            { text: "vuela", color: "green" }
        ],
        image: "https://th.bing.com/th/id/R.ce83d3472f6439efaade884fc47b6f1e?rik=L55fb4CfQuAcOQ&riu=http%3a%2f%2fst.depositphotos.com%2f1199300%2f1509%2fv%2f950%2fdepositphotos_15093187-stock-illustration-flying-bird-cartoon-isolated-on.jpg&ehk=8pgE4ap73POBZLUYjAbuQHk4wtZjcI0d%2bviTP29cANQ%3d&risl=&pid=ImgRaw&r=0",
        color: "purple" 
    },
    { 
        words: [
            { text: "El", color: "blue" },
            { text: "sol", color: "red" },
            { text: "brilla", color: "green" }
        ],
        image: "https://png.pngtree.com/background/20230519/original/pngtree-cartoon-sun-in-a-sunny-landscape-picture-image_2666701.jpg",
        color: "accent" 
    }
];

const totalRounds = 5;

// Inicializar el juego
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    startNewRound();
});

// Configurar event listeners
function setupEventListeners() {
    document.getElementById('check-button').addEventListener('click', checkSentence);
    document.getElementById('reset-button').addEventListener('click', resetSentence);
    
    // Prevenir comportamiento por defecto para permitir drag and drop
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    
    document.addEventListener('drop', (e) => {
        e.preventDefault();
    });
}

// Iniciar una nueva ronda
function startNewRound() {
    const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
    currentSentence = randomSentence;
    
    // Mezclar las palabras
    words = [...randomSentence.words].sort(() => Math.random() - 0.5);
    droppedWords = [];
    
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
    document.getElementById('sentence-image').src = currentSentence.image;
    
    // Actualizar banco de palabras
    const wordsBank = document.getElementById('words-bank');
    wordsBank.innerHTML = '';
    
    words.forEach((word, index) => {
        const wordElement = createWordElement(word, index);
        wordsBank.appendChild(wordElement);
    });
    
    // Limpiar zona de drop
    const dropZone = document.getElementById('sentence-drop-zone');
    dropZone.innerHTML = '';
    
    // Ocultar feedback
    document.getElementById('feedback').classList.add('hidden');
}

// Crear elemento de palabra
function createWordElement(word, index) {
    const wordElement = document.createElement('div');
    wordElement.className = `word-item word-${word.color}`;
    wordElement.textContent = word.text;
    wordElement.draggable = true;
    wordElement.dataset.index = index;
    
    // Event listeners para drag and drop
    wordElement.addEventListener('dragstart', (e) => {
        draggedElement = e.target;
        e.target.style.opacity = '0.5';
    });
    
    wordElement.addEventListener('dragend', (e) => {
        e.target.style.opacity = '';
    });
    
    return wordElement;
}

// Configurar zona de drop
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('sentence-drop-zone');
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        
        if (draggedElement) {
            const index = parseInt(draggedElement.dataset.index);
            const word = words[index];
            
            // Añadir palabra a la zona de drop
            const droppedWordElement = document.createElement('div');
            droppedWordElement.className = `word-item word-${word.color}`;
            droppedWordElement.textContent = word.text;
            
            // Configurar evento para devolver la palabra al banco
            droppedWordElement.addEventListener('click', () => {
                returnWordToBank(index, droppedWordElement);
            });
            
            dropZone.appendChild(droppedWordElement);
            
            // Ocultar palabra del banco
            draggedElement.style.display = 'none';
            
            // Añadir a la lista de palabras arrastradas
            droppedWords.push({ index, word, element: droppedWordElement });
        }
    });
});

// Devolver palabra al banco
function returnWordToBank(index, element) {
    // Mostrar palabra en el banco
    const wordElements = document.querySelectorAll('#words-bank .word-item');
    if (wordElements[index]) {
        wordElements[index].style.display = '';
    }
    
    // Eliminar de la zona de drop
    element.remove();
    
    // Eliminar de la lista de palabras arrastradas
    droppedWords = droppedWords.filter(item => item.index !== index);
}

// Reiniciar oración
function resetSentence() {
    // Devolver todas las palabras al banco
    droppedWords.forEach(item => {
        returnWordToBank(item.index, item.element);
    });
    
    // Limpiar lista de palabras arrastradas
    droppedWords = [];
}

// Verificar oración
function checkSentence() {
    if (droppedWords.length !== currentSentence.words.length) {
        showFeedback("Debes usar todas las palabras", false);
        return;
    }
    
    // Verificar orden correcto
    let isCorrect = true;
    for (let i = 0; i < droppedWords.length; i++) {
        if (droppedWords[i].word.text !== currentSentence.words[i].text) {
            isCorrect = false;
            break;
        }
    }
    
    if (isCorrect) {
        score += 20;
        showFeedback("¡Oración correcta! 🎉", true);
        
        // Colorear la imagen para indicar éxito
        const imageDisplay = document.getElementById('image-display');
        imageDisplay.classList.add('success');
        
        // Deshabilitar botones
        document.getElementById('check-button').disabled = true;
        document.getElementById('reset-button').disabled = true;
        
        // Avanzar a la siguiente ronda o finalizar el juego
        setTimeout(() => {
            if (currentRound + 1 >= totalRounds) {
                completeGame();
            } else {
                currentRound++;
                startNewRound();
                
                // Rehabilitar botones
                document.getElementById('check-button').disabled = false;
                document.getElementById('reset-button').disabled = false;
                
                // Quitar clase de éxito
                imageDisplay.classList.remove('success');
            }
        }, 2000);
    } else {
        showFeedback("La oración no es correcta. Intenta de nuevo", false);
    }
    
    // Actualizar puntaje
    document.getElementById('score').textContent = score + ' puntos';
    document.getElementById('score-display').textContent = score + ' puntos';
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
    const sentenceCard = document.querySelector('.sentence-card');
    sentenceCard.innerHTML = `
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
    window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-lecto-escritor.html';
}