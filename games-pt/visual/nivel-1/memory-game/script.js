// ===== SISTEMA DE IA ADAPTATIVO PARA MEMÓRIA DE PADRÕES =====
class AIMemoryGame {
    constructor() {
        this.sequence = [];
        this.playerSequence = [];
        this.isShowingSequence = false;
        this.currentLevel = 1;
        this.score = 0;
        this.highlightedColor = null;

        this.memoryScore = 0;
        this.difficulty = 'easy';
        this.consecutiveCorrect = 0;
        this.consecutiveWrong = 0;
        this.sequenceSpeed = 800;
        this.reactionTime = 0;

        this.synth = window.speechSynthesis;
        this.audioEnabled = true;

        this.errorPattern = {
            firstError: false,
            repeatableErrors: 0,
            speedErrors: 0
        };

        this.colors = ["🔴", "🔵", "🟢", "🟡", "🟣", "🟠"];
        this.maxLevel = 5;

        this.difficultyConfig = {
            easy: { initialLength: 2, speed: 900, increment: 0.5 },
            medium: { initialLength: 3, speed: 700, increment: 1 },
            hard: { initialLength: 4, speed: 500, increment: 1.5 }
        };
        this.activeTimeouts = [];
    }

    speak(text) {
        if (!this.audioEnabled || !this.synth) return;
        this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 1;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        this.synth.speak(utterance);
    }

    startNewLevel() {
        const config = this.difficultyConfig[this.difficulty];
        let sequenceLength = Math.min(config.initialLength + Math.floor(this.currentLevel * config.increment), 8);

        this.sequence = [];
        for (let i = 0; i < sequenceLength; i++) {
            this.sequence.push(this.colors[Math.floor(Math.random() * this.colors.length)]);
        }

        this.playerSequence = [];
        this.updateUI();

        setTimeout(() => {
            this.speak('Siga o padrão que você vê a seguir.');
            setTimeout(() => { this.showSequence(); }, 2500);
        }, 500);
    }

    async showSequence() {
        this.isShowingSequence = true;
        document.getElementById('status-message').textContent = '👀 Veja a sequência!';

        for (let i = 0; i < this.sequence.length; i++) {
            await this.delay(this.sequenceSpeed);
            this.highlightColor(this.sequence[i]);
            await this.delay(600);
            this.unhighlightColor();
        }

        this.isShowingSequence = false;
        document.getElementById('status-message').textContent = '🎮 Sua vez! Repita a sequência';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    highlightColor(color) {
        this.highlightedColor = color;
        const button = document.querySelector(`[data-color="${color}"]`);
        if (button) button.classList.add('highlighted');
    }

    unhighlightColor() {
        if (this.highlightedColor) {
            const button = document.querySelector(`[data-color="${this.highlightedColor}"]`);
            if (button) button.classList.remove('highlighted');
            this.highlightedColor = null;
        }
    }

    handleColorClick(color) {
        if (this.isShowingSequence) return;

        this.playerSequence.push(color);
        this.highlightColor(color);
        setTimeout(() => this.unhighlightColor(), 300);

        const isCorrect = this.sequence[this.playerSequence.length - 1] === color;
        if (!isCorrect) {
            this.handleError();
            return;
        }

        if (this.playerSequence.length === this.sequence.length) {
            this.handleLevelComplete();
        }

        this.updateUI();
    }

    handleError() {
        this.consecutiveWrong++;
        this.consecutiveCorrect = 0;
        this.errorPattern.speedErrors++;

        const feedbackElement = document.getElementById('feedback');
        feedbackElement.textContent = 'Ops! Tente novamente 😊';
        feedbackElement.className = 'feedback incorrect';

        this.speak('Ops! Esse não era o padrão correto. Tente novamente.');
        this.score = Math.max(0, this.score - 5);
        this.adjustDifficulty();
        this.showAIAnalysis();

        setTimeout(() => { this.startNewLevel(); }, 2000);
    }

    handleLevelComplete() {
        this.consecutiveCorrect++;
        this.consecutiveWrong = 0;

        const levelScore = this.currentLevel * 20;
        this.score += levelScore;

        const feedbackElement = document.getElementById('feedback');
        feedbackElement.textContent = 'Excelente! 🎉';
        feedbackElement.className = 'feedback correct';

        this.speak('Excelente! Você completou este nível corretamente.');
        this.adjustDifficulty();
        this.showAIAnalysis();

        setTimeout(() => {
            if (this.currentLevel >= this.maxLevel) {
                this.completeGame();
            } else {
                this.currentLevel++;
                this.startNewLevel();
            }
        }, 1500);
    }

    adjustDifficulty() {
        this.memoryScore = (this.score / (this.currentLevel * 20)) * 100;

        if (this.consecutiveCorrect >= 3 && this.memoryScore >= 80) {
            if (this.difficulty === 'easy') {
                this.difficulty = 'medium';
                this.sequenceSpeed = this.difficultyConfig.medium.speed;
            } else if (this.difficulty === 'medium') {
                this.difficulty = 'hard';
                this.sequenceSpeed = this.difficultyConfig.hard.speed;
            }
        } else if (this.consecutiveWrong >= 2 || this.memoryScore < 50) {
            if (this.difficulty === 'hard') {
                this.difficulty = 'medium';
                this.sequenceSpeed = this.difficultyConfig.medium.speed;
            } else if (this.difficulty === 'medium') {
                this.difficulty = 'easy';
                this.sequenceSpeed = this.difficultyConfig.easy.speed;
            }
            this.consecutiveWrong = 0;
        }

        this.showDifficultyIndicator();
    }

    showDifficultyIndicator() {
        const indicator = document.getElementById('difficulty-indicator');
        const levels = {
            easy: '⭐ Dificuldade: FÁCIL (sequências curtas e lentas)',
            medium: '⭐⭐ Dificuldade: MÉDIO (sequências médias e rápidas)',
            hard: '⭐⭐⭐ Dificuldade: DIFÍCIL (sequências longas e muito rápidas)'
        };
        indicator.textContent = levels[this.difficulty];
        indicator.style.display = 'block';
    }

    showAIAnalysis() {
        const analysisEl = document.getElementById('ai-analysis');
        const analysisText = document.getElementById('analysis-text');
        let analysis = '';

        if (this.sequenceSpeed < 600) analysis += '⚡ Sequência muito rápida. ';
        else if (this.sequenceSpeed > 800) analysis += '🐢 Sequência lenta para praticar. ';

        if (this.consecutiveCorrect > 0) analysis += `✅ ${this.consecutiveCorrect} acerto(s) seguido(s). `;
        if (this.consecutiveWrong > 0) analysis += `❌ ${this.consecutiveWrong} erro(s) seguido(s). `;

        if (this.difficulty === 'hard') analysis += '📈 Nível: DIFÍCIL. ';
        else if (this.difficulty === 'easy') analysis += '📉 Nível: FÁCIL. ';
        else analysis += '➡️ Nível: MÉDIO. ';

        analysisText.textContent = analysis || 'Memória em desenvolvimento...';
        analysisEl.classList.add('show');
    }

    updateUI() {
        document.getElementById('current-level').textContent = this.currentLevel;
        document.getElementById('max-level').textContent = this.maxLevel;
        document.getElementById('score').textContent = this.score + ' pontos';
        document.getElementById('score-display').textContent = this.score + ' pontos';

        const progress = (this.currentLevel / this.maxLevel) * 100;
        document.getElementById('progress-fill').style.width = progress + '%';
        document.getElementById('sequence-progress').textContent = this.playerSequence.length;
        document.getElementById('sequence-length').textContent = this.sequence.length;
    }

    completeGame() {
        const gameCard = document.querySelector('.status-card');
        const avgAccuracy = ((this.score / (this.maxLevel * 20)) * 100).toFixed(1);

        let performanceMessage = 'Memória excepcional! 🏆';
        let audioMessage = 'Parabéns! Você completou o jogo com memória excepcional.';

        if (avgAccuracy < 60) {
            performanceMessage = 'Continue praticando! Sua memória vai melhorar. 💪';
            audioMessage = 'Jogo concluído. Continue praticando para melhorar sua memória.';
        } else if (avgAccuracy < 80) {
            performanceMessage = 'Muito bom trabalho! Sua memória está se desenvolvendo. 🌟';
            audioMessage = 'Muito bom trabalho! Sua memória está melhorando constantemente.';
        }

        this.speak(audioMessage);

        gameCard.innerHTML = `
            <div class="status-message">Jogo Concluído!</div>
            <div style="background: linear-gradient(135deg, #0066CC 0%, #0099FF 100%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0; font-size: 24px; font-weight: 700;">
                Sua pontuação final: ${this.score} pontos
            </div>
            <div style="background: rgba(0, 102, 204, 0.1); border-left: 4px solid #0066CC; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left; color: #1F2937; font-size: 14px;">
                <strong>📊 Análise Final de IA - Memória de Padrões:</strong>
                <div style="margin-top: 10px; line-height: 1.8;">
                    <div>✓ Precisão: ${avgAccuracy}%</div>
                    <div>✓ Pontuação de memória: ${this.memoryScore.toFixed(0)}%</div>
                    <div>✓ Nível final alcançado: ${this.difficulty.toUpperCase()}</div>
                    <div>✓ Velocidade de resposta: ${this.sequenceSpeed}ms</div>
                </div>
            </div>
            <div style="color: var(--primary-blue); font-size: 18px; font-weight: 600; margin: 15px 0;">${performanceMessage}</div>
        `;

        const colorCard = document.querySelector('.color-card');
        colorCard.innerHTML = `
            <div class="options-container">
                <button class="option-button primary" onclick="location.reload()">Jogar Novamente</button>
                <button class="option-button blue" onclick="goToMainPage()">Voltar ao Menu</button>
            </div>
        `;

        document.getElementById('ai-analysis').classList.remove('show');
    }
}

const game = new AIMemoryGame();

document.addEventListener('DOMContentLoaded', () => {
    game.startNewLevel();
});

function handleColorClick(color) {
    game.handleColorClick(color);
}

function goToMainPage() {
    window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-visual.html';
}