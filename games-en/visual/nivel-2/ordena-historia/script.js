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
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'en-US';
        this.synth.speak(utterance);
    }
    
    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        return this.audioEnabled;
    }
}

// ===== ADAPTIVE AI SYSTEM FOR NARRATIVE SEQUENCING =====
class AISequenceGame {
    constructor() {
        this.currentRound = 0;
        this.score = 0;
        this.selectedSequence = [];
        this.showFeedback = false;
        this.draggedElement = null;
        
        // Audio Manager
        this.audioManager = new AudioManager();
        
        // AI parameters
        this.narrativeScore = 0;
        this.difficulty = 'easy';
        this.consecutiveCorrect = 0;
        this.consecutiveWrong = 0;
        this.totalQuestions = 5;
        
        // Error analysis
        this.sequenceStats = {};
        this.confusingImages = [];
        this.reactionTimes = [];
        this.startSequenceTime = 0;
        
        // Sequence database with descriptions
        // INSTRUCTIONS: Replace URLs with your own images
        this.allSequences = {
            easy: [
                {
                    images: [
                        { src: "https://static.vecteezy.com/system/resources/previews/017/076/256/original/boy-waking-up-yawning-cartoon-vector.jpg", desc: "Boy waking up in bed" },
                        { src: "https://img.freepik.com/vector-premium/nino-feliz-desayunando-colorida-ilustracion-vectorial-al-estilo-dibujos-animados_1322206-39435.jpg", desc: "Having breakfast at the table" },
                        { src: "https://st2.depositphotos.com/2945617/8585/v/950/depositphotos_85856074-stock-illustration-little-boy-going-to-school.jpg", desc: "Boy at school" }
                    ],
                    correct: [0, 1, 2],
                    title: "The Morning",
                    narrative: "First we wake up, then we have breakfast, and finally we go to school.",
                    complexity: 1
                },
                {
                    images: [
                        { src: "https://tse4.mm.bing.net/th/id/OIP.xMwDxflkWqaKagRuOp1hZAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Rain cloud" },
                        { src: "https://tse3.mm.bing.net/th/id/OIP.FAMR-s9zad_LslQlDT9gDQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Puddles of water" },
                        { src: "https://tse2.mm.bing.net/th/id/OIP.t2COZIcOmALI7sa9CeRsfQHaG5?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Rainbow in the sky" }
                    ],
                    correct: [0, 1, 2],
                    title: "After the Rain",
                    narrative: "First it rains, puddles form, and then a rainbow appears.",
                    complexity: 1
                },
                {
                    images: [
                        { src: "https://static.vecteezy.com/system/resources/previews/024/778/157/non_2x/seed-with-sprouted-sprout-isolated-cartoon-illustration-concept-of-gardening-and-sowing-vector.jpg", desc: "Seed in the soil" },
                        { src: "https://tse2.mm.bing.net/th/id/OIP.a2tNbGqI4G98OE6yJv-wEAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Small plant growing" },
                        { src: "https://tse3.mm.bing.net/th/id/OIP.bcBuWNMwvSZF6uOdADg29gHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Fully bloomed flower" }
                    ],
                    correct: [0, 1, 2],
                    title: "A Flower Grows",
                    narrative: "First we plant the seed, then it grows into a little plant, and finally it blooms.",
                    complexity: 1
                }
            ],
            medium: [
                {
                    images: [
                        { src: "https://c8.alamy.com/comp/2M0HW0Y/baking-ingredients-isolated-cartoon-vector-illustration-cooking-ingredients-preparing-food-at-home-close-up-set-of-products-view-from-above-homemade-pastry-home-kitchen-vector-cartoon-2M0HW0Y.jpg", desc: "Baking ingredients" },
                        { src: "https://tse1.mm.bing.net/th/id/OIP.mStS74GCKGvdTpsFDNxhfwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Mixing ingredients" },
                        { src: "https://media.istockphoto.com/id/847089908/es/vector/pastel-en-el-horno-hvector-dibujos-animados.jpg?s=612x612&w=is&k=20&c=0HeOwc26coQNYFCkETUa75sDCOjqRnZzMEvBG1kxAsU=", desc: "Cake in the oven" },
                        { src: "https://png.pngtree.com/png-clipart/20220430/original/pngtree-birthday-cake-cartoon-vector-illustration-png-image_7597943.png", desc: "Finished delicious cake" }
                    ],
                    correct: [0, 1, 2, 3],
                    title: "Baking a Cake",
                    narrative: "First we prepare the ingredients, mix them, bake them, and finally we have a delicious cake.",
                    complexity: 2
                },
                {
                    images: [
                        { src: "https://tse1.mm.bing.net/th/id/OIP.KzGzpzjsBBdyEh-zjkgUpQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Small caterpillar" },
                        { src: "https://tse3.mm.bing.net/th/id/OIP.lV2ReNOe6gdmf-egtADD-AHaI7?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Metamorphosis cocoon" },
                        { src: "https://static.vecteezy.com/system/resources/previews/010/337/273/original/cartoon-colourful-butterfly-character-welcoming-hands-gesture-butterfly-with-beuatifil-wing-pattern-png.png", desc: "Beautiful butterfly flying" }
                    ],
                    correct: [0, 1, 2],
                    title: "The Butterfly Cycle",
                    narrative: "The caterpillar forms a cocoon and then becomes a beautiful butterfly.",
                    complexity: 2
                }
            ],
            hard: [
                {
                    images: [
                        { src: "https://img.freepik.com/vector-premium/lindo-huevo-gallina-feliz-personaje-animado-huevo-gallina-concepto-pascua_92289-1205.jpg?w=2000o", desc: "Hen egg" },
                        { src: "https://tse1.mm.bing.net/th/id/OIP.-UsPwYf55VTgxb6OyhbMMQHaHJ?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Newborn chick" },
                        { src: "https://tse1.mm.bing.net/th/id/OIP.4il2Ne-LrqPmpksaW96T_AHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Adult chicken" },
                        { src: "https://thumbs.dreamstime.com/b/la-gallina-linda-anaranjada-est%C3%A1-poniendo-los-huevos-en-el-ejemplo-plano-del-vector-de-historieta-jerarqu%C3%ADa-aislado-fondo-blanco-109469709.jpg", desc: "Hen laying eggs" }
                    ],
                    correct: [0, 1, 2, 3],
                    title: "Chicken Life Cycle",
                    narrative: "The egg hatches into a chick, then grows into an adult chicken, and finally the hen lays new eggs.",
                    complexity: 3
                },
                {
                    images: [
                        { src: "https://tse4.mm.bing.net/th/id/OIP.i9DsDzYnHNuRbMS1Xrjc_AHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Coin in hand" },
                        { src: "https://img.freepik.com/vector-premium/ilustracion-dibujos-animados-bonita-ahorrando-dinero-usando-alcancia_869472-1101.jpg?w=2000", desc: "Depositing in the bank" },
                        { src: "https://tse1.mm.bing.net/th/id/OIP.0hUNQY1KWP1Ir5vroY_bSAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Time passing" },
                        { src: "https://tse3.mm.bing.net/th/id/OIP.CPVijvshD_czEmmRwkf98wHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Money with interest" }
                    ],
                    correct: [0, 1, 2, 3],
                    title: "Saving Money",
                    narrative: "We save coins, deposit them in the bank, wait for time to pass, and our money grows.",
                    complexity: 3
                }
            ]
        };
        
        // Initialize stats
        Object.values(this.allSequences).forEach(sequences => {
            sequences.forEach((seq, idx) => {
                this.sequenceStats[seq.title] = {
                    attempts: 0,
                    correct: 0,
                    avgTime: 0,
                    mistakesPattern: []
                };
            });
        });
        
        this.loadSequence();
    }
    
    selectNextSequence() {
        const sequencesForDifficulty = this.allSequences[this.difficulty];
        
        // Prioritize problematic sequences
        const problematicSequences = sequencesForDifficulty.filter(seq => {
            const stats = this.sequenceStats[seq.title];
            return stats && stats.attempts > 0 && stats.correct === 0;
        });
        
        if (problematicSequences.length > 0 && Math.random() > 0.5) {
            return problematicSequences[Math.floor(Math.random() * problematicSequences.length)];
        }
        
        return sequencesForDifficulty[Math.floor(Math.random() * sequencesForDifficulty.length)];
    }
    
    adjustDifficulty() {
        this.narrativeScore = (this.score / (this.totalQuestions * 20)) * 100;
        
        // 3 consecutive correct and >= 80% → increase difficulty
        if (this.consecutiveCorrect >= 3 && this.narrativeScore >= 80) {
            if (this.difficulty === 'easy') {
                this.difficulty = 'medium';
            } else if (this.difficulty === 'medium') {
                this.difficulty = 'hard';
            }
        }
        // Struggling → reduce difficulty
        else if (this.consecutiveWrong >= 2 || this.narrativeScore < 50) {
            if (this.difficulty === 'hard') {
                this.difficulty = 'medium';
            } else if (this.difficulty === 'medium') {
                this.difficulty = 'easy';
            }
            this.consecutiveWrong = 0;
        }
        
        this.showDifficultyIndicator();
    }
    
    showDifficultyIndicator() {
        const indicator = document.getElementById('difficulty-indicator');
        const levels = {
            easy:   '⭐ Difficulty: EASY (3 images)',
            medium: '⭐⭐ Difficulty: MEDIUM (3-4 images)',
            hard:   '⭐⭐⭐ Difficulty: HARD (4+ images)'
        };
        
        indicator.textContent = levels[this.difficulty];
        indicator.style.display = 'block';
    }
    
    showNarrativeHint() {
        if (this.consecutiveWrong >= 1) {
            const hintBox = document.getElementById('narrative-hint');
            hintBox.innerHTML = `<strong>💡 Narrative hint:</strong> ${this.currentSequence.narrative}`;
            hintBox.style.display = 'block';
            
            this.audioManager.speak(`Hint: ${this.currentSequence.narrative}`);
        } else {
            document.getElementById('narrative-hint').style.display = 'none';
        }
    }
    
    loadSequence() {
        this.selectedSequence = [];
        this.showFeedback = false;
        this.startSequenceTime = Date.now();
        
        this.currentSequence = this.selectNextSequence();
        
        document.getElementById('current-round').textContent = this.currentRound + 1;
        document.getElementById('total-rounds').textContent = this.totalQuestions;
        document.getElementById('sequence-title').textContent = this.currentSequence.title;
        
        this.audioManager.speak(this.currentSequence.title);
        
        const progress = ((this.currentRound + 1) / this.totalQuestions) * 100;
        document.getElementById('progress-fill').style.width = progress + '%';
        
        const sequenceDisplay = document.getElementById('sequence-display');
        sequenceDisplay.innerHTML = '';
        
        for (let i = 0; i < this.currentSequence.images.length; i++) {
            const item = document.createElement('div');
            item.className = 'sequence-item empty';
            item.textContent = '?';
            item.dataset.position = i;
            
            item.addEventListener('dragover', (e) => this.handleDragOver(e));
            item.addEventListener('drop', (e) => this.handleDrop(e));
            
            sequenceDisplay.appendChild(item);
        }
        
        const optionsDisplay = document.getElementById('options-display');
        optionsDisplay.innerHTML = '';
        
        const shuffledImages = [...this.currentSequence.images].sort(() => Math.random() - 0.5);
        
        shuffledImages.forEach((image, idx) => {
            const button = document.createElement('div');
            button.className = 'option-item';
            button.draggable = true;
            button.dataset.correctIndex = this.currentSequence.images.indexOf(image);
            button.title = image.desc;
            
            const img = document.createElement('img');
            img.src = image.src;
            img.alt = image.desc;
            button.appendChild(img);
            
            button.addEventListener('dragstart', (e) => this.handleDragStart(e, button));
            button.addEventListener('dragend', (e) => this.handleDragEnd(e));
            button.addEventListener('click', () => this.selectImage(button));
            
            optionsDisplay.appendChild(button);
        });
        
        document.getElementById('feedback').classList.remove('show');
        document.getElementById('ai-analysis').classList.remove('show');
        
        this.adjustDifficulty();
        this.showNarrativeHint();
    }
    
    handleDragStart(e, element) {
        this.draggedElement = element;
        element.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }
    
    handleDragEnd(e) {
        this.draggedElement = null;
        document.querySelectorAll('.option-item').forEach(el => {
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
        e.stopPropagation();
        
        if (this.draggedElement && !this.draggedElement.classList.contains('used')) {
            const position = parseInt(e.target.dataset.position) || parseInt(e.target.parentElement.dataset.position);
            const correctIndex = parseInt(this.draggedElement.dataset.correctIndex);
            
            if (!this.selectedSequence.includes(correctIndex)) {
                this.selectedSequence.push(correctIndex);
                this.draggedElement.classList.add('used');
                
                const sequenceDisplay = document.getElementById('sequence-display');
                const items = sequenceDisplay.querySelectorAll('.sequence-item');
                const currentIdx = this.selectedSequence.length - 1;
                
                if (items[currentIdx]) {
                    items[currentIdx].innerHTML = '';
                    const img = document.createElement('img');
                    img.src = this.currentSequence.images[correctIndex].src;
                    img.alt = this.currentSequence.images[correctIndex].desc;
                    items[currentIdx].appendChild(img);
                    
                    const number = document.createElement('div');
                    number.className = 'sequence-number';
                    number.textContent = currentIdx + 1;
                    items[currentIdx].appendChild(number);
                    items[currentIdx].classList.remove('empty');
                }
            }
        }
        
        return false;
    }
    
    selectImage(element) {
        if (element.classList.contains('used')) return;
        
        const correctIndex = parseInt(element.dataset.correctIndex);
        
        if (!this.selectedSequence.includes(correctIndex)) {
            this.selectedSequence.push(correctIndex);
            element.classList.add('used');
            
            const sequenceDisplay = document.getElementById('sequence-display');
            const items = sequenceDisplay.querySelectorAll('.sequence-item');
            const currentIdx = this.selectedSequence.length - 1;
            
            if (items[currentIdx]) {
                items[currentIdx].innerHTML = '';
                const img = document.createElement('img');
                img.src = this.currentSequence.images[correctIndex].src;
                img.alt = this.currentSequence.images[correctIndex].desc;
                items[currentIdx].appendChild(img);
                
                const number = document.createElement('div');
                number.className = 'sequence-number';
                number.textContent = currentIdx + 1;
                items[currentIdx].appendChild(number);
                items[currentIdx].classList.remove('empty');
            }
        }
    }
    
    resetSequence() {
        this.selectedSequence = [];
        this.audioManager.speak('Resetting sequence');
        this.loadSequence();
    }
    
    checkSequence() {
        if (this.selectedSequence.length !== this.currentSequence.images.length) {
            this.showFeedback = true;
            const feedbackElement = document.getElementById('feedback');
            feedbackElement.textContent = 'You must complete the entire sequence';
            feedbackElement.className = 'feedback incorrect show';
            this.audioManager.speak('You must complete the entire sequence');
            return;
        }
        
        this.reactionTime = (Date.now() - this.startSequenceTime) / 1000;
        
        const isCorrect = JSON.stringify(this.selectedSequence) === JSON.stringify(this.currentSequence.correct);
        
        const feedbackElement = document.getElementById('feedback');
        const feedbackText = document.getElementById('feedback-text');
        
        const sequenceKey = this.currentSequence.title;
        this.sequenceStats[sequenceKey].attempts++;
        this.sequenceStats[sequenceKey].avgTime = 
            (this.sequenceStats[sequenceKey].avgTime + this.reactionTime) / 2;
        
        if (isCorrect) {
            this.score += 20;
            this.consecutiveCorrect++;
            this.consecutiveWrong = 0;
            this.sequenceStats[sequenceKey].correct++;
            
            feedbackText.textContent = `Correct! 🎉 "${this.currentSequence.title}"`;
            feedbackElement.className = 'feedback correct show';
            this.audioManager.speak('Correct! Excellent work');
        } else {
            this.consecutiveWrong++;
            this.consecutiveCorrect = 0;
            this.sequenceStats[sequenceKey].mistakesPattern.push(this.selectedSequence);
            
            if (!this.confusingImages.includes(this.currentSequence.title)) {
                this.confusingImages.push(this.currentSequence.title);
            }
            
            feedbackText.textContent = `Not correct. Try again 😊`;
            feedbackElement.className = 'feedback incorrect show';
            this.audioManager.speak('Not correct. Try again');
        }
        
        document.getElementById('score').textContent = this.score + ' points';
        document.getElementById('score-display').textContent = this.score + ' points';
        
        this.adjustDifficulty();
        this.showAIAnalysis();
        
        setTimeout(() => {
            if (this.currentRound + 1 >= this.totalQuestions) {
                this.endGame();
            } else {
                this.currentRound++;
                this.loadSequence();
            }
        }, 2500);
    }
    
    showAIAnalysis() {
        const analysisEl = document.getElementById('ai-analysis');
        const analysisText = document.getElementById('analysis-text');
        
        let analysis = '';
        
        if (this.reactionTime < 5) {
            analysis += '⚡ Fast sequencing. ';
        } else if (this.reactionTime > 15) {
            analysis += '🤔 You need more time to process. ';
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
        
        analysisText.textContent = analysis || 'Sequencing in progress...';
        analysisEl.classList.add('show');
    }
    
    endGame() {
        const gameCard = document.querySelector('.game-card');
        const avgAccuracy = ((this.score / (this.totalQuestions * 20)) * 100).toFixed(1);
        const finalScore = this.narrativeScore.toFixed(0);
        
        let performanceMessage = 'Excellent narrative sequencing! 🏆';
        let audioMessage = 'Excellent narrative sequencing';
        
        if (avgAccuracy < 60) {
            performanceMessage = 'Keep practicing! Your narrative skills will improve. 💪';
            audioMessage = 'Keep practicing, your narrative skills will improve';
        } else if (avgAccuracy < 80) {
            performanceMessage = 'Great work! Your sequencing is improving. 🌟';
            audioMessage = 'Great work, your sequencing is improving';
        }
        
        this.audioManager.speak(audioMessage);
        
        gameCard.innerHTML = `
            <h2>Game Completed!</h2>
            <div style="font-size: 80px; margin: 30px 0;">🎉</div>
            
            <div style="background: linear-gradient(135deg, #0066CC 0%, #0099FF 100%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <div style="font-size: 24px; font-weight: 700; margin-bottom: 10px;">Your final score: ${this.score} points</div>
                <div style="font-size: 18px; opacity: 0.9;">Accuracy: ${avgAccuracy}%</div>
            </div>

            <div style="background: rgba(0, 102, 204, 0.1); border-left: 4px solid #0066CC; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left; color: #1F2937; font-size: 14px;">
                <strong>📊 Final AI Analysis - Narrative Sequencing:</strong>
                <div style="margin-top: 10px; line-height: 1.8;">
                    <div>✓ Sequencing score: ${finalScore}%</div>
                    <div>✓ Average response time: ${(this.reactionTime.toFixed(2))}s</div>
                    <div>✓ Confusing sequences: ${this.confusingImages.length > 0 ? this.confusingImages.slice(0, 2).join(', ') : 'None'}</div>
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
    const game = new AISequenceGame();
    
    window.checkSequence = () => game.checkSequence();
    window.resetSequence = () => game.resetSequence();
    window.goToMainPage = () => game.goToMainPage();
});