// ===== ADAPTIVE AI SYSTEM FOR PROFESSION RECOGNITION =====
class AIProfessionsGame {
    constructor() {
        this.currentQuestion = 0;
        this.score = 0;
        this.selectedOption = null;
        this.answered = false;
        
        // AI parameters
        this.professionScore = 0;
        this.difficulty = 'easy';
        this.consecutiveCorrect = 0;
        this.consecutiveWrong = 0;
        this.totalQuestions = 5;
        
        // Error analysis
        this.professionStats = {};
        this.masteredProfessions = [];
        this.problematicProfessions = [];
        
        // Profession database by difficulty
        this.allQuestions = {
            easy: [
                {
                    image: "https://i.pinimg.com/originals/dd/5f/5d/dd5f5d4cbe0531cd5dc4d5b7204b38a4.png",
                    options: ["Doctor", "Engineer", "Cook"],
                    correctAnswer: 0,
                    profession: "Doctor",
                    category: "health",
                    complexity: 1
                },
                {
                    image: "https://tse1.mm.bing.net/th/id/OIP.msPDaNRRUyVPXdHj-pV-pwHaHa?rs=1&pid=ImgDetMain",
                    options: ["Lawyer", "Teacher", "Pilot"],
                    correctAnswer: 1,
                    profession: "Teacher",
                    category: "education",
                    complexity: 1
                },
                {
                    image: "https://static.vecteezy.com/system/resources/previews/002/084/042/original/cute-fire-fighter-holding-wooden-stairs-character-cartoon-icon-illustration-free-vector.jpg",
                    options: ["Firefighter", "Electrician", "Musician"],
                    correctAnswer: 0,
                    profession: "Firefighter",
                    category: "safety",
                    complexity: 1
                },
                {
                    image: "https://img.freepik.com/vector-premium/ilustracion-vectorial-dibujos-animados-chef-cocinando-plato-arroz-frito_1263357-24820.jpg?w=2000",
                    options: ["Cook", "Waiter", "Pilot"],
                    correctAnswer: 0,
                    profession: "Cook",
                    category: "gastronomy",
                    complexity: 1
                },
                {
                    image: "https://img.freepik.com/vector-premium/profesion-constructor-hombre-estilo-dibujos-animados-plana_180868-418.jpg",
                    options: ["Builder", "Plumber", "Carpenter"],
                    correctAnswer: 0,
                    profession: "Builder",
                    category: "construction",
                    complexity: 1
                }
            ],
            medium: [
                {
                    image: "https://image.freepik.com/vector-gratis/enfermera-personaje-dibujos-animados-lindo_78094-108.jpg",
                    options: ["Lawyer", "Doctor", "Nurse"],
                    correctAnswer: 2,
                    profession: "Nurse",
                    category: "health",
                    complexity: 2
                },
                {
                    image: "https://static.vecteezy.com/system/resources/previews/049/166/524/original/cute-girl-photographer-with-camera-illustration-cartoon-style-free-vector.jpg",
                    options: ["Photographer", "Cameraman", "Artist"],
                    correctAnswer: 0,
                    profession: "Photographer",
                    category: "arts",
                    complexity: 2
                },
                {
                    image: "https://tse3.mm.bing.net/th/id/OIP.v0OHHvrgQAR3Py8Yn7kxPQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
                    options: ["Veterinarian", "Dentist", "Ophthalmologist"],
                    correctAnswer: 1,
                    profession: "Dentist",
                    category: "health",
                    complexity: 2
                },
                {
                    image: "https://tse3.mm.bing.net/th/id/OIP.gVeGGYgBXKC50q1hUWjCIQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
                    options: ["Gardener", "Farmer", "Landscaper"],
                    correctAnswer: 0,
                    profession: "Gardener",
                    category: "nature",
                    complexity: 2
                },
                {
                    image: "https://tse3.mm.bing.net/th/id/OIP.iWlnUosfG4X9bSz_-DkuwAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
                    options: ["Mechanic", "Engineer", "Technician"],
                    correctAnswer: 0,
                    profession: "Mechanic",
                    category: "mechanics",
                    complexity: 2
                }
            ],
            hard: [
                {
                    image: "https://tse3.mm.bing.net/th/id/OIP.MdwKTsCeC81Mt6HWsT8NHQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
                    options: ["Pilot", "Commander", "Flight Attendant"],
                    correctAnswer: 0,
                    profession: "Pilot",
                    category: "aviation",
                    complexity: 3
                },
                {
                    image: "https://tse4.mm.bing.net/th/id/OIP.PeivQAgqUPUvKdKGxZDsDAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
                    options: ["Scientist", "Researcher", "Chemist"],
                    correctAnswer: 0,
                    profession: "Scientist",
                    category: "science",
                    complexity: 3
                },
                {
                    image: "https://static.vecteezy.com/system/resources/previews/034/344/816/non_2x/rear-view-of-cartoon-man-architect-working-on-construction-project-illustration-vector.jpg",
                    options: ["Architect", "Engineer", "Draftsman"],
                    correctAnswer: 0,
                    profession: "Architect",
                    category: "design",
                    complexity: 3
                },
                {
                    image: "https://tse2.mm.bing.net/th/id/OIP.ACOKrk7PUAT4z7HPG3bLFwHaGe?rs=1&pid=ImgDetMain&o=7&rm=3",
                    options: ["Actor", "Singer", "Comedian"],
                    correctAnswer: 0,
                    profession: "Actor",
                    category: "entertainment",
                    complexity: 3
                },
                {
                    image: "https://img.freepik.com/vector-premium/chibi-contable-personaje-dibujos-animados-hombre-calculadora-mano_161819-1130.jpg",
                    options: ["Accountant", "Auditor", "Economist"],
                    correctAnswer: 0,
                    profession: "Accountant",
                    category: "finance",
                    complexity: 3
                }
            ]
        };
        
        // Initialize stats
        Object.values(this.allQuestions).forEach(questions => {
            questions.forEach(q => {
                this.professionStats[q.profession] = {
                    attempts: 0,
                    correct: 0,
                    category: q.category
                };
            });
        });
        
        this.initializeEventListeners();
        this.loadQuestion();
    }
    
    initializeEventListeners() {
        document.getElementById('checkAnswerBtn').addEventListener('click', () => this.checkAnswer());
        document.getElementById('nextQuestionBtn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('backBtn').addEventListener('click', () => this.goToMainPage());
        document.getElementById('backToMenuBtn').addEventListener('click', () => this.goToMainPage());
    }
    
    selectNextQuestion() {
        const questionsForDifficulty = this.allQuestions[this.difficulty];
        
        const problematicQuestions = questionsForDifficulty.filter(q => {
            const stats = this.professionStats[q.profession];
            return stats && stats.attempts > 0 && stats.correct === 0;
        });
        
        if (problematicQuestions.length > 0 && Math.random() > 0.5) {
            return problematicQuestions[Math.floor(Math.random() * problematicQuestions.length)];
        }
        
        return questionsForDifficulty[Math.floor(Math.random() * questionsForDifficulty.length)];
    }
    
    adjustDifficulty() {
        this.professionScore = (this.score / (this.totalQuestions * 10)) * 100;
        
        if (this.consecutiveCorrect >= 3 && this.professionScore >= 80) {
            if (this.difficulty === 'easy') {
                this.difficulty = 'medium';
                audioManager.speak('Increasing difficulty to medium level', 0.9);
            } else if (this.difficulty === 'medium') {
                this.difficulty = 'hard';
                audioManager.speak('Increasing difficulty to hard level', 0.9);
            }
        }
        else if (this.consecutiveWrong >= 2 || this.professionScore < 50) {
            if (this.difficulty === 'hard') {
                this.difficulty = 'medium';
                audioManager.speak('Reducing difficulty to medium level', 0.9);
            } else if (this.difficulty === 'medium') {
                this.difficulty = 'easy';
                audioManager.speak('Reducing difficulty to easy level', 0.9);
            }
            this.consecutiveWrong = 0;
        }
        
        this.showDifficultyIndicator();
    }
    
    showDifficultyIndicator() {
        const indicator = document.getElementById('difficulty-indicator');
        const levels = {
            easy:   '⭐ Difficulty: EASY (basic professions)',
            medium: '⭐⭐ Difficulty: MEDIUM (complex professions)',
            hard:   '⭐⭐⭐ Difficulty: HARD (specialized professions)'
        };
        
        indicator.textContent = levels[this.difficulty];
        indicator.style.display = 'block';
    }
    
    loadQuestion() {
        this.selectedOption = null;
        this.answered = false;
        
        const currentQuestion = this.selectNextQuestion();
        this.currentQuestionData = currentQuestion;
        
        document.getElementById('questionNumber').textContent = `Question ${this.currentQuestion + 1} of ${this.totalQuestions}`;
        document.getElementById('progressText').textContent = `${this.currentQuestion + 1}/${this.totalQuestions}`;
        document.getElementById('progressFill').style.width = `${((this.currentQuestion + 1) / this.totalQuestions) * 100}%`;
        
        document.getElementById('professionImage').src = currentQuestion.image;
        
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = '';
        
        const shuffledOptions = [...currentQuestion.options].sort(() => Math.random() - 0.5);
        const correctIndex = shuffledOptions.indexOf(currentQuestion.options[currentQuestion.correctAnswer]);
        
        shuffledOptions.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.textContent = option;
            optionElement.dataset.correct = (index === correctIndex) ? 'true' : 'false';
            optionElement.addEventListener('click', () => this.selectOption(index));
            optionsContainer.appendChild(optionElement);
        });
        
        const feedback = document.getElementById('feedback');
        feedback.classList.remove('show', 'correct', 'incorrect');
        document.getElementById('ai-analysis').classList.remove('show');
        
        document.getElementById('checkAnswerBtn').style.display = 'inline-flex';
        document.getElementById('checkAnswerBtn').disabled = false;
        document.getElementById('nextQuestionBtn').style.display = 'none';
        
        this.adjustDifficulty();
        
        audioManager.speak(`Question ${this.currentQuestion + 1}. What is the profession shown in the image?`, 1);
    }
    
    selectOption(index) {
        if (this.answered) return;
        
        document.querySelectorAll('.option').forEach(option => {
            option.classList.remove('selected');
        });
        
        document.querySelectorAll('.option')[index].classList.add('selected');
        this.selectedOption = index;
    }
    
    checkAnswer() {
        if (this.selectedOption === null) {
            this.showFeedback('Please select an option', false);
            audioManager.speak('You must select an option', 0.9);
            return;
        }
        
        this.answered = true;
        
        const options = document.querySelectorAll('.option');
        const correctOptionIndex = Array.from(options).findIndex(o => o.dataset.correct === 'true');
        
        options[correctOptionIndex].classList.add('correct');
        
        const profession = this.currentQuestionData.profession;
        this.professionStats[profession].attempts++;
        
        let isCorrect = false;
        if (this.selectedOption === correctOptionIndex) {
            isCorrect = true;
            this.score += 10;
            this.consecutiveCorrect++;
            this.consecutiveWrong = 0;
            this.professionStats[profession].correct++;
            
            if (!this.masteredProfessions.includes(profession) && 
                this.professionStats[profession].correct >= 1) {
                this.masteredProfessions.push(profession);
            }
            
            this.showFeedback('Correct! Well done!', true);
            audioManager.speak(`Correct. The answer is ${profession}`, 0.95);
        } else {
            options[this.selectedOption].classList.add('incorrect');
            this.consecutiveWrong++;
            this.consecutiveCorrect = 0;
            
            if (!this.problematicProfessions.includes(profession)) {
                this.problematicProfessions.push(profession);
            }
            
            this.showFeedback('Incorrect! Try another option', false);
            audioManager.speak(`Incorrect. The correct answer is ${profession}`, 0.95);
        }
        
        document.getElementById('score').textContent = this.score;
        document.getElementById('checkAnswerBtn').disabled = true;
        
        this.showAIAnalysis();
        
        if (this.currentQuestion < this.totalQuestions - 1) {
            setTimeout(() => {
                document.getElementById('nextQuestionBtn').style.display = 'inline-flex';
            }, 1500);
        } else {
            setTimeout(() => this.endGame(), 2000);
        }
    }
    
    showAIAnalysis() {
        const analysisEl = document.getElementById('ai-analysis');
        const analysisText = document.getElementById('analysis-text');
        
        let analysis = '';
        
        if (this.consecutiveCorrect > 0) {
            analysis += `✅ ${this.consecutiveCorrect} consecutive correct answer(s). `;
        }
        if (this.consecutiveWrong > 0) {
            analysis += `❌ ${this.consecutiveWrong} consecutive error(s). `;
        }
        
        if (this.difficulty === 'hard') {
            analysis += '📈 Level: HARD. ';
        } else if (this.difficulty === 'easy') {
            analysis += '📉 Level: EASY. ';
        } else {
            analysis += '➡️ Level: MEDIUM. ';
        }
        
        analysisText.textContent = analysis || 'Recognition in progress...';
        analysisEl.classList.add('show');
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
        
        const percentage = (this.score / (this.totalQuestions * 10)) * 100;
        let stars = 0;
        let message = '';
        let audioMessage = '';
        
        if (percentage === 100) {
            stars = 3;
            message = 'Perfect! You are a professions expert! 🏆';
            audioMessage = 'Perfect. You are a professions expert';
        } else if (percentage >= 70) {
            stars = 2;
            message = 'Great job! You have a strong understanding of professions! 🌟';
            audioMessage = 'Great job. You have a strong understanding of professions';
        } else if (percentage >= 50) {
            stars = 1;
            message = 'Good try! Keep practicing! 💪';
            audioMessage = 'Good try. Keep practicing';
        } else {
            stars = 0;
            message = "Don't give up! Next time will be better! 📚";
            audioMessage = "Don't give up. Next time will be better";
        }
        
        resultMessage.textContent = message;
        audioManager.speak(`Game completed. Score: ${this.score} points. Percentage: ${percentage.toFixed(0)} percent. ${audioMessage}`, 0.95);
        
        starsContainer.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const star = document.createElement('span');
            star.textContent = i < stars ? '⭐' : '☆';
            starsContainer.appendChild(star);
        }
        
        document.getElementById('reportScore').textContent = percentage.toFixed(0);
        document.getElementById('reportMastered').textContent = this.masteredProfessions.length;
        document.getElementById('reportImprove').textContent = this.problematicProfessions.length > 0 
            ? this.problematicProfessions.slice(0, 2).join(', ') 
            : 'None';
        document.getElementById('reportLevel').textContent = this.difficulty.toUpperCase();
        
        modal.classList.add('show');
    }
    
    restartGame() {
        this.currentQuestion = 0;
        this.score = 0;
        this.selectedOption = null;
        this.answered = false;
        this.difficulty = 'easy';
        this.consecutiveCorrect = 0;
        this.consecutiveWrong = 0;
        this.masteredProfessions = [];
        this.problematicProfessions = [];
        
        document.getElementById('score').textContent = this.score;
        document.getElementById('gameOverModal').classList.remove('show');
        
        this.loadQuestion();
    }
    
    goToMainPage() {
        window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-visual.html';
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AIProfessionsGame();
});