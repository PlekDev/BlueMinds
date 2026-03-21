// ===== ADAPTIVE AI SYSTEM =====
class AIMemoryGame {
    constructor() {
        this.currentRound = 0;
        this.score = 0;
        this.currentImage = null;
        this.options = [];
        this.showFeedback = false;
        this.isMemorizingPhase = true;
        this.timeRemaining = 5;
        this.audioManager = new AudioManager();

        // AI parameters
        this.playerMemoryScore = 0;
        this.exposureTime = 5;
        this.failedImages = [];
        this.imageStats = {};
        this.difficulty = 'normal';
        this.consecutiveCorrect = 0;
        this.consecutiveWrong = 0;
        this.responseTime = 0;
        this.startMemoryTime = 0;

        // Difficulty levels
        this.difficultyLevels = {
            easy:   { distractors: 2, time: 6, complexity: 'simple' },
            normal: { distractors: 2, time: 5, complexity: 'normal' },
            hard:   { distractors: 3, time: 4, complexity: 'complex' }
        };

        // Categorized image database
        this.images = [
            { src: "https://tse2.mm.bing.net/th/id/OIP.iremaMYVEQmKqX0XkISwQgAAAA?rs=1&pid=ImgDetMain&o=7&rm=3?w=1380", name: "cat",   category: "animal", difficulty: 1 },
            { src: "https://tse4.mm.bing.net/th/id/OIP.g20yYrHhw8E7FZWE5yf3MwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3?w=1380", name: "dog",   category: "animal", difficulty: 1 },
            { src: "https://tse2.mm.bing.net/th/id/OIP.vluLeVl5ITns3V9R5ptDZgHaFc?rs=1&pid=ImgDetMain&o=7&rm=3?w=1380", name: "house", category: "object", difficulty: 1 },
            { src: "https://img.freepik.com/vector-premium/dibujo-dibujos-animados-flor-rosa-centro-amarillo_1167562-3170.jpg?w=1380", name: "flower", category: "nature", difficulty: 1 },
            { src: "https://tse1.mm.bing.net/th/id/OIP.J48Rm8Jv492HD2uEpSw6uwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3?w=1380", name: "tree", category: "nature", difficulty: 1 },
            { src: "https://th.bing.com/th/id/OIP.KvENQqXrbmaCQ9st9X_kkQHaHH?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3?w=1380", name: "sun",  category: "nature", difficulty: 1 }
        ];

        this.totalRounds = 5;

        // Initialize image stats
        this.images.forEach(img => {
            this.imageStats[img.name] = {
                attempts: 0,
                correct: 0,
                wrong: 0,
                avgResponseTime: 0
            };
        });
    }

    // ===== AI ANALYSIS =====
    analyzePerformance(isCorrect, responseTime) {
        const stats = this.imageStats[this.currentImage.name];

        stats.attempts++;
        stats.avgResponseTime = (stats.avgResponseTime + responseTime) / 2;

        if (isCorrect) {
            stats.correct++;
            this.consecutiveCorrect++;
            this.consecutiveWrong = 0;
        } else {
            stats.wrong++;
            this.consecutiveWrong++;
            this.consecutiveCorrect = 0;

            if (!this.failedImages.includes(this.currentImage.name)) {
                this.failedImages.push(this.currentImage.name);
            }
        }

        this.playerMemoryScore = (this.score / ((this.currentRound + 1) * 20)) * 100;
        this.adjustDifficulty();
    }

    adjustDifficulty() {
        if (this.consecutiveCorrect >= 3) {
            this.difficulty = 'hard';
            this.exposureTime = Math.max(3, this.exposureTime - 1);
        } else if (this.consecutiveWrong >= 2) {
            this.difficulty = 'easy';
            this.exposureTime = Math.min(7, this.exposureTime + 1);
        } else {
            this.difficulty = 'normal';
            this.exposureTime = 5;
        }

        this.showDifficultyIndicator();
    }

    showDifficultyIndicator() {
        const indicator = document.getElementById('difficulty-indicator');
        const levels = {
            easy:   '⭐ Difficulty: EASY',
            normal: '⭐⭐ Difficulty: NORMAL',
            hard:   '⭐⭐⭐ Difficulty: HARD'
        };

        indicator.textContent = levels[this.difficulty];
        indicator.style.display = 'block';
    }

    // ===== INTELLIGENT OPTION SELECTION =====
    selectOptionsIntelligently(correctImage) {
        const difficulty = this.difficultyLevels[this.difficulty];
        let distractors = [];

        if (this.failedImages.length > 0) {
            distractors = this.images
                .filter(img =>
                    img.name !== correctImage.name &&
                    this.failedImages.includes(img.name)
                )
                .slice(0, difficulty.distractors);
        }

        if (distractors.length < difficulty.distractors) {
            const remaining = this.images
                .filter(img =>
                    img.name !== correctImage.name &&
                    !distractors.find(d => d.name === img.name)
                )
                .sort(() => Math.random() - 0.5);

            distractors = [
                ...distractors,
                ...remaining.slice(0, difficulty.distractors - distractors.length)
            ];
        }

        return [correctImage, ...distractors].sort(() => Math.random() - 0.5);
    }

    // ===== GAME START =====
    announceGameStart() {
        const message = "Welcome to Memorize and Find. Your goal is to memorize the image shown and then select the correct option. You have five rounds. Good luck!";
        this.audioManager.speak(message, 0.9);
    }

    announceImage() {
        const message = `Memorize this image: ${this.currentImage.name}`;
        this.audioManager.speak(message, 0.95);
    }

    startNewRound() {
        let randomImage;
        if (this.failedImages.length > 0 && Math.random() > 0.5) {
            randomImage = this.images.find(img => img.name === this.failedImages[0]);
            this.failedImages.shift();
        } else {
            randomImage = this.images[Math.floor(Math.random() * this.images.length)];
        }

        this.currentImage = randomImage;
        this.options = this.selectOptionsIntelligently(randomImage);
        this.showFeedback = false;
        this.isMemorizingPhase = true;
        this.timeRemaining = this.exposureTime;
        this.startMemoryTime = Date.now();

        this.updateUI();
        this.announceImage();
        this.startMemorizingPhase();
    }

    updateUI() {
        document.getElementById('current-round').textContent = this.currentRound + 1;
        document.getElementById('total-rounds').textContent = this.totalRounds;
        document.getElementById('score').textContent = this.score + ' points';
        document.getElementById('score-display').textContent = this.score + ' points';

        const progress = ((this.currentRound + 1) / this.totalRounds) * 100;
        document.getElementById('progress-fill').style.width = progress + '%';

        document.getElementById('current-image').src = this.currentImage.src;
        document.getElementById('word-label').textContent = this.currentImage.name;
        document.getElementById('image-display').classList.remove('hidden');
        document.getElementById('options-section').style.display = 'none';
        document.getElementById('countdown-display').classList.remove('hidden-text');
        document.getElementById('feedback').classList.remove('show');
        document.getElementById('ai-analysis').classList.remove('show');
    }

    startMemorizingPhase() {
        const countdownText = document.getElementById('countdown');

        const interval = setInterval(() => {
            countdownText.textContent = this.timeRemaining;
            this.timeRemaining--;

            if (this.timeRemaining < 0) {
                clearInterval(interval);
                document.getElementById('image-display').classList.add('hidden');
                document.getElementById('countdown-display').classList.add('hidden-text');
                this.showOptionsPhase();
            }
        }, 1000);
    }

    showOptionsPhase() {
        this.isMemorizingPhase = false;
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';

        this.options.forEach((image) => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.textContent = image.name;
            button.onclick = () => this.handleAnswer(image.name);
            optionsContainer.appendChild(button);
        });

        document.getElementById('options-section').style.display = 'block';
        this.audioManager.speak('Which was the image?', 0.95);
    }

    handleAnswer(selectedName) {
        if (this.showFeedback) return;

        this.responseTime = (Date.now() - this.startMemoryTime) / 1000;
        const isCorrect = selectedName === this.currentImage.name;
        const feedbackElement = document.getElementById('feedback');
        const feedbackText = document.getElementById('feedback-text');

        this.analyzePerformance(isCorrect, this.responseTime);

        if (isCorrect) {
            this.score += 20;
            feedbackText.textContent = "Correct! 🎉";
            feedbackElement.className = 'feedback correct show';
            this.audioManager.speak('Correct! Excellent memory.', 0.95);
        } else {
            feedbackText.textContent = `Not correct. It was: ${this.currentImage.name} 😊`;
            feedbackElement.className = 'feedback incorrect show';
            this.audioManager.speak(`Incorrect. The correct answer was: ${this.currentImage.name}`, 0.9);
        }

        this.showFeedback = true;
        document.getElementById('score').textContent = this.score + ' points';
        document.getElementById('score-display').textContent = this.score + ' points';

        this.showAIAnalysis();

        setTimeout(() => {
            if (this.currentRound + 1 >= this.totalRounds) {
                this.completeGame();
            } else {
                this.currentRound++;
                this.startNewRound();
            }
        }, 2500);
    }

    showAIAnalysis() {
        const analysisEl = document.getElementById('ai-analysis');
        const analysisText = document.getElementById('analysis-text');

        let analysis = '';

        if (this.responseTime < 2) {
            analysis += '⚡ Very fast response. ';
        } else if (this.responseTime > 4) {
            analysis += '🤔 Slow response. ';
        }

        if (this.consecutiveCorrect > 0) {
            analysis += `✅ ${this.consecutiveCorrect} consecutive correct answer(s). `;
        }

        if (this.difficulty === 'hard') {
            analysis += '📈 Level increased to HARD. ';
        } else if (this.difficulty === 'easy') {
            analysis += '📉 Level reduced to EASY. ';
        }

        analysisText.textContent = analysis || 'Memory in development...';
        analysisEl.classList.add('show');
    }

    completeGame() {
        const gameCard = document.querySelector('.game-card');
        const avgAccuracy = ((this.score / (this.totalRounds * 20)) * 100).toFixed(1);

        let performanceMessage = 'Excellent visual memory! 🏆';
        if (avgAccuracy < 60) {
            performanceMessage = 'Keep practicing to improve your memory! 💪';
        } else if (avgAccuracy < 80) {
            performanceMessage = 'Great work! Your memory is improving. 🌟';
        }

        const finalMessage = `Game completed. Your final score is ${this.score} points with an accuracy of ${avgAccuracy} percent.`;
        this.audioManager.speak(finalMessage, 0.9);

        gameCard.innerHTML = `
            <h2>Game Completed!</h2>
            <div style="font-size: 80px; margin: 30px 0;">🎉</div>

            <div style="background: linear-gradient(135deg, #0066CC 0%, #0099FF 100%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <div style="font-size: 24px; font-weight: 700; margin-bottom: 10px;">Your final score: ${this.score} points</div>
                <div style="font-size: 18px; opacity: 0.9;">Accuracy: ${avgAccuracy}%</div>
            </div>

            <div style="background: rgba(0, 102, 204, 0.1); border-left: 4px solid #0066CC; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left; color: #1F2937;">
                <strong>📊 Final AI Analysis:</strong>
                <div style="margin-top: 10px; font-size: 14px;">
                    <div>✓ Memory capacity: ${this.playerMemoryScore.toFixed(0)}%</div>
                    <div>✓ Average reaction time: ${(this.options.length > 0 ? this.responseTime : 0).toFixed(2)}s</div>
                    <div>✓ Images requiring practice: ${this.failedImages.length > 0 ? this.failedImages.join(', ') : 'None'}</div>
                </div>
            </div>

            <div style="color: var(--primary-blue); font-size: 18px; font-weight: 600; margin: 15px 0;">
                ${performanceMessage}
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px;">
                <button style="background: linear-gradient(135deg, #0066CC 0%, #0099FF 100%); color: white; padding: 15px; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" onclick="location.reload()">
                    Play Again
                </button>
                <button style="background-color: #00B4D8; color: white; padding: 15px; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" onclick="goToMainPage()">
                    Back to Menu
                </button>
            </div>
        `;
    }
}

// ===== AUDIO MANAGER =====
class AudioManager {
    constructor() {
        this.synth = window.speechSynthesis;
        this.audioEnabled = true;
    }

    speak(text, rate = 1) {
        if (!this.audioEnabled) return;
        this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.lang = 'en-US';
        this.synth.speak(utterance);
    }

    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        return this.audioEnabled;
    }
}

// ===== INITIALIZATION =====
const game = new AIMemoryGame();

document.addEventListener('DOMContentLoaded', () => {
    game.announceGameStart();
    setTimeout(() => {
        game.startNewRound();
    }, 3000);
});

// ===== NAVIGATION =====
function toggleAudio() {
    const enabled = game.audioManager.toggleAudio();
    const btn = document.getElementById('audio-toggle');
    if (btn) {
        btn.innerHTML = enabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
    }
}

function goToMainPage() {
    window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-visual.html';
}