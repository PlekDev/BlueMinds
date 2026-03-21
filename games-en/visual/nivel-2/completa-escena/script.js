// ===== ADAPTIVE AI SYSTEM FOR VISUAL-VERBAL CATEGORIZATION =====
class AISceneGame {
    constructor() {
        this.currentRound = 0;
        this.score = 0;
        this.currentScene = null;
        this.selectedOption = null;
        this.showFeedback = false;
        
        // AI parameters
        this.categorizationScore = 0;
        this.difficulty = 'easy';
        this.consecutiveCorrect = 0;
        this.consecutiveWrong = 0;
        
        // Error analysis
        this.errorAnalysis = {
            visualErrors: 0,
            semanticErrors: 0,
            distractorsSelected: {},
            preferredCategories: {}
        };
        
        this.sceneStats = {};
        
        // Scene database by difficulty and category
        this.allScenes = {
            easy: [
                {
                    sentence: "The bird is in the",
                    options: ["🍅", "🪺", "🌊"],
                    correct: "🪺",
                    correctText: "nest",
                    category: "animals",
                    complexity: 1
                },
                {
                    sentence: "The fish lives in the",
                    options: ["🌳", "🌊", "🏠"],
                    correct: "🌊",
                    correctText: "water",
                    category: "animals",
                    complexity: 1
                },
                {
                    sentence: "The cat eats",
                    options: ["🐟", "🌽", "🥕"],
                    correct: "🐟",
                    correctText: "fish",
                    category: "animals",
                    complexity: 1
                },
                {
                    sentence: "The flower is in the",
                    options: ["🌳", "🌐", "💻"],
                    correct: "🌳",
                    correctText: "garden",
                    category: "nature",
                    complexity: 1
                },
                {
                    sentence: "The child plays with the",
                    options: ["🦃", "⚽", "🪱"],
                    correct: "⚽",
                    correctText: "ball",
                    category: "games",
                    complexity: 1
                }
            ],
            medium: [
                {
                    sentence: "The teacher teaches at the",
                    options: ["🛒", "🏫", "🪸"],
                    correct: "🏫",
                    correctText: "school",
                    category: "places",
                    complexity: 2
                },
                {
                    sentence: "The doctor works at the",
                    options: ["🪸", "🏥", "🪄"],
                    correct: "🏥",
                    correctText: "hospital",
                    category: "places",
                    complexity: 2
                },
                {
                    sentence: "The bee flies among the",
                    options: ["😭", "🌻", "🏢"],
                    correct: "🌻",
                    correctText: "flowers",
                    category: "nature",
                    complexity: 2
                },
                {
                    sentence: "The butterfly needs",
                    options: ["👻", "🔥", "🌻"],
                    correct: "🌻",
                    correctText: "flowers",
                    category: "nature",
                    complexity: 2
                },
                {
                    sentence: "The dog plays with the",
                    options: ["🛹", "🦺", "🥎"],
                    correct: "🥎",
                    correctText: "ball",
                    category: "places",
                    complexity: 2
                }
            ],
            hard: [
                {
                    sentence: "The painter uses the",
                    options: ["🎨", "👽", "⚽"],
                    correct: "🎨",
                    correctText: "brush",
                    category: "professions",
                    complexity: 3
                },
                {
                    sentence: "The dentist examines the",
                    options: ["👂", "👁️", "🦷"],
                    correct: "🦷",
                    correctText: "teeth",
                    category: "professions",
                    complexity: 3
                },
                {
                    sentence: "The chef prepares the",
                    options: ["🍕", "📚", "🚗"],
                    correct: "🍕",
                    correctText: "food",
                    category: "professions",
                    complexity: 3
                },
                {
                    sentence: "The farmer grows crops in the",
                    options: ["🏙️", "🌾", "🏢"],
                    correct: "🌾",
                    correctText: "field",
                    category: "places",
                    complexity: 3
                }
            ]
        };

        this.totalRounds = 5;
        
        // Initialize stats
        Object.values(this.allScenes).forEach(scenes => {
            scenes.forEach(scene => {
                this.sceneStats[scene.sentence] = {
                    attempts: 0,
                    correct: 0,
                    errorType: null
                };
            });
        });
    }

    // ===== ERROR ANALYSIS =====
    analyzeError(selectedOption, correctOption, sceneCategory) {
        let errorType = 'semantic';
        
        if (this.isVisualDistractor(selectedOption)) {
            this.errorAnalysis.visualErrors++;
            errorType = 'visual';
        } else {
            this.errorAnalysis.semanticErrors++;
            errorType = 'semantic';
        }
        
        if (!this.errorAnalysis.distractorsSelected[selectedOption]) {
            this.errorAnalysis.distractorsSelected[selectedOption] = 0;
        }
        this.errorAnalysis.distractorsSelected[selectedOption]++;
        
        return errorType;
    }

    isVisualDistractor(option) {
        const visualSimilarPairs = [
            ['🌳', '🌲'], ['🏠', '🏡'], ['🐕', '🐶'], ['🍎', '🍎']
        ];
        return visualSimilarPairs.some(pair => pair.includes(option));
    }

    // ===== SCORE CALCULATION =====
    calculateCategorizationScore() {
        const totalAttempts = this.currentRound + 1;
        const correctCount = Math.floor(this.score / 20);
        this.categorizationScore = (correctCount / totalAttempts) * 100;
        return this.categorizationScore;
    }

    // ===== AUTOMATIC DIFFICULTY ADJUSTMENT =====
    adjustDifficulty() {
        this.calculateCategorizationScore();
        
        if (this.consecutiveCorrect >= 3 && this.categorizationScore >= 75) {
            if (this.difficulty === 'easy') {
                this.difficulty = 'medium';
                audioManager.speak('Increasing difficulty to medium level', 0.9);
            } else if (this.difficulty === 'medium') {
                this.difficulty = 'hard';
                audioManager.speak('Increasing difficulty to hard level', 0.9);
            }
        }
        else if (this.consecutiveWrong >= 2 || this.categorizationScore < 50) {
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
            easy:   '⭐ Difficulty: EASY (3 simple options)',
            medium: '⭐⭐ Difficulty: MEDIUM (3 complex options)',
            hard:   '⭐⭐⭐ Difficulty: HARD (abstract concepts)'
        };

        indicator.textContent = levels[this.difficulty];
        indicator.style.display = 'block';
    }

    // ===== INTELLIGENT SCENE SELECTION =====
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

    // ===== SHOW HINT =====
    showHint() {
        if (this.consecutiveWrong >= 1) {
            const hintBox = document.getElementById('hint-box');
            const hintText = `💡 Hint: Think about the "${this.currentScene.category}" category`;
            hintBox.textContent = hintText;
            hintBox.style.display = 'block';
            audioManager.speak(`Hint: Think about the ${this.currentScene.category} category`, 0.9);
        } else {
            document.getElementById('hint-box').style.display = 'none';
        }
    }

    // ===== GAME START =====
    startNewRound() {
        this.currentScene = this.selectNextScene();
        this.selectedOption = null;
        this.showFeedback = false;
        
        this.updateUI();
        this.showHint();
        audioManager.speak(`Round ${this.currentRound + 1}. Complete: ${this.currentScene.sentence}`, 1);
    }

    updateUI() {
        document.getElementById('current-round').textContent = this.currentRound + 1;
        document.getElementById('total-rounds').textContent = this.totalRounds;
        document.getElementById('score').textContent = this.score + ' points';
        document.getElementById('score-display').textContent = this.score + ' points';

        const progress = ((this.currentRound + 1) / this.totalRounds) * 100;
        document.getElementById('progress-fill').style.width = progress + '%';

        const sentenceDisplay = document.getElementById('sentence-display');
        sentenceDisplay.innerHTML = this.currentScene.sentence + ' <span class="blank-space">?</span>';

        const optionsDisplay = document.getElementById('options-display');
        optionsDisplay.innerHTML = '';
        
        const shuffledOptions = [...this.currentScene.options].sort(() => Math.random() - 0.5);
        
        shuffledOptions.forEach((option) => {
            const button = document.createElement('div');
            button.className = 'option-image';
            button.textContent = option;
            if (this.selectedOption === option) {
                button.classList.add('selected');
            }
            button.onclick = () => this.selectOption(option);
            optionsDisplay.appendChild(button);
        });

        document.getElementById('feedback').classList.remove('show');
        document.getElementById('ai-analysis').classList.remove('show');
    }

    selectOption(option) {
        this.selectedOption = option;
        this.updateUI();
    }

    resetAnswer() {
        this.selectedOption = null;
        this.updateUI();
    }

    // ===== CHECK & ANALYSIS =====
    checkAnswer() {
        if (!this.selectedOption) {
            const feedbackElement = document.getElementById('feedback');
            feedbackElement.textContent = 'You must select an option';
            feedbackElement.className = 'feedback incorrect show';
            audioManager.speak('You must select an option', 0.9);
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
            
            feedbackText.textContent = `Correct! It was "${this.currentScene.correctText}" 🎉`;
            feedbackElement.className = 'feedback correct show';
            audioManager.speak(`Correct! The right answer is ${this.currentScene.correctText}`, 0.95);
            
            if (!this.errorAnalysis.preferredCategories[this.currentScene.category]) {
                this.errorAnalysis.preferredCategories[this.currentScene.category] = 0;
            }
            this.errorAnalysis.preferredCategories[this.currentScene.category]++;
        } else {
            const errorType = this.analyzeError(
                this.selectedOption,
                this.currentScene.correct,
                this.currentScene.category
            );
            this.consecutiveWrong++;
            this.consecutiveCorrect = 0;
            this.sceneStats[sceneKey].errorType = errorType;
            
            feedbackText.textContent = `Not correct. It was "${this.currentScene.correctText}" 😊`;
            feedbackElement.className = 'feedback incorrect show';
            audioManager.speak(`Not correct. The right answer is ${this.currentScene.correctText}`, 0.95);
        }

        this.showFeedback = true;
        document.getElementById('score').textContent = this.score + ' points';
        document.getElementById('score-display').textContent = this.score + ' points';

        this.adjustDifficulty();
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

    // ===== REAL-TIME AI ANALYSIS =====
    showAIAnalysis() {
        const analysisEl = document.getElementById('ai-analysis');
        const analysisText = document.getElementById('analysis-text');
        
        let analysis = '';

        if (this.errorAnalysis.visualErrors > 0 && !this.showFeedback) {
            analysis += `👁️ Visual errors detected: ${this.errorAnalysis.visualErrors}. `;
        }
        if (this.errorAnalysis.semanticErrors > 0 && !this.showFeedback) {
            analysis += `📝 Semantic errors: ${this.errorAnalysis.semanticErrors}. `;
        }

        if (this.consecutiveCorrect > 0) {
            analysis += `✅ ${this.consecutiveCorrect} consecutive correct answer(s). `;
        }
        if (this.consecutiveWrong > 0) {
            analysis += `❌ ${this.consecutiveWrong} consecutive error(s). `;
        }

        if (this.difficulty === 'hard') {
            analysis += '📈 Level: HARD (advanced concepts). ';
        } else if (this.difficulty === 'easy') {
            analysis += '📉 Level: EASY (basic concepts). ';
        } else {
            analysis += '➡️ Level: MEDIUM (intermediate concepts). ';
        }

        analysisText.textContent = analysis || 'Categorization in progress...';
        analysisEl.classList.add('show');
    }

    // ===== GAME COMPLETE =====
    completeGame() {
        const gameCard = document.querySelector('.game-card');
        const avgAccuracy = ((this.score / (this.totalRounds * 20)) * 100).toFixed(1);
        const finalScore = this.calculateCategorizationScore().toFixed(0);
        
        let favoriteCategory = 'General';
        let maxAttempts = 0;
        for (const [category, count] of Object.entries(this.errorAnalysis.preferredCategories)) {
            if (count > maxAttempts) {
                maxAttempts = count;
                favoriteCategory = category;
            }
        }
        
        let performanceMessage = 'Excellent visual categorization! 🏆';
        let performanceAudio = 'Excellent visual categorization';
        
        if (avgAccuracy < 60) {
            performanceMessage = 'Keep practicing! Your categorization will improve. 💪';
            performanceAudio = 'Keep practicing, your categorization will improve';
        } else if (avgAccuracy < 80) {
            performanceMessage = 'Great work! You understand the categories well. 🌟';
            performanceAudio = 'Great work, you understand the categories well';
        }

        audioManager.speak(`Game completed. Score: ${this.score} points. Accuracy: ${avgAccuracy} percent. ${performanceAudio}`, 0.95);

        gameCard.innerHTML = `
            <h2>Game Completed!</h2>
            <div style="font-size: 80px; margin: 30px 0;">🎉</div>
            
            <div style="background: linear-gradient(135deg, #0066CC 0%, #0099FF 100%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <div style="font-size: 24px; font-weight: 700; margin-bottom: 10px;">Your final score: ${this.score} points</div>
                <div style="font-size: 18px; opacity: 0.9;">Accuracy: ${avgAccuracy}%</div>
            </div>

            <div style="background: rgba(0, 102, 204, 0.1); border-left: 4px solid #0066CC; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left; color: #1F2937; font-size: 14px;">
                <strong>📊 Final AI Analysis - Visual-Verbal Categorization:</strong>
                <div style="margin-top: 10px; line-height: 1.8;">
                    <div>✓ Categorization score: ${finalScore}%</div>
                    <div>✓ Visual errors: ${this.errorAnalysis.visualErrors}</div>
                    <div>✓ Semantic errors: ${this.errorAnalysis.semanticErrors}</div>
                    <div>✓ Favorite category: ${favoriteCategory}</div>
                    <div>✓ Final level: ${this.difficulty.toUpperCase()}</div>
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

        document.getElementById('ai-analysis').classList.remove('show');
    }
}

// ===== INITIALIZATION =====
const game = new AISceneGame();

document.addEventListener('DOMContentLoaded', () => {
    game.startNewRound();
});

// ===== GLOBAL FUNCTIONS =====
function selectOption(option) {
    game.selectOption(option);
}

function resetAnswer() {
    game.resetAnswer();
}

function checkAnswer() {
    game.checkAnswer();
}

function goToMainPage() {
    window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-visual.html';
}