// ===== SISTEMA DE IA ADAPTATIVO PARA CLASSIFICAÇÃO =====
class AIClassificationGame {
    constructor() {
        this.currentRound = 0;
        this.score = 0;
        this.currentPuzzle = null;
        this.showFeedback = false;

        this.classificationScore = 0;
        this.difficulty = 'easy';
        this.consecutiveCorrect = 0;
        this.consecutiveWrong = 0;
        this.totalQuestions = 5;

        this.distractorsSelected = {};
        this.confusingItems = [];
        this.categoryStats = {};
        this.preferredInterests = {};

        this.allPuzzles = {
            easy: [
                {
                    name: "animais_comida_roupas",
                    categories: {
                        animals: { name: '🐾 Animais', color: '#0066CC', items: ['🐱', '🐕', '🐻'] },
                        food: { name: '🍎 Comida', color: '#00B4D8', items: ['🍕', '🍎', '🥕'] },
                        clothes: { name: '👕 Roupas', color: '#0099FF', items: ['👔', '👗', '👟'] }
                    },
                    distractors: ['🌟', '⭐', '☀️'],
                    interest: "general"
                },
                {
                    name: "animais_frutas_sapatos",
                    categories: {
                        animals: { name: '🐾 Mascotes', color: '#0066CC', items: ['🐶', '🐱', '🐰'] },
                        food: { name: '🍎 Frutas', color: '#00B4D8', items: ['🍌', '🍊', '🍇'] },
                        clothes: { name: '👠 Sapatos', color: '#0099FF', items: ['👞', '👟', '🩴'] }
                    },
                    distractors: ['🎨', '🎭', '🎪'],
                    interest: "general"
                }
            ],
            medium: [
                {
                    name: "animais_comida_acessorios",
                    categories: {
                        animals: { name: '🐾 Animais', color: '#0066CC', items: ['🦁', '🐘', '🦒'] },
                        food: { name: '🍔 Comida', color: '#00B4D8', items: ['🍔', '🌭', '🍟'] },
                        clothes: { name: '⌚ Acessórios', color: '#0099FF', items: ['👓', '⌚', '👜'] }
                    },
                    distractors: ['🚗', '✈️', '🚢'],
                    interest: "general"
                },
                {
                    name: "aves_legumes_pecas",
                    categories: {
                        animals: { name: '🦅 Aves', color: '#0066CC', items: ['🦅', '🦆', '🦉'] },
                        food: { name: '🥬 Legumes', color: '#00B4D8', items: ['🥬', '🌽', '🥒'] },
                        clothes: { name: '🧥 Peças', color: '#0099FF', items: ['🧥', '👖', '🧢'] }
                    },
                    distractors: ['🎸', '🎹', '🎺'],
                    interest: "general"
                }
            ],
            hard: [
                {
                    name: "animais_marinhos_sobremesa_roupa_formal",
                    categories: {
                        animals: { name: '🐠 Marinhos', color: '#0066CC', items: ['🐠', '🐙', '🦈'] },
                        food: { name: '🍰 Sobremesas', color: '#00B4D8', items: ['🍰', '🍪', '🍩'] },
                        clothes: { name: '🤵 Formal', color: '#0099FF', items: ['🤵', '👰', '🎩'] }
                    },
                    distractors: ['💎', '👑', '🔱'],
                    interest: "sophisticated"
                },
                {
                    name: "insetos_bebidas_esportes",
                    categories: {
                        animals: { name: '🦋 Insetos', color: '#0066CC', items: ['🦋', '🐛', '🐝'] },
                        food: { name: '🥤 Bebidas', color: '#00B4D8', items: ['🥤', '🍷', '☕'] },
                        clothes: { name: '⚽ Esportes', color: '#0099FF', items: ['⚽', '🏀', '🎾'] }
                    },
                    distractors: ['🌴', '🌲', '🌳'],
                    interest: "sports"
                }
            ]
        };

        this.initializeStats();
        this.loadPuzzle();
    }

    initializeStats() {
        Object.values(this.allPuzzles).forEach(puzzles => {
            puzzles.forEach(puzzle => {
                Object.keys(puzzle.categories).forEach(categoryKey => {
                    const category = puzzle.categories[categoryKey];
                    this.categoryStats[category.name] = { attempts: 0, correct: 0, errors: [] };
                });
                this.preferredInterests[puzzle.interest] = 0;
            });
        });
    }

    selectNextPuzzle() {
        const puzzlesForDifficulty = this.allPuzzles[this.difficulty];
        const problematicPuzzles = puzzlesForDifficulty.filter(puzzle => {
            return !Object.keys(puzzle.categories).every(key => {
                const stats = this.categoryStats[puzzle.categories[key].name];
                return stats && stats.correct > 0;
            });
        });
        if (problematicPuzzles.length > 0 && Math.random() > 0.4) {
            return problematicPuzzles[Math.floor(Math.random() * problematicPuzzles.length)];
        }
        return puzzlesForDifficulty[Math.floor(Math.random() * puzzlesForDifficulty.length)];
    }

    adjustDifficulty() {
        this.classificationScore = (this.score / (this.totalQuestions * 30)) * 100;
        if (this.consecutiveCorrect >= 3 && this.classificationScore >= 80) {
            if (this.difficulty === 'easy') { this.difficulty = 'medium'; audioManager.speak('Aumentando dificuldade para nível médio', 0.9); }
            else if (this.difficulty === 'medium') { this.difficulty = 'hard'; audioManager.speak('Aumentando dificuldade para nível difícil', 0.9); }
        } else if (this.consecutiveWrong >= 2 || this.classificationScore < 50) {
            if (this.difficulty === 'hard') { this.difficulty = 'medium'; audioManager.speak('Reduzindo dificuldade para nível médio', 0.9); }
            else if (this.difficulty === 'medium') { this.difficulty = 'easy'; audioManager.speak('Reduzindo dificuldade para nível fácil', 0.9); }
            this.consecutiveWrong = 0;
        }
        this.showDifficultyIndicator();
    }

    showDifficultyIndicator() {
        const indicator = document.getElementById('difficulty-indicator');
        const numDistracters = this.difficulty === 'easy' ? 2 : (this.difficulty === 'medium' ? 3 : 4);
        const levels = {
            easy: `⭐ Dificuldade: FÁCIL (${numDistracters} distratores)`,
            medium: `⭐⭐ Dificuldade: MÉDIO (${numDistracters} distratores)`,
            hard: `⭐⭐⭐ Dificuldade: DIFÍCIL (${numDistracters} distratores)`
        };
        indicator.textContent = levels[this.difficulty];
        indicator.style.display = 'block';
    }

    detectConfusion() {
        if (this.consecutiveWrong >= 1 && this.confusingItems.length > 0) {
            const hintBox = document.getElementById('audio-hint');
            const confusingItem = this.confusingItems[this.confusingItems.length - 1];
            const hints = [
                `💡 Dica: "${confusingItem}" pertence à categoria principal do seu grupo`,
                `💡 Dica: Pense na função principal de "${confusingItem}"`,
                `💡 Dica: "${confusingItem}" é mais parecido com elementos da mesma cor`
            ];
            const selectedHint = hints[Math.floor(Math.random() * hints.length)];
            hintBox.textContent = selectedHint;
            hintBox.style.display = 'block';
            audioManager.speak(selectedHint.replace('💡 Dica: ', ''), 0.9);
        } else {
            document.getElementById('audio-hint').style.display = 'none';
        }
    }

    loadPuzzle() {
        this.showFeedback = false;
        const selectedPuzzle = this.selectNextPuzzle();
        this.currentPuzzle = {
            data: selectedPuzzle,
            categories: JSON.parse(JSON.stringify(selectedPuzzle.categories)),
            allItems: []
        };

        Object.keys(this.currentPuzzle.categories).forEach(key => {
            this.currentPuzzle.allItems.push(...this.currentPuzzle.categories[key].items);
            this.currentPuzzle.categories[key].items = [];
        });

        this.currentPuzzle.allItems.push(...selectedPuzzle.distractors);
        this.currentPuzzle.allItems.sort(() => Math.random() - 0.5);

        document.getElementById('current-round').textContent = this.currentRound + 1;
        document.getElementById('total-rounds').textContent = this.totalQuestions;
        document.getElementById('progress-fill').style.width = `${((this.currentRound + 1) / this.totalQuestions) * 100}%`;

        this.renderCategories();
        this.renderItems();

        document.getElementById('feedback').classList.remove('show');
        document.getElementById('ai-analysis').classList.remove('show');

        this.adjustDifficulty();
        this.detectConfusion();
        audioManager.speak(`Rodada ${this.currentRound + 1}. Agrupe os emojis por categoria`, 1);
    }

    renderCategories() {
        const container = document.getElementById('categories-container');
        container.innerHTML = '';

        Object.keys(this.currentPuzzle.categories).forEach(categoryKey => {
            const category = this.currentPuzzle.categories[categoryKey];
            const categoryBox = document.createElement('div');
            categoryBox.className = 'category-box';
            categoryBox.dataset.category = categoryKey;
            categoryBox.addEventListener('dragover', (e) => this.handleDragOver(e));
            categoryBox.addEventListener('drop', (e) => this.handleDrop(e, categoryKey));

            categoryBox.innerHTML = `
                <div class="category-title" style="background: linear-gradient(135deg, ${category.color} 0%, ${this.lightenColor(category.color)} 100%);">${category.name}</div>
                <div class="category-items" id="category-${categoryKey}">
                    ${category.items.map((item, idx) => `<div class="item-emoji" onclick="window.game.removeItemFromCategory('${categoryKey}', ${idx})" title="Clique para remover">${item}</div>`).join('')}
                </div>
            `;
            container.appendChild(categoryBox);
        });
    }

    handleDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; return false; }
    handleDrop(e, categoryKey) {
        e.preventDefault();
        const item = e.dataTransfer.getData('text/plain');
        this.addItemToCategory(item, categoryKey);
        return false;
    }

    renderItems() {
        const pool = document.getElementById('items-pool');
        pool.innerHTML = '';
        const usedItems = new Set();
        Object.keys(this.currentPuzzle.categories).forEach(key => {
            this.currentPuzzle.categories[key].items.forEach(item => usedItems.add(item));
        });

        this.currentPuzzle.allItems.forEach(item => {
            if (!usedItems.has(item)) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'draggable-item';
                itemDiv.textContent = item;
                itemDiv.draggable = true;
                itemDiv.dataset.item = item;
                itemDiv.addEventListener('dragstart', (e) => this.handleDragStart(e, item));
                itemDiv.addEventListener('dragend', (e) => this.handleDragEnd(e));
                pool.appendChild(itemDiv);
            }
        });
    }

    handleDragStart(e, item) { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', item); e.target.style.opacity = '0.5'; }
    handleDragEnd(e) { e.target.style.opacity = '1'; }

    addItemToCategory(item, categoryKey) {
        if (!this.currentPuzzle.categories[categoryKey].items.includes(item)) {
            this.currentPuzzle.categories[categoryKey].items.push(item);
            const isInCorrectCategory = this.currentPuzzle.data.categories[categoryKey].items.includes(item);
            if (!isInCorrectCategory) {
                this.distractorsSelected[item] = (this.distractorsSelected[item] || 0) + 1;
                this.confusingItems.push(item);
            }
            this.renderCategories();
            this.renderItems();
        }
    }

    removeItemFromCategory(categoryKey, index) {
        this.currentPuzzle.categories[categoryKey].items.splice(index, 1);
        this.renderCategories();
        this.renderItems();
    }

    resetClassification() {
        Object.keys(this.currentPuzzle.categories).forEach(key => { this.currentPuzzle.categories[key].items = []; });
        this.confusingItems = [];
        this.renderCategories();
        this.renderItems();
    }

    checkClassification() {
        let allCorrect = true;
        Object.keys(this.currentPuzzle.categories).forEach(key => {
            const currentItems = this.currentPuzzle.categories[key].items;
            const correctItems = this.currentPuzzle.data.categories[key].items;
            if (JSON.stringify(currentItems.sort()) !== JSON.stringify(correctItems.sort())) allCorrect = false;
        });

        const feedbackElement = document.getElementById('feedback');
        const feedbackText = document.getElementById('feedback-text');

        if (allCorrect) {
            this.score += 30;
            this.consecutiveCorrect++;
            this.consecutiveWrong = 0;
            feedbackText.textContent = 'Perfeito! Todas as classificações estão corretas 🎉';
            feedbackElement.className = 'feedback correct show';
            audioManager.speak('Perfeito. Todas as classificações estão corretas', 0.95);
            this.playSuccessSound();
        } else {
            this.consecutiveWrong++;
            this.consecutiveCorrect = 0;
            feedbackText.textContent = 'Alguns itens não estão na categoria correta. Tente novamente 😊';
            feedbackElement.className = 'feedback incorrect show';
            audioManager.speak('Alguns itens não estão na categoria correta. Tente novamente', 0.95);
        }

        document.getElementById('score').textContent = this.score + ' pontos';
        document.getElementById('score-display').textContent = this.score + ' pontos';
        this.adjustDifficulty();
        this.detectConfusion();
        this.showAIAnalysis();

        setTimeout(() => {
            if (this.currentRound + 1 >= this.totalQuestions) this.endGame();
            else { this.currentRound++; this.loadPuzzle(); }
        }, 2500);
    }

    playSuccessSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            [523, 659, 784].forEach((freq, idx) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start(audioContext.currentTime + idx * 0.1);
                oscillator.stop(audioContext.currentTime + idx * 0.1 + 0.2);
            });
        } catch(e) {}
    }

    showAIAnalysis() {
        const analysisEl = document.getElementById('ai-analysis');
        const analysisText = document.getElementById('analysis-text');
        let analysis = '';
        if (Object.keys(this.distractorsSelected).length > 0) {
            const topDistractor = Object.entries(this.distractorsSelected).sort((a, b) => b[1] - a[1])[0];
            analysis += `🚫 Distrator frequente: "${topDistractor[0]}". `;
        }
        if (this.consecutiveCorrect > 0) analysis += `✅ ${this.consecutiveCorrect} classificação(ões) perfeita(s). `;
        if (this.consecutiveWrong > 0) analysis += `❌ ${this.consecutiveWrong} erro(s) seguido(s). `;
        if (this.difficulty === 'hard') analysis += '📈 Nível: DIFÍCIL. ';
        else if (this.difficulty === 'easy') analysis += '📉 Nível: FÁCIL. ';
        else analysis += '➡️ Nível: MÉDIO. ';
        analysisText.textContent = analysis || 'Classificação em desenvolvimento...';
        analysisEl.classList.add('show');
    }

    endGame() {
        const gameCard = document.querySelector('.game-card');
        const avgAccuracy = ((this.score / (this.totalQuestions * 30)) * 100).toFixed(1);
        const finalScore = this.classificationScore.toFixed(0);

        let performanceMessage = 'Excelente classificação! 🏆';
        let performanceAudio = 'Excelente classificação';
        if (avgAccuracy < 60) { performanceMessage = 'Continue praticando! A classificação vai melhorar. 💪'; performanceAudio = 'Continue praticando, a classificação vai melhorar'; }
        else if (avgAccuracy < 80) { performanceMessage = 'Muito bom trabalho! Sua classificação está melhorando. 🌟'; performanceAudio = 'Muito bom trabalho, sua classificação está melhorando'; }

        audioManager.speak(`Jogo concluído. Pontuação: ${this.score} pontos. Precisão: ${avgAccuracy} por cento. ${performanceAudio}`, 0.95);

        gameCard.innerHTML = `
            <h2>Jogo Concluído!</h2>
            <div style="font-size: 80px; margin: 30px 0;">🎉</div>
            <div style="background: linear-gradient(135deg, #0066CC 0%, #0099FF 100%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <div style="font-size: 24px; font-weight: 700; margin-bottom: 10px;">Sua pontuação final: ${this.score} pontos</div>
                <div style="font-size: 18px; opacity: 0.9;">Precisão: ${avgAccuracy}%</div>
            </div>
            <div style="background: rgba(0, 102, 204, 0.1); border-left: 4px solid #0066CC; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left; color: #1F2937; font-size: 14px;">
                <strong>📊 Análise Final de IA - Classificação:</strong>
                <div style="margin-top: 10px; line-height: 1.8;">
                    <div>✓ Pontuação de classificação: ${finalScore}%</div>
                    <div>✓ Distratores que confundiram: ${Object.keys(this.distractorsSelected).length}</div>
                    <div>✓ Itens problemáticos: ${this.confusingItems.length > 0 ? this.confusingItems.slice(0, 3).join(', ') : 'Nenhum'}</div>
                    <div>✓ Nível final: ${this.difficulty.toUpperCase()}</div>
                </div>
            </div>
            <div style="color: var(--primary-blue); font-size: 18px; font-weight: 600; margin: 15px 0;">${performanceMessage}</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px;">
                <button style="background: linear-gradient(135deg, #0066CC 0%, #0099FF 100%); color: white; padding: 15px; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer;" onclick="location.reload()">Jogar Novamente</button>
                <button style="background-color: #00B4D8; color: white; padding: 15px; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer;" onclick="goToMainPage()">Voltar ao Menu</button>
            </div>
        `;
    }

    lightenColor(color) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = 30;
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R : 255) * 0x10000 + (G < 255 ? G : 255) * 0x100 + (B < 255 ? B : 255)).toString(16).slice(1);
    }

    goToMainPage() { window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-visual.html'; }
}

let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new AIClassificationGame();
    window.game = game;
    window.goToMainPage = () => game.goToMainPage();
});