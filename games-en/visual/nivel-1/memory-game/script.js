// ===== ADAPTIVE AI SYSTEM FOR PATTERN MEMORY =====
class AIMemoryGame {
    constructor() {
        this.sequence = [];
        this.playerSequence = [];
        this.isShowingSequence = false;
        this.currentLevel = 1;
        this.score = 0;
        this.highlightedColor = null;
        
        // AI parameters
        this.memoryScore = 0;
        this.difficulty = 'easy';
        this.consecutiveCorrect = 0;
        this.consecutiveWrong = 0;
        this.sequenceSpeed = 800; // milliseconds between colors
        this.reactionTime = 0;
        
        // Audio
        this.synth = window.speechSynthesis;
        this.audioEnabled = true;
        
        // Error analysis
        this.errorPattern = {
            firstError: false,
            repeatableErrors: 0,
            speedErrors: 0
        };
        
        this.colors = ["🔴", "🔵", "🟢", "🟡", "🟣", "🟠"];
        this.maxLevel = 5;
        
        // Difficulty levels
        this.difficultyConfig = {
            easy:   { initialLength: 2, speed: 900, increment: 0.5 },
            medium: { initialLength: 3, speed: 700, increment: 1 },
            hard:   { initialLength: 4, speed: 500, increment: 1.5 }
        };
        this.activeTimeouts = [];
    }

    // ===== SPEECH SYNTHESIS =====
    speak(text) {
        if (!this.audioEnabled || !this.synth) return;
        
        this.synth.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        this.synth.speak(utterance);
    }

    // ===== GAME START =====
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
            this.speak(`Follow the pattern shown below.`);
            setTimeout(() => {
                this.showSequence();
            }, 2500);
        }, 500);
    }

    // ===== SHOW COLOR SEQUENCE =====
    async showSequence() {
        this.isShowingSequence = true;
        document.getElementById('status-message').textContent = '👀 Watch the sequence!';
        
        for (let i = 0; i < this.sequence.length; i++) {
            await this.delay(this.sequenceSpeed);
            this.highlightColor(this.sequence[i]);
            await this.delay(600);
            this.unhighlightColor();
        }
        
        this.isShowingSequence = false;
        document.getElementById('status-message').textContent = '🎮 Your turn! Repeat the sequence';
    }

    // ===== UTILITIES =====
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    highlightColor(color) {
        this.highlightedColor = color;
        const button = document.querySelector(`[data-color="${color}"]`);
        if (button) {
            button.classList.add('highlighted');
        }
    }

    unhighlightColor() {
        if (this.highlightedColor) {
            const button = document.querySelector(`[data-color="${this.highlightedColor}"]`);
            if (button) {
                button.classList.remove('highlighted');
            }
            this.highlightedColor = null;
        }
    }

    // ===== CLICK HANDLING =====
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

    // ===== ERROR HANDLING =====
    handleError() {
        this.consecutiveWrong++;
        this.consecutiveCorrect = 0;
        this.errorPattern.speedErrors++;
        
        const feedbackElement = document.getElementById('feedback');
        feedbackElement.textContent = 'Oops! Try again 😊';
        feedbackElement.className = 'feedback incorrect';
        
        this.speak('Oops! That was not the correct pattern. Try again.');
        
        this.score = Math.max(0, this.score - 5);
        this.adjustDifficulty();
        this.showAIAnalysis();
        
        setTimeout(() => {
            this.startNewLevel();
        }, 2000);
    }

    // ===== LEVEL COMPLETE =====
    handleLevelComplete() {
        this.consecutiveCorrect++;
        this.consecutiveWrong = 0;
        
        const levelScore = this.currentLevel * 20;
        this.score += levelScore;
        
        const feedbackElement = document.getElementById('feedback');
        feedbackElement.textContent = 'Excellent! 🎉';
        feedbackElement.className = 'feedback correct';
        
        this.speak('Excellent! You completed this level correctly.');
        
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

    // ===== DIFFICULTY ADJUSTMENT =====
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
        }
        else if (this.consecutiveWrong >= 2 || this.memoryScore < 50) {
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
            easy:   '⭐ Difficulty: EASY (short and slow sequences)',
            medium: '⭐⭐ Difficulty: MEDIUM (medium and faster sequences)',
            hard:   '⭐⭐⭐ Difficulty: HARD (long and very fast sequences)'
        };

        indicator.textContent = levels[this.difficulty];
        indicator.style.display = 'block';
    }

    // ===== REAL-TIME AI ANALYSIS =====
    showAIAnalysis() {
        const analysisEl = document.getElementById('ai-analysis');
        const analysisText = document.getElementById('analysis-text');
        
        let analysis = '';

        if (this.sequenceSpeed < 600) {
            analysis += '⚡ Very fast sequence. ';
        } else if (this.sequenceSpeed > 800) {
            analysis += '🐢 Slow sequence for practice. ';
        }

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

        analysisText.textContent = analysis || 'Memory in development...';
        analysisEl.classList.add('show');
    }

    // ===== UPDATE UI =====
    updateUI() {
        document.getElementById('current-level').textContent = this.currentLevel;
        document.getElementById('max-level').textContent = this.maxLevel;
        document.getElementById('score').textContent = this.score + ' points';
        document.getElementById('score-display').textContent = this.score + ' points';

        const progress = (this.currentLevel / this.maxLevel) * 100;
        document.getElementById('progress-fill').style.width = progress + '%';

        document.getElementById('sequence-progress').textContent = this.playerSequence.length;
        document.getElementById('sequence-length').textContent = this.sequence.length;
    }

    // ===== GAME COMPLETE =====
    async completeGame() {

        const gameData = {
            gameId: 'pattern-memory-1',
            style: 'visual',
            level: this.difficulty === 'hard' ? 3 : (this.difficulty === 'medium' ? 2 : 1),
            score: this.score,
            accuracy: parseFloat(((this.score / (this.maxLevel * 20)) * 100).toFixed(1)),
            responseTime: this.sequenceSpeed
        };
        try {
            await api.saveGameResults(gameData);
        } catch (e) {
            console.error("Could not save progress:", e);
        }

        const gameCard = document.querySelector('.status-card');
        const avgAccuracy = ((this.score / (this.maxLevel * 20)) * 100).toFixed(1);
        
        let performanceMessage = 'Exceptional memory! 🏆';
        let audioMessage = 'Congratulations! You completed the game with exceptional memory.';
        
        if (avgAccuracy < 60) {
            performanceMessage = 'Keep practicing! Your memory will improve. 💪';
            audioMessage = 'Game completed. Keep practicing to improve your memory.';
        } else if (avgAccuracy < 80) {
            performanceMessage = 'Great work! Your memory is developing well. 🌟';
            audioMessage = 'Great work! Your memory is steadily improving.';
        }

        this.speak(audioMessage);

        gameCard.innerHTML = `
            <div class="status-message">
                Game Completed!
            </div>
            
            <div style="background: linear-gradient(135deg, #0066CC 0%, #0099FF 100%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0; font-size: 24px; font-weight: 700;">
                Your final score: ${this.score} points
            </div>

            <div style="background: rgba(0, 102, 204, 0.1); border-left: 4px solid #0066CC; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left; color: #1F2937; font-size: 14px;">
                <strong>📊 Final AI Analysis - Pattern Memory:</strong>
                <div style="margin-top: 10px; line-height: 1.8;">
                    <div>✓ Accuracy: ${avgAccuracy}%</div>
                    <div>✓ Memory score: ${this.memoryScore.toFixed(0)}%</div>
                    <div>✓ Final level reached: ${this.difficulty.toUpperCase()}</div>
                    <div>✓ Response speed: ${this.sequenceSpeed}ms</div>
                </div>
            </div>

            <div style="color: var(--primary-blue); font-size: 18px; font-weight: 600; margin: 15px 0;">
                ${performanceMessage}
            </div>
        `;

        const colorCard = document.querySelector('.color-card');
        colorCard.innerHTML = `
            <div class="options-container">
                <button class="option-button primary" onclick="location.reload()">
                    Play Again
                </button>
                <button class="option-button blue" onclick="goToMainPage()">
                    Back to Menu
                </button>
            </div>
        `;

        document.getElementById('ai-analysis').classList.remove('show');
    }
}

// ===== INITIALIZATION =====
const game = new AIMemoryGame();

document.addEventListener('DOMContentLoaded', () => {
    game.startNewLevel();
});

// ===== GLOBAL FUNCTIONS =====
function handleColorClick(color) {
    game.handleColorClick(color);
}

function goToMainPage() {
    window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-visual.html';
}