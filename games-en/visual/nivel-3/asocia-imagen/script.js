// ===== ADAPTIVE AI SYSTEM FOR WORD-IMAGE ASSOCIATION =====
class AIAssociationGame {
    constructor() {
        this.currentRound = 0;
        this.score = 0;
        this.currentImage = null;
        this.options = [];
        this.showFeedback = false;
        this.draggedElement = null;
        
        // AI parameters
        this.associationScore = 0;
        this.difficulty = 'easy';
        this.consecutiveCorrect = 0;
        this.consecutiveWrong = 0;
        this.totalQuestions = 5;
        this.sensitivity = 'normal';
        
        // Response analysis
        this.responseTime = 0;
        this.startTime = 0;
        this.errorTypes = {
            visualConfusion: 0,
            semanticConfusion: 0,
            slowResponse: 0,
            impulsiveResponse: 0
        };
        
        this.imageStats = {};
        this.problemImages = [];
        this.preferredCategories = {};
        
        // Image database with multiple categories
        this.allImages = {
            easy: [
                { src: "https://i.pinimg.com/originals/29/1e/d3/291ed353f93b45f607755109cca2a052.jpg", name: "car",    category: "vehicles", distractors: ["house", "tree"] },
                { src: "https://cdn5.vectorstock.com/i/1000x1000/43/49/cartoon-house-vector-4514349.jpg",   name: "house",  category: "places",   distractors: ["car", "flower"] },
                { src: "https://thumbs.dreamstime.com/z/pelota-de-f%C3%BAtbol-para-jugar-icono-en-el-estilo-dibujos-animados-caricatura-aislado-fondo-blanco-236463054.jpg", name: "ball", category: "toys", distractors: ["dog", "cat"] },
                { src: "https://cdn.pixabay.com/photo/2024/03/10/13/43/dog-8624743_1280.png", name: "dog", category: "animals", distractors: ["cat", "house"] },
                { src: "https://static.vecteezy.com/system/resources/previews/013/089/641/original/illustration-of-cute-colored-cat-cat-cartoon-image-in-eps10-format-suitable-for-children-s-book-design-elements-introduction-of-cats-to-children-books-or-posters-about-animal-vector.jpg", name: "cat", category: "animals", distractors: ["dog", "ball"] },
                { src: "https://cdn.pixabay.com/photo/2022/12/13/05/16/flowers-7652496_1280.png", name: "flower", category: "nature", distractors: ["tree", "house"] }
            ],
            medium: [
                { src: "https://c8.alamy.com/compes/2bwxntf/ordenador-de-dibujos-animados-apuntando-con-su-dedo-2bwxntf.jpg", name: "computer", category: "technology", distractors: ["phone", "book"] },
                { src: "https://i.pinimg.com/originals/49/6e/44/496e44ee1f77e1b12edf3c9d68e23707.png", name: "book", category: "education", distractors: ["computer", "pencil"] },
                { src: "https://img.freepik.com/vetores-premium/pato-de-ilustracao-de-desenho-animado_323802-361.jpg?w=2000", name: "duck", category: "animals", distractors: ["cat", "bird"] },
                { src: "https://static.vecteezy.com/system/resources/previews/011/157/544/large_2x/mobile-phone-cartoon-icon-illustration-technology-object-icon-concept-isolated-premium-flat-cartoon-style-vector.jpg", name: "phone", category: "technology", distractors: ["computer", "clock"] },
                { src: "https://tse1.explicit.bing.net/th/id/OIP.nBy5c3VCj3LlojKPGb0ILgHaIm?rs=1&pid=ImgDetMain&o=7&rm=3", name: "apple", category: "food", distractors: ["orange", "bread"] }
            ],
            hard: [
                { src: "https://static.vecteezy.com/system/resources/previews/016/704/376/original/cartoon-illustration-acoustic-guitar-colorful-musical-instrument-vector.jpg", name: "guitar", category: "music", distractors: ["piano", "trumpet"] },
                { src: "https://tse2.mm.bing.net/th/id/OIP.dgfaiili0WFTJb1FPxoEKQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", name: "bicycle", category: "vehicles", distractors: ["car", "train"] },
                { src: "https://img.freepik.com/vector-premium/ilustracion-vectorial-al-estilo-dibujos-animados-clip-microfono_761413-4518.jpg", name: "microphone", category: "music", distractors: ["guitar", "headphones"] },
                { src: "https://tse2.mm.bing.net/th/id/OIP.29aisGf4Boe8M1l2_xNJJAHaGH?rs=1&pid=ImgDetMain&o=7&rm=3", name: "desk", category: "places", distractors: ["chair", "bed"] },
                { src: "https://image.freepik.com/vector-gratis/dibujos-animados-naturaleza-paisaje-mar_107173-7110.jpg", name: "sea", category: "nature", distractors: ["mountain", "forest"] }
            ]
        };
        
        // Initialize stats
        Object.values(this.allImages).forEach(images => {
            images.forEach(img => {
                this.imageStats[img.name] = {
                    attempts: 0,
                    correct: 0,
                    avgTime: 0,
                    errors: []
                };
                this.preferredCategories[img.category] = 0;
            });
        });
        
        this.loadImage();
    }
    
    selectNextImage() {
        const imagesForDifficulty = this.allImages[this.difficulty];
        
        // Prioritize problematic images
        const problematicImages = imagesForDifficulty.filter(img => {
            const stats = this.imageStats[img.name];
            return stats && stats.attempts > 0 && stats.correct === 0;
        });
        
        if (problematicImages.length > 0 && Math.random() > 0.5) {
            return problematicImages[Math.floor(Math.random() * problematicImages.length)];
        }
        
        return imagesForDifficulty[Math.floor(Math.random() * imagesForDifficulty.length)];
    }
    
    adjustDifficulty() {
        this.associationScore = (this.score / (this.totalQuestions * 20)) * 100;
        
        // 3 consecutive correct and >= 80% → increase difficulty
        if (this.consecutiveCorrect >= 3 && this.associationScore >= 80) {
            if (this.difficulty === 'easy') {
                this.difficulty = 'medium';
                audioManager.speak('Increasing difficulty to medium level', 0.9);
            } else if (this.difficulty === 'medium') {
                this.difficulty = 'hard';
                audioManager.speak('Increasing difficulty to hard level', 0.9);
            }
        }
        // Struggling → reduce difficulty
        else if (this.consecutiveWrong >= 2 || this.associationScore < 50) {
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
        const numOptions = this.difficulty === 'easy' ? 2 : (this.difficulty === 'medium' ? 3 : 4);
        const levels = {
            easy:   `⭐ Difficulty: EASY (${numOptions} options)`,
            medium: `⭐⭐ Difficulty: MEDIUM (${numOptions} options)`,
            hard:   `⭐⭐⭐ Difficulty: HARD (${numOptions} options)`
        };
        
        indicator.textContent = levels[this.difficulty];
        indicator.style.display = 'block';
    }
    
    detectSensitivity() {
        // Detect hypersensitivity (many visual errors) or hyposensitivity
        if (this.errorTypes.visualConfusion > this.errorTypes.semanticConfusion) {
            this.sensitivity = 'hypersensitive';
            this.applyLowStimuliMode();
        } else if (this.consecutiveWrong >= 2 && this.responseTime > 8) {
            this.sensitivity = 'hyposensitive';
            this.applyHighContrastMode();
        } else {
            this.sensitivity = 'normal';
            this.applyNormalMode();
        }
        
        this.showVisualHint();
    }
    
    applyLowStimuliMode() {
        const display = document.getElementById('image-display');
        display.classList.remove('high-contrast');
        display.classList.add('low-stimuli');
    }
    
    applyHighContrastMode() {
        const display = document.getElementById('image-display');
        display.classList.remove('low-stimuli');
        display.classList.add('high-contrast');
    }
    
    applyNormalMode() {
        const display = document.getElementById('image-display');
        display.classList.remove('low-stimuli', 'high-contrast');
    }
    
    showVisualHint() {
        if (this.consecutiveWrong >= 1) {
            const hintBox = document.getElementById('visual-hint');
            const hints = {
                easy:   `💡 Hint: The word starts with "${this.currentImage.name.charAt(0).toUpperCase()}"`,
                medium: `💡 Hint: It belongs to the "${this.currentImage.category}" category`,
                hard:   `💡 Hint: It has ${this.currentImage.name.length} letters`
            };
            hintBox.textContent = hints[this.difficulty];
            hintBox.style.display = 'block';
            audioManager.speak(hints[this.difficulty].replace('💡 Hint: ', ''), 0.9);
        } else {
            document.getElementById('visual-hint').style.display = 'none';
        }
    }
    
    loadImage() {
        this.showFeedback = false;
        this.startTime = Date.now();
        
        this.currentImage = this.selectNextImage();
        
        const numOptions = this.difficulty === 'easy' ? 2 : (this.difficulty === 'medium' ? 3 : 4);
        const wrongOptions = this.allImages[this.difficulty]
            .filter(img => img.name !== this.currentImage.name)
            .sort(() => Math.random() - 0.5)
            .slice(0, numOptions - 1);
        
        this.options = [this.currentImage, ...wrongOptions].sort(() => Math.random() - 0.5);
        
        document.getElementById('current-round').textContent = this.currentRound + 1;
        document.getElementById('total-rounds').textContent = this.totalQuestions;
        
        const progress = ((this.currentRound + 1) / this.totalQuestions) * 100;
        document.getElementById('progress-fill').style.width = progress + '%';
        
        document.getElementById('current-image').src = this.currentImage.src;
        
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        this.options.forEach((option) => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.textContent = option.name;
            button.draggable = true;
            button.dataset.correct = option.name === this.currentImage.name;
            
            button.addEventListener('dragstart', (e) => this.handleDragStart(e, button));
            button.addEventListener('dragend', (e) => this.handleDragEnd(e));
            button.addEventListener('click', () => this.handleAnswer(option.name));
            
            optionsContainer.appendChild(button);
        });
        
        const imageDisplay = document.getElementById('image-display');
        imageDisplay.addEventListener('dragover', (e) => this.handleDragOver(e));
        imageDisplay.addEventListener('drop', (e) => this.handleDrop(e));
        
        document.getElementById('feedback').classList.remove('show');
        document.getElementById('ai-analysis').classList.remove('show');
        
        this.adjustDifficulty();
        this.detectSensitivity();
        
        audioManager.speak(`Round ${this.currentRound + 1}. Select the correct word for the image`, 1);
    }
    
    handleDragStart(e, element) {
        this.draggedElement = element;
        element.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }
    
    handleDragEnd(e) {
        this.draggedElement = null;
        document.querySelectorAll('.option-button').forEach(el => {
            el.classList.remove('dragging');
        });
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    }
    
    handleDrop(e) {
        e.preventDefault();
        if (this.draggedElement) {
            const wordName = this.draggedElement.textContent;
            this.handleAnswer(wordName);
        }
        return false;
    }
    
    handleAnswer(selectedName) {
        if (this.showFeedback) return;
        
        this.responseTime = (Date.now() - this.startTime) / 1000;
        const isCorrect = selectedName === this.currentImage.name;
        
        const feedbackElement = document.getElementById('feedback');
        const feedbackText = document.getElementById('feedback-text');
        
        const imageKey = this.currentImage.name;
        this.imageStats[imageKey].attempts++;
        this.imageStats[imageKey].avgTime = 
            (this.imageStats[imageKey].avgTime + this.responseTime) / 2;
        
        if (isCorrect) {
            this.score += 20;
            this.consecutiveCorrect++;
            this.consecutiveWrong = 0;
            this.imageStats[imageKey].correct++;
            this.preferredCategories[this.currentImage.category]++;
            
            feedbackText.textContent = `Correct! 🎉 "${this.currentImage.name}"`;
            feedbackElement.className = 'feedback correct show';
            audioManager.speak(`Correct. The word is ${this.currentImage.name}`, 0.95);
            
            this.playSound();
        } else {
            this.consecutiveWrong++;
            this.consecutiveCorrect = 0;
            this.imageStats[imageKey].errors.push(selectedName);
            
            // Detect error type
            if (selectedName.length === this.currentImage.name.length) {
                this.errorTypes.visualConfusion++;
            } else {
                this.errorTypes.semanticConfusion++;
            }
            
            if (!this.problemImages.includes(imageKey)) {
                this.problemImages.push(imageKey);
            }
            
            feedbackText.textContent = `Not correct. It was: "${this.currentImage.name}" 😊`;
            feedbackElement.className = 'feedback incorrect show';
            audioManager.speak(`Incorrect. The correct word is ${this.currentImage.name}`, 0.95);
        }
        
        document.getElementById('score').textContent = this.score + ' points';
        document.getElementById('score-display').textContent = this.score + ' points';
        
        document.querySelectorAll('.option-button').forEach(btn => {
            if (btn.textContent === selectedName) {
                if (isCorrect) {
                    btn.classList.add('correct-highlight', 'used');
                } else {
                    btn.classList.add('error-highlight');
                }
            }
            if (btn.textContent === this.currentImage.name && !isCorrect) {
                btn.classList.add('correct-highlight');
            }
            btn.disabled = true;
        });
        
        this.showFeedback = true;
        this.adjustDifficulty();
        this.detectSensitivity();
        this.showAIAnalysis();
        
        setTimeout(() => {
            if (this.currentRound + 1 >= this.totalQuestions) {
                this.endGame();
            } else {
                this.currentRound++;
                this.loadImage();
            }
        }, 2500);
    }
    
    playSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
    
    showAIAnalysis() {
        const analysisEl = document.getElementById('ai-analysis');
        const analysisText = document.getElementById('analysis-text');
        
        let analysis = '';
        
        if (this.responseTime < 1.5) {
            analysis += '⚡ Very fast impulsive response. ';
            this.errorTypes.impulsiveResponse++;
        } else if (this.responseTime > 5) {
            analysis += '🤔 Slow response, needs more time. ';
            this.errorTypes.slowResponse++;
        }
        
        if (this.consecutiveCorrect > 0) {
            analysis += `✅ ${this.consecutiveCorrect} consecutive correct answer(s). `;
        }
        if (this.consecutiveWrong > 0) {
            analysis += `❌ ${this.consecutiveWrong} consecutive error(s). `;
        }
        
        if (this.sensitivity === 'hypersensitive') {
            analysis += '👁️ Mode: Low visual stimuli. ';
        } else if (this.sensitivity === 'hyposensitive') {
            analysis += '🔆 Mode: High contrast. ';
        }
        
        if (this.difficulty === 'hard') {
            analysis += '📈 Level: HARD. ';
        } else if (this.difficulty === 'easy') {
            analysis += '📉 Level: EASY. ';
        } else {
            analysis += '➡️ Level: MEDIUM. ';
        }
        
        analysisText.textContent = analysis || 'Association in progress...';
        analysisEl.classList.add('show');
    }
    
    endGame() {
        const gameCard = document.querySelector('.image-card');
        const avgAccuracy = ((this.score / (this.totalQuestions * 20)) * 100).toFixed(1);
        const finalScore = this.associationScore.toFixed(0);
        
        let performanceMessage = 'Excellent word-image association! 🏆';
        let performanceAudio = 'Excellent word image association';
        
        if (avgAccuracy < 60) {
            performanceMessage = 'Keep practicing! Your association will improve. 💪';
            performanceAudio = 'Keep practicing, your association will improve';
        } else if (avgAccuracy < 80) {
            performanceMessage = 'Great work! Your association is improving. 🌟';
            performanceAudio = 'Great work, your association is improving';
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
                <strong>📊 Final AI Analysis - Word-Image Association:</strong>
                <div style="margin-top: 10px; line-height: 1.8;">
                    <div>✓ Association score: ${finalScore}%</div>
                    <div>✓ Average response time: ${(this.imageStats[this.currentImage?.name]?.avgTime || 0).toFixed(2)}s</div>
                    <div>✓ Visual errors: ${this.errorTypes.visualConfusion}</div>
                    <div>✓ Semantic errors: ${this.errorTypes.semanticConfusion}</div>
                    <div>✓ Detected sensitivity: ${this.sensitivity === 'hypersensitive' ? 'Hypersensitive' : (this.sensitivity === 'hyposensitive' ? 'Hyposensitive' : 'Normal')}</div>
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
    }
    
    goToMainPage() {
        window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-visual.html';
    }
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    const game = new AIAssociationGame();
    window.goToMainPage = () => game.goToMainPage();
});