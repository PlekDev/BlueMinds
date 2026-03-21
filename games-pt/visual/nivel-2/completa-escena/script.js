// ===== SISTEMA DE IA ADAPTATIVO PARA CATEGORIZAÇÃO VISUAL-VERBAL =====
class AISceneGame {
    constructor() {
        this.currentRound = 0;
        this.score = 0;
        this.currentScene = null;
        this.selectedOption = null;
        this.showFeedback = false;

        this.categorizationScore = 0;
        this.difficulty = 'easy';
        this.consecutiveCorrect = 0;
        this.consecutiveWrong = 0;

        this.errorAnalysis = { visualErrors: 0, semanticErrors: 0, distractorsSelected: {}, preferredCategories: {} };
        this.sceneStats = {};

        this.allScenes = {
            easy: [
                { sentence: "O pássaro está no", options: ["🍅", "🪺", "🌊"], correct: "🪺", correctText: "ninho", category: "animais", complexity: 1 },
                { sentence: "O peixe vive na", options: ["🌳", "🌊", "🏠"], correct: "🌊", correctText: "água", category: "animais", complexity: 1 },
                { sentence: "O gato come", options: ["🐟", "🌽", "🥕"], correct: "🐟", correctText: "peixe", category: "animais", complexity: 1 },
                { sentence: "A flor está no", options: ["🌳", "🌐", "💻"], correct: "🌳", correctText: "jardim", category: "natureza", complexity: 1 },
                { sentence: "O menino brinca com a", options: ["🦃", "⚽", "🪱"], correct: "⚽", correctText: "bola", category: "brinquedos", complexity: 1 }
            ],
            medium: [
                { sentence: "O professor ensina na", options: ["🛒", "🏫", "🪸"], correct: "🏫", correctText: "escola", category: "lugares", complexity: 2 },
                { sentence: "O médico trabalha no", options: ["🪸", "🏥", "🪄"], correct: "🏥", correctText: "hospital", category: "lugares", complexity: 2 },
                { sentence: "A abelha voa entre as", options: ["😭", "🌻", "🏢"], correct: "🌻", correctText: "flores", category: "natureza", complexity: 2 },
                { sentence: "A borboleta precisa de", options: ["👻", "🔥", "🌻"], correct: "🌻", correctText: "flores", category: "natureza", complexity: 2 },
                { sentence: "O cachorro brinca com a", options: ["🛹", "🦺", "🥎"], correct: "🥎", correctText: "bola", category: "lugares", complexity: 2 }
            ],
            hard: [
                { sentence: "O pintor usa o", options: ["🎨", "👽", "⚽"], correct: "🎨", correctText: "pincel", category: "profissões", complexity: 3 },
                { sentence: "A dentista examina os", options: ["👂", "👁️", "🦷"], correct: "🦷", correctText: "dentes", category: "profissões", complexity: 3 },
                { sentence: "O cozinheiro prepara a", options: ["🍕", "📚", "🚗"], correct: "🍕", correctText: "comida", category: "profissões", complexity: 3 },
                { sentence: "A fazendeira cultiva no", options: ["🏙️", "🌾", "🏢"], correct: "🌾", correctText: "campo", category: "lugares", complexity: 3 }
            ]
        };

        this.totalRounds = 5;
        Object.values(this.allScenes).forEach(scenes => {
            scenes.forEach(scene => {
                this.sceneStats[scene.sentence] = { attempts: 0, correct: 0, errorType: null };
            });
        });
    }

    analyzeError(selectedOption, correctOption, sceneCategory) {
        let errorType = 'semantic';
        const visualSimilarPairs = [['🌳', '🌲'], ['🏠', '🏡'], ['🐕', '🐶']];
        if (visualSimilarPairs.some(pair => pair.includes(selectedOption))) {
            this.errorAnalysis.visualErrors++;
            errorType = 'visual';
        } else {
            this.errorAnalysis.semanticErrors++;
        }
        if (!this.errorAnalysis.distractorsSelected[selectedOption]) {
            this.errorAnalysis.distractorsSelected[selectedOption] = 0;
        }
        this.errorAnalysis.distractorsSelected[selectedOption]++;
        return errorType;
    }

    calculateCategorizationScore() {
        const totalAttempts = this.currentRound + 1;
        const correctCount = Math.floor(this.score / 20);
        this.categorizationScore = (correctCount / totalAttempts) * 100;
        return this.categorizationScore;
    }

    adjustDifficulty() {
        this.calculateCategorizationScore();
        if (this.consecutiveCorrect >= 3 && this.categorizationScore >= 75) {
            if (this.difficulty === 'easy') { this.difficulty = 'medium'; audioManager.speak('Aumentando dificuldade para nível médio', 0.9); }
            else if (this.difficulty === 'medium') { this.difficulty = 'hard'; audioManager.speak('Aumentando dificuldade para nível difícil', 0.9); }
        } else if (this.consecutiveWrong >= 2 || this.categorizationScore < 50) {
            if (this.difficulty === 'hard') { this.difficulty = 'medium'; audioManager.speak('Reduzindo dificuldade para nível médio', 0.9); }
            else if (this.difficulty === 'medium') { this.difficulty = 'easy'; audioManager.speak('Reduzindo dificuldade para nível fácil', 0.9); }
            this.consecutiveWrong = 0;
        }
        this.showDifficultyIndicator();
    }

    showDifficultyIndicator() {
        const indicator = document.getElementById('difficulty-indicator');
        const levels = {
            easy: '⭐ Dificuldade: FÁCIL (3 opções simples)',
            medium: '⭐⭐ Dificuldade: MÉDIO (3 opções complexas)',
            hard: '⭐⭐⭐ Dificuldade: DIFÍCIL (conceitos abstratos)'
        };
        indicator.textContent = levels[this.difficulty];
        indicator.style.display = 'block';
    }

    selectNextScene() {
        const scenesForDifficulty = this.allScenes[this.difficulty];
        const errorProneScenes = scenesForDifficulty.filter(scene => {
            const stats = this.sceneStats[scene.sentence];
            return stats && stats.attempts > 0 && stats.correct === 0;
        });
        if (errorProneScenes.length > 0 && Math.random() > 0.4) {
            return errorProneScenes[Math.floor(Math.random() * errorProneScenes.length)];
        }
        return scenesForDifficulty[Math.floor(Math.random() * scenesForDifficulty.length)];
    }

    showHint() {
        if (this.consecutiveWrong >= 1) {
            const hintBox = document.getElementById('hint-box');
            const hintText = `💡 Dica: Pense na categoria "${this.currentScene.category}"`;
            hintBox.textContent = hintText;
            hintBox.style.display = 'block';
            audioManager.speak(`Dica: Pense na categoria ${this.currentScene.category}`, 0.9);
        } else {
            document.getElementById('hint-box').style.display = 'none';
        }
    }

    startNewRound() {
        this.currentScene = this.selectNextScene();
        this.selectedOption = null;
        this.showFeedback = false;
        this.updateUI();
        this.showHint();
        audioManager.speak(`Rodada ${this.currentRound + 1}. Complete: ${this.currentScene.sentence}`, 1);
    }

    updateUI() {
        document.getElementById('current-round').textContent = this.currentRound + 1;
        document.getElementById('total-rounds').textContent = this.totalRounds;
        document.getElementById('score').textContent = this.score + ' pontos';
        document.getElementById('score-display').textContent = this.score + ' pontos';

        const progress = ((this.currentRound + 1) / this.totalRounds) * 100;
        document.getElementById('progress-fill').style.width = progress + '%';

        const sentenceDisplay = document.getElementById('sentence-display');
        sentenceDisplay.innerHTML = this.currentScene.sentence + ' <span class="blank-space">?</span>';

        const optionsDisplay = document.getElementById('options-display');
        optionsDisplay.innerHTML = '';

        const shuffledOptions = [...this.currentScene.options].sort(() => Math.random() - 0.5);
        shuffledOptions.forEach(option => {
            const button = document.createElement('div');
            button.className = 'option-image';
            button.textContent = option;
            if (this.selectedOption === option) button.classList.add('selected');
            button.onclick = () => this.selectOption(option);
            optionsDisplay.appendChild(button);
        });

        document.getElementById('feedback').classList.remove('show');
        document.getElementById('ai-analysis').classList.remove('show');
    }

    selectOption(option) { this.selectedOption = option; this.updateUI(); }
    resetAnswer() { this.selectedOption = null; this.updateUI(); }

    checkAnswer() {
        if (!this.selectedOption) {
            const feedbackElement = document.getElementById('feedback');
            feedbackElement.textContent = 'Você deve selecionar uma opção';
            feedbackElement.className = 'feedback incorrect show';
            audioManager.speak('Você deve selecionar uma opção', 0.9);
            return;
        }

        const isCorrect = this.selectedOption === this.currentScene.correct;
        const feedbackElement = document.getElementById('feedback');
        const feedbackText = document.getElementById('feedback-text');
        const sceneKey = this.currentScene.sentence;
        this.sceneStats[sceneKey].attempts++;

        if (isCorrect) {
            this.score += 20;
            this.consecutiveCorrect++;
            this.consecutiveWrong = 0;
            this.sceneStats[sceneKey].correct++;
            if (!this.errorAnalysis.preferredCategories[this.currentScene.category]) {
                this.errorAnalysis.preferredCategories[this.currentScene.category] = 0;
            }
            this.errorAnalysis.preferredCategories[this.currentScene.category]++;
            feedbackText.textContent = `Correto! Era "${this.currentScene.correctText}" 🎉`;
            feedbackElement.className = 'feedback correct show';
            audioManager.speak(`Correto! A resposta correta é ${this.currentScene.correctText}`, 0.95);
        } else {
            const errorType = this.analyzeError(this.selectedOption, this.currentScene.correct, this.currentScene.category);
            this.consecutiveWrong++;
            this.consecutiveCorrect = 0;
            this.sceneStats[sceneKey].errorType = errorType;
            feedbackText.textContent = `Não foi dessa vez. Era "${this.currentScene.correctText}" 😊`;
            feedbackElement.className = 'feedback incorrect show';
            audioManager.speak(`Não está correto. A resposta correta é ${this.currentScene.correctText}`, 0.95);
        }

        document.getElementById('score').textContent = this.score + ' pontos';
        document.getElementById('score-display').textContent = this.score + ' pontos';

        this.adjustDifficulty();
        this.showAIAnalysis();

        setTimeout(() => {
            if (this.currentRound + 1 >= this.totalRounds) this.completeGame();
            else { this.currentRound++; this.startNewRound(); }
        }, 2500);
    }

    showAIAnalysis() {
        const analysisEl = document.getElementById('ai-analysis');
        const analysisText = document.getElementById('analysis-text');
        let analysis = '';
        if (this.errorAnalysis.visualErrors > 0) analysis += `👁️ Erros visuais detectados: ${this.errorAnalysis.visualErrors}. `;
        if (this.consecutiveCorrect > 0) analysis += `✅ ${this.consecutiveCorrect} acerto(s) consecutivo(s). `;
        if (this.consecutiveWrong > 0) analysis += `❌ ${this.consecutiveWrong} erro(s) consecutivo(s). `;
        if (this.difficulty === 'hard') analysis += '📈 Nível: DIFÍCIL (conceitos avançados). ';
        else if (this.difficulty === 'easy') analysis += '📉 Nível: FÁCIL (conceitos básicos). ';
        else analysis += '➡️ Nível: MÉDIO (conceitos intermediários). ';
        analysisText.textContent = analysis || 'Categorização em desenvolvimento...';
        analysisEl.classList.add('show');
    }

    completeGame() {
        const gameCard = document.querySelector('.game-card');
        const avgAccuracy = ((this.score / (this.totalRounds * 20)) * 100).toFixed(1);
        const finalScore = this.calculateCategorizationScore().toFixed(0);

        let favoriteCategory = 'Geral';
        let maxAttempts = 0;
        for (const [category, count] of Object.entries(this.errorAnalysis.preferredCategories)) {
            if (count > maxAttempts) { maxAttempts = count; favoriteCategory = category; }
        }

        let performanceMessage = 'Excelente categorização visual! 🏆';
        if (avgAccuracy < 60) performanceMessage = 'Continue praticando! A categorização vai melhorar. 💪';
        else if (avgAccuracy < 80) performanceMessage = 'Muito bom trabalho! Você entende bem as categorias. 🌟';

        audioManager.speak(`Jogo concluído. Pontuação: ${this.score} pontos. Precisão: ${avgAccuracy} por cento. ${performanceMessage}`, 0.95);

        gameCard.innerHTML = `
            <h2>Jogo Concluído!</h2>
            <div style="font-size: 80px; margin: 30px 0;">🎉</div>
            <div style="background: linear-gradient(135deg, #0066CC 0%, #0099FF 100%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <div style="font-size: 24px; font-weight: 700; margin-bottom: 10px;">Sua pontuação final: ${this.score} pontos</div>
                <div style="font-size: 18px; opacity: 0.9;">Precisão: ${avgAccuracy}%</div>
            </div>
            <div style="background: rgba(0, 102, 204, 0.1); border-left: 4px solid #0066CC; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left; color: #1F2937; font-size: 14px;">
                <strong>📊 Análise Final de IA - Categorização Visual-Verbal:</strong>
                <div style="margin-top: 10px; line-height: 1.8;">
                    <div>✓ Pontuação de categorização: ${finalScore}%</div>
                    <div>✓ Erros visuais: ${this.errorAnalysis.visualErrors}</div>
                    <div>✓ Erros semânticos: ${this.errorAnalysis.semanticErrors}</div>
                    <div>✓ Categoria favorita: ${favoriteCategory}</div>
                    <div>✓ Nível final: ${this.difficulty.toUpperCase()}</div>
                </div>
            </div>
            <div style="color: var(--primary-blue); font-size: 18px; font-weight: 600; margin: 15px 0;">${performanceMessage}</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px;">
                <button style="background: linear-gradient(135deg, #0066CC 0%, #0099FF 100%); color: white; padding: 15px; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer;" onclick="location.reload()">Jogar Novamente</button>
                <button style="background-color: #00B4D8; color: white; padding: 15px; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer;" onclick="goToMainPage()">Voltar ao Menu</button>
            </div>
        `;
        document.getElementById('ai-analysis').classList.remove('show');
    }
}

const game = new AISceneGame();
document.addEventListener('DOMContentLoaded', () => { game.startNewRound(); });
function selectOption(option) { game.selectOption(option); }
function resetAnswer() { game.resetAnswer(); }
function checkAnswer() { game.checkAnswer(); }
function goToMainPage() { window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-visual.html'; }