class ProfessionsGame {
    constructor() {
        this.currentQuestion = 0;
        this.score = 0;
        this.selectedOption = null;
        this.answered = false;
        
        this.questions = [
            {
                image: "https://i.pinimg.com/originals/dd/5f/5d/dd5f5d4cbe0531cd5dc4d5b7204b38a4.png?nii=t",
                options: ["Médico", "Ingeniero", "Cocinero"],
                correctAnswer: 0
            },
            {
                image: "https://tse1.mm.bing.net/th/id/OIP.msPDaNRRUyVPXdHj-pV-pwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
                options: ["Abogado", "Profesor", "Piloto"],
                correctAnswer: 1
            },
            {
                image: "https://static.vecteezy.com/system/resources/previews/002/084/042/original/cute-fire-fighter-holding-wooden-stairs-character-cartoon-icon-illustration-free-vector.jpg",
                options: ["Bombero", "Electricista", "Músico"],
                correctAnswer: 0
            }
        ];
        
        this.initializeEventListeners();
        this.loadQuestion();
    }
    
    initializeEventListeners() {
        document.getElementById('checkAnswerBtn').addEventListener('click', () => this.checkAnswer());
        document.getElementById('nextQuestionBtn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('backBtn').addEventListener('click', () => this.goToMainPage());
        document.getElementById('backToMenuBtn').addEventListener('click', () => this.goToMainPage());
    }
    
    loadQuestion() {
        this.selectedOption = null;
        this.answered = false;
        
        // Actualizar número de pregunta y progreso
        document.getElementById('questionNumber').textContent = `Pregunta ${this.currentQuestion + 1} de ${this.questions.length}`;
        document.getElementById('progressText').textContent = `${this.currentQuestion + 1}/${this.questions.length}`;
        document.getElementById('progressFill').style.width = `${((this.currentQuestion + 1) / this.questions.length) * 100}%`;
        
        // Cargar imagen
        document.getElementById('professionImage').src = this.questions[this.currentQuestion].image;
        
        // Generar opciones
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = '';
        
        this.questions[this.currentQuestion].options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.textContent = option;
            optionElement.addEventListener('click', () => this.selectOption(index));
            optionsContainer.appendChild(optionElement);
        });
        
        // Limpiar feedback
        const feedback = document.getElementById('feedback');
        feedback.classList.remove('show', 'correct', 'incorrect');
        
        // Resetear botones
        document.getElementById('checkAnswerBtn').style.display = 'inline-flex';
        document.getElementById('checkAnswerBtn').disabled = false;
        document.getElementById('nextQuestionBtn').style.display = 'none';
    }
    
    selectOption(index) {
        if (this.answered) return;
        
        // Deseleccionar todas las opciones
        document.querySelectorAll('.option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Seleccionar la opción actual
        document.querySelectorAll('.option')[index].classList.add('selected');
        this.selectedOption = index;
    }
    
    checkAnswer() {
        if (this.selectedOption === null) {
            this.showFeedback('Por favor, selecciona una opción', false);
            return;
        }
        
        this.answered = true;
        
        // Mostrar si la respuesta es correcta o incorrecta
        const options = document.querySelectorAll('.option');
        options[this.questions[this.currentQuestion].correctAnswer].classList.add('correct');
        
        if (this.selectedOption !== this.questions[this.currentQuestion].correctAnswer) {
            options[this.selectedOption].classList.add('incorrect');
            this.showFeedback('¡Incorrecto! Intenta con otra opción', false);
        } else {
            this.score += 10;
            document.getElementById('score').textContent = this.score;
            this.showFeedback('¡Correcto! ¡Bien hecho!', true);
        }
        
        // Deshabilitar botón de verificar respuesta
        document.getElementById('checkAnswerBtn').disabled = true;
        
        // Mostrar botón de siguiente pregunta o terminar juego
        if (this.currentQuestion < this.questions.length - 1) {
            setTimeout(() => {
                document.getElementById('nextQuestionBtn').style.display = 'inline-flex';
            }, 1500);
        } else {
            setTimeout(() => this.endGame(), 2000);
        }
    }
    
    showFeedback(message, isCorrect) {
        const feedback = document.getElementById('feedback');
        const feedbackText = document.getElementById('feedbackText');
        const feedbackIcon = document.getElementById('feedbackIcon');
        
        feedbackText.textContent = message;
        feedbackIcon.textContent = isCorrect ? '✓' : '✗';
        
        feedback.classList.remove('correct', 'incorrect');
        feedback.classList.add(isCorrect ? 'correct' : 'incorrect', 'show');
    }
    
    nextQuestion() {
        this.currentQuestion++;
        this.loadQuestion();
    }
    
    endGame() {
        const modal = document.getElementById('gameOverModal');
        const finalScore = document.getElementById('finalScore');
        const resultMessage = document.getElementById('resultMessage');
        const starsContainer = document.getElementById('starsContainer');
        
        finalScore.textContent = this.score;
        
        // Calcular estrellas
        const percentage = (this.score / (this.questions.length * 10)) * 100;
        let stars = 0;
        let message = '';
        
        if (percentage === 100) {
            stars = 3;
            message = '¡Perfecto! ¡Eres un experto en profesiones! 🏆';
        } else if (percentage >= 66) {
            stars = 2;
            message = '¡Muy bien! ¡Casi perfecto! 🌟';
        } else if (percentage >= 33) {
            stars = 1;
            message = '¡Buen intento! ¡Sigue practicando! 💪';
        } else {
            stars = 0;
            message = '¡No te rindas! ¡La próxima vez será mejor! 📚';
        }
        
        resultMessage.textContent = message;
        
        // Mostrar estrellas
        starsContainer.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const star = document.createElement('span');
            star.textContent = i < stars ? '⭐' : '☆';
            starsContainer.appendChild(star);
        }
        
        modal.classList.add('show');
    }
    
    restartGame() {
        this.currentQuestion = 0;
        this.score = 0;
        this.selectedOption = null;
        this.answered = false;
        
        document.getElementById('score').textContent = this.score;
        document.getElementById('gameOverModal').classList.remove('show');
        
        this.loadQuestion();
    }
    
    // Función para volver a la página principal
    goToMainPage() {
        window.location.href = 'https://plekdev.github.io/BlueMinds/pages/BlueMindsMain.html';
    }
}

// Iniciar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new ProfessionsGame();
});