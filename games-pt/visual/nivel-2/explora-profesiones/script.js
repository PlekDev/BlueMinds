// ===== SISTEMA DE IA ADAPTATIVO PARA RECONHECIMENTO DE PROFISSÕES =====
class AIProfessionsGame {
    constructor() {
        this.currentQuestion = 0;
        this.score = 0;
        this.selectedOption = null;
        this.answered = false;

        this.professionScore = 0;
        this.difficulty = 'easy';
        this.consecutiveCorrect = 0;
        this.consecutiveWrong = 0;
        this.totalQuestions = 5;

        this.professionStats = {};
        this.masteredProfessions = [];
        this.problematicProfessions = [];

        this.allQuestions = {
            easy: [
                { image: "https://i.pinimg.com/originals/dd/5f/5d/dd5f5d4cbe0531cd5dc4d5b7204b38a4.png", options: ["Médico", "Engenheiro", "Cozinheiro"], correctAnswer: 0, profession: "Médico", category: "saúde", complexity: 1 },
                { image: "https://tse1.mm.bing.net/th/id/OIP.msPDaNRRUyVPXdHj-pV-pwHaHa?rs=1&pid=ImgDetMain", options: ["Advogado", "Professor", "Piloto"], correctAnswer: 1, profession: "Professor", category: "educação", complexity: 1 },
                { image: "https://static.vecteezy.com/system/resources/previews/002/084/042/original/cute-fire-fighter-holding-wooden-stairs-character-cartoon-icon-illustration-free-vector.jpg", options: ["Bombeiro", "Eletricista", "Músico"], correctAnswer: 0, profession: "Bombeiro", category: "segurança", complexity: 1 },
                { image: "https://img.freepik.com/vector-premium/ilustracion-vectorial-dibujos-animados-chef-cocinando-plato-arroz-frito_1263357-24820.jpg?w=2000", options: ["Cozinheiro", "Garçom", "Piloto"], correctAnswer: 0, profession: "Cozinheiro", category: "gastronomia", complexity: 1 },
                { image: "https://img.freepik.com/vector-premium/profesion-constructor-hombre-estilo-dibujos-animados-plana_180868-418.jpg", options: ["Construtor", "Encanador", "Carpinteiro"], correctAnswer: 0, profession: "Construtor", category: "construção", complexity: 1 }
            ],
            medium: [
                { image: "https://image.freepik.com/vector-gratis/enfermera-personaje-dibujos-animados-lindo_78094-108.jpg", options: ["Advogada", "Médica", "Enfermeira"], correctAnswer: 2, profession: "Enfermeira", category: "saúde", complexity: 2 },
                { image: "https://static.vecteezy.com/system/resources/previews/049/166/524/original/cute-girl-photographer-with-camera-illustration-cartoon-style-free-vector.jpg", options: ["Fotógrafo", "Cinegrafista", "Artista"], correctAnswer: 0, profession: "Fotógrafo", category: "artes", complexity: 2 },
                { image: "https://tse3.mm.bing.net/th/id/OIP.v0OHHvrgQAR3Py8Yn7kxPQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", options: ["Veterinário", "Dentista", "Oftalmologista"], correctAnswer: 1, profession: "Dentista", category: "saúde", complexity: 2 },
                { image: "https://tse3.mm.bing.net/th/id/OIP.gVeGGYgBXKC50q1hUWjCIQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", options: ["Jardineiro", "Fazendeiro", "Paisagista"], correctAnswer: 0, profession: "Jardineiro", category: "natureza", complexity: 2 },
                { image: "https://tse3.mm.bing.net/th/id/OIP.iWlnUosfG4X9bSz_-DkuwAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", options: ["Mecânico", "Engenheiro", "Técnico"], correctAnswer: 0, profession: "Mecânico", category: "mecânica", complexity: 2 }
            ],
            hard: [
                { image: "https://tse3.mm.bing.net/th/id/OIP.MdwKTsCeC81Mt6HWsT8NHQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", options: ["Piloto", "Comandante", "Aeromoça"], correctAnswer: 0, profession: "Piloto", category: "aviação", complexity: 3 },
                { image: "https://tse4.mm.bing.net/th/id/OIP.PeivQAgqUPUvKdKGxZDsDAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", options: ["Cientista", "Pesquisador", "Químico"], correctAnswer: 0, profession: "Cientista", category: "ciência", complexity: 3 },
                { image: "https://static.vecteezy.com/system/resources/previews/034/344/816/non_2x/rear-view-of-cartoon-man-architect-working-on-construction-project-illustration-vector.jpg", options: ["Arquiteto", "Engenheiro", "Desenhista"], correctAnswer: 0, profession: "Arquiteto", category: "design", complexity: 3 },
                { image: "https://tse2.mm.bing.net/th/id/OIP.ACOKrk7PUAT4z7HPG3bLFwHaGe?rs=1&pid=ImgDetMain&o=7&rm=3", options: ["Ator", "Cantor", "Comediante"], correctAnswer: 0, profession: "Ator", category: "espetáculos", complexity: 3 },
                { image: "https://img.freepik.com/vector-premium/chibi-contable-personaje-dibujos-animados-hombre-calculadora-mano_161819-1130.jpg", options: ["Contador", "Auditor", "Economista"], correctAnswer: 0, profession: "Contador", category: "finanças", complexity: 3 }
            ]
        };

        Object.values(this.allQuestions).forEach(questions => {
            questions.forEach(q => {
                this.professionStats[q.profession] = { attempts: 0, correct: 0, category: q.category };
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
            if (this.difficulty === 'easy') { this.difficulty = 'medium'; audioManager.speak('Aumentando dificuldade para nível médio', 0.9); }
            else if (this.difficulty === 'medium') { this.difficulty = 'hard'; audioManager.speak('Aumentando dificuldade para nível difícil', 0.9); }
        } else if (this.consecutiveWrong >= 2 || this.professionScore < 50) {
            if (this.difficulty === 'hard') { this.difficulty = 'medium'; audioManager.speak('Reduzindo dificuldade para nível médio', 0.9); }
            else if (this.difficulty === 'medium') { this.difficulty = 'easy'; audioManager.speak('Reduzindo dificuldade para nível fácil', 0.9); }
            this.consecutiveWrong = 0;
        }
        this.showDifficultyIndicator();
    }

    showDifficultyIndicator() {
        const indicator = document.getElementById('difficulty-indicator');
        const levels = {
            easy: '⭐ Dificuldade: FÁCIL (profissões básicas)',
            medium: '⭐⭐ Dificuldade: MÉDIO (profissões complexas)',
            hard: '⭐⭐⭐ Dificuldade: DIFÍCIL (profissões especializadas)'
        };
        indicator.textContent = levels[this.difficulty];
        indicator.style.display = 'block';
    }

    loadQuestion() {
        this.selectedOption = null;
        this.answered = false;

        const currentQuestion = this.selectNextQuestion();
        this.currentQuestionData = currentQuestion;

        document.getElementById('questionNumber').textContent = `Pergunta ${this.currentQuestion + 1} de ${this.totalQuestions}`;
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
        audioManager.speak(`Pergunta ${this.currentQuestion + 1}. Qual é a profissão mostrada na imagem?`, 1);
    }

    selectOption(index) {
        if (this.answered) return;
        document.querySelectorAll('.option').forEach(option => option.classList.remove('selected'));
        document.querySelectorAll('.option')[index].classList.add('selected');
        this.selectedOption = index;
    }

    checkAnswer() {
        if (this.selectedOption === null) {
            this.showFeedback('Por favor, selecione uma opção', false);
            audioManager.speak('Você deve selecionar uma opção', 0.9);
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
            if (!this.masteredProfessions.includes(profession)) this.masteredProfessions.push(profession);
            this.showFeedback('Correto! Muito bem!', true);
            audioManager.speak(`Correto. A resposta é ${profession}`, 0.95);
        } else {
            options[this.selectedOption].classList.add('incorrect');
            this.consecutiveWrong++;
            this.consecutiveCorrect = 0;
            if (!this.problematicProfessions.includes(profession)) this.problematicProfessions.push(profession);
            this.showFeedback('Incorreto! Tente com outra opção', false);
            audioManager.speak(`Incorreto. A resposta correta é ${profession}`, 0.95);
        }

        document.getElementById('score').textContent = this.score;
        document.getElementById('checkAnswerBtn').disabled = true;
        this.showAIAnalysis();

        if (this.currentQuestion < this.totalQuestions - 1) {
            setTimeout(() => { document.getElementById('nextQuestionBtn').style.display = 'inline-flex'; }, 1500);
        } else {
            setTimeout(() => this.endGame(), 2000);
        }
    }

    showAIAnalysis() {
        const analysisEl = document.getElementById('ai-analysis');
        const analysisText = document.getElementById('analysis-text');
        let analysis = '';
        if (this.consecutiveCorrect > 0) analysis += `✅ ${this.consecutiveCorrect} acerto(s) seguido(s). `;
        if (this.consecutiveWrong > 0) analysis += `❌ ${this.consecutiveWrong} erro(s) seguido(s). `;
        if (this.difficulty === 'hard') analysis += '📈 Nível: DIFÍCIL. ';
        else if (this.difficulty === 'easy') analysis += '📉 Nível: FÁCIL. ';
        else analysis += '➡️ Nível: MÉDIO. ';
        analysisText.textContent = analysis || 'Reconhecimento em desenvolvimento...';
        analysisEl.classList.add('show');
    }

    showFeedback(message, isCorrect) {
        const feedback = document.getElementById('feedback');
        document.getElementById('feedbackText').textContent = message;
        document.getElementById('feedbackIcon').textContent = isCorrect ? '✓' : '✗';
        feedback.classList.remove('correct', 'incorrect');
        feedback.classList.add(isCorrect ? 'correct' : 'incorrect', 'show');
    }

    nextQuestion() { this.currentQuestion++; this.loadQuestion(); }

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

        if (percentage === 100) { stars = 3; message = 'Perfeito! Você é um especialista em profissões! 🏆'; audioMessage = 'Perfeito. Você é um especialista em profissões'; }
        else if (percentage >= 70) { stars = 2; message = 'Muito bem! Você tem boa compreensão de profissões! 🌟'; audioMessage = 'Muito bem. Você tem boa compreensão de profissões'; }
        else if (percentage >= 50) { stars = 1; message = 'Boa tentativa! Continue praticando! 💪'; audioMessage = 'Boa tentativa. Continue praticando'; }
        else { stars = 0; message = 'Não desista! Da próxima vez vai ser melhor! 📚'; audioMessage = 'Não desista. Da próxima vez vai ser melhor'; }

        resultMessage.textContent = message;
        audioManager.speak(`Jogo concluído. Pontuação: ${this.score} pontos. Porcentagem: ${percentage.toFixed(0)} por cento. ${audioMessage}`, 0.95);

        starsContainer.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const star = document.createElement('span');
            star.textContent = i < stars ? '⭐' : '☆';
            starsContainer.appendChild(star);
        }

        document.getElementById('reportScore').textContent = percentage.toFixed(0);
        document.getElementById('reportMastered').textContent = this.masteredProfessions.length;
        document.getElementById('reportImprove').textContent = this.problematicProfessions.length > 0 ? this.problematicProfessions.slice(0, 2).join(', ') : 'Nenhuma';
        document.getElementById('reportLevel').textContent = this.difficulty.toUpperCase();

        modal.classList.add('show');
    }

    restartGame() {
        this.currentQuestion = 0; this.score = 0; this.selectedOption = null;
        this.answered = false; this.difficulty = 'easy';
        this.consecutiveCorrect = 0; this.consecutiveWrong = 0;
        this.masteredProfessions = []; this.problematicProfessions = [];
        document.getElementById('score').textContent = this.score;
        document.getElementById('gameOverModal').classList.remove('show');
        this.loadQuestion();
    }

    goToMainPage() { window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-visual.html'; }
}

document.addEventListener('DOMContentLoaded', () => { new AIProfessionsGame(); });