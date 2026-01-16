// Variables globales
let currentRound = 0;
let score = 0;
let currentImage = null;
let options = [];
let showFeedback = false;

const images = [
    { src: "https://i.pinimg.com/originals/29/1e/d3/291ed353f93b45f607755109cca2a052.jpg", name: "coche", color: "primary" },
    { src: "https://cdn5.vectorstock.com/i/1000x1000/43/49/cartoon-house-vector-4514349.jpg", name: "casa", color: "blue" },
    { src: "https://thumbs.dreamstime.com/z/pelota-de-f%C3%BAtbol-para-jugar-icono-en-el-estilo-dibujos-animados-caricatura-aislado-fondo-blanco-236463054.jpg", name: "pelota", color: "red" },
    { src: "https://cdn.pixabay.com/photo/2024/03/10/13/43/dog-8624743_1280.png", name: "perro", color: "purple" },
    { src: "https://static.vecteezy.com/system/resources/previews/013/089/641/original/illustration-of-cute-colored-cat-cat-cartoon-image-in-eps10-format-suitable-for-children-s-book-design-elements-introduction-of-cats-to-children-books-or-posters-about-animal-vector.jpg", name: "gato", color: "accent" },
    { src: "https://cdn.pixabay.com/photo/2022/12/13/05/16/flowers-7652496_1280.png", name: "flor", color: "primary" },
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
    window.location.href = 'https://plekdev.github.io/BlueMinds/pages/BlueMindsMain.html';
}