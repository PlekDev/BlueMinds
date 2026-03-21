// ===== ÁUDIO MANAGER =====
class AudioManager {
    constructor() { this.synth = window.speechSynthesis; this.audioEnabled = true; }
    speak(text, rate = 1) {
        if (!this.audioEnabled) return;
        this.synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = rate; u.pitch = 1.0; u.volume = 1.0; u.lang = 'pt-BR';
        this.synth.speak(u);
    }
    toggleAudio() { this.audioEnabled = !this.audioEnabled; return this.audioEnabled; }
}

// ===== SISTEMA DE IA ADAPTATIVO PARA SEQUENCIAÇÃO NARRATIVA =====
class AISequenceGame {
    constructor() {
        this.currentRound = 0;
        this.score = 0;
        this.selectedSequence = [];
        this.showFeedback = false;
        this.draggedElement = null;
        this.audioManager = new AudioManager();

        this.narrativeScore = 0;
        this.difficulty = 'easy';
        this.consecutiveCorrect = 0;
        this.consecutiveWrong = 0;
        this.totalQuestions = 5;

        this.sequenceStats = {};
        this.confusingImages = [];
        this.reactionTimes = [];
        this.startSequenceTime = 0;

        this.allSequences = {
            easy: [
                {
                    images: [
                        { src: "https://static.vecteezy.com/system/resources/previews/017/076/256/original/boy-waking-up-yawning-cartoon-vector.jpg", desc: "Menino acordando na cama" },
                        { src: "https://img.freepik.com/vector-premium/nino-feliz-desayunando-colorida-ilustracion-vectorial-al-estilo-dibujos-animados_1322206-39435.jpg", desc: "Tomando café da manhã" },
                        { src: "https://st2.depositphotos.com/2945617/8585/v/950/depositphotos_85856074-stock-illustration-little-boy-going-to-school.jpg", desc: "Menino na escola" }
                    ],
                    correct: [0, 1, 2],
                    title: "A Manhã",
                    narrative: "Primeiro acordamos, depois tomamos café da manhã e finalmente vamos para a escola.",
                    complexity: 1
                },
                {
                    images: [
                        { src: "https://tse4.mm.bing.net/th/id/OIP.xMwDxflkWqaKagRuOp1hZAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Nuvem de chuva" },
                        { src: "https://tse3.mm.bing.net/th/id/OIP.FAMR-s9zad_LslQlDT9gDQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Poças de água" },
                        { src: "https://tse2.mm.bing.net/th/id/OIP.t2COZIcOmALI7sa9CeRsfQHaG5?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Arco-íris no céu" }
                    ],
                    correct: [0, 1, 2],
                    title: "Depois da Chuva",
                    narrative: "Primeiro chove, formam-se poças e depois aparece um arco-íris.",
                    complexity: 1
                },
                {
                    images: [
                        { src: "https://static.vecteezy.com/system/resources/previews/024/778/157/non_2x/seed-with-sprouted-sprout-isolated-cartoon-illustration-concept-of-gardening-and-sowing-vector.jpg", desc: "Semente na terra" },
                        { src: "https://tse2.mm.bing.net/th/id/OIP.a2tNbGqI4G98OE6yJv-wEAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Plantinha crescendo" },
                        { src: "https://tse3.mm.bing.net/th/id/OIP.bcBuWNMwvSZF6uOdADg29gHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Flor completamente aberta" }
                    ],
                    correct: [0, 1, 2],
                    title: "Crescimento de uma Flor",
                    narrative: "Primeiro plantamos a semente, depois ela cresce como uma mudinha e finalmente floresce.",
                    complexity: 1
                }
            ],
            medium: [
                {
                    images: [
                        { src: "https://c8.alamy.com/comp/2M0HW0Y/baking-ingredients-isolated-cartoon-vector-illustration-cooking-ingredients-preparing-food-at-home-close-up-set-of-products-view-from-above-homemade-pastry-home-kitchen-vector-cartoon-2M0HW0Y.jpg", desc: "Ingredientes para assar" },
                        { src: "https://tse1.mm.bing.net/th/id/OIP.mStS74GCKGvdTpsFDNxhfwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Misturando ingredientes" },
                        { src: "https://media.istockphoto.com/id/847089908/es/vector/pastel-en-el-horno-hvector-dibujos-animados.jpg?s=612x612&w=is&k=20&c=0HeOwc26coQNYFCkETUa75sDCOjqRnZzMEvBG1kxAsU=", desc: "Bolo no forno" },
                        { src: "https://png.pngtree.com/png-clipart/20220430/original/pngtree-birthday-cake-cartoon-vector-illustration-png-image_7597943.png", desc: "Bolo pronto e delicioso" }
                    ],
                    correct: [0, 1, 2, 3],
                    title: "Fazer um Bolo",
                    narrative: "Primeiro preparamos os ingredientes, misturamos, assamos e finalmente temos um bolo delicioso.",
                    complexity: 2
                },
                {
                    images: [
                        { src: "https://tse1.mm.bing.net/th/id/OIP.KzGzpzjsBBdyEh-zjkgUpQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Lagarta pequena" },
                        { src: "https://tse3.mm.bing.net/th/id/OIP.lV2ReNOe6gdmf-egtADD-AHaI7?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Casulo da metamorfose" },
                        { src: "https://static.vecteezy.com/system/resources/previews/010/337/273/original/cartoon-colourful-butterfly-character-welcoming-hands-gesture-butterfly-with-beuatifil-wing-pattern-png.png", desc: "Borboleta bonita voando" }
                    ],
                    correct: [0, 1, 2],
                    title: "Ciclo da Borboleta",
                    narrative: "A lagarta vira casulo e depois se transforma em uma linda borboleta.",
                    complexity: 2
                }
            ],
            hard: [
                {
                    images: [
                        { src: "https://img.freepik.com/vector-premium/lindo-huevo-gallina-feliz-personaje-animado-huevo-gallina-concepto-pascua_92289-1205.jpg?w=2000o", desc: "Ovo de galinha" },
                        { src: "https://tse1.mm.bing.net/th/id/OIP.-UsPwYf55VTgxb6OyhbMMQHaHJ?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Pintinho recém-nascido" },
                        { src: "https://tse1.mm.bing.net/th/id/OIP.4il2Ne-LrqPmpksaW96T_AHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Frango adulto" },
                        { src: "https://thumbs.dreamstime.com/b/la-gallina-linda-anaranjada-est%C3%A1-poniendo-los-huevos-en-el-ejemplo-plano-del-vector-de-historieta-jerarqu%C3%ADa-aislado-fondo-blanco-109469709.jpg", desc: "Galinha botando ovos" }
                    ],
                    correct: [0, 1, 2, 3],
                    title: "Ciclo de Vida da Galinha",
                    narrative: "O ovo vira pintinho, depois frango adulto e finalmente a galinha bota novos ovos.",
                    complexity: 3
                },
                {
                    images: [
                        { src: "https://tse4.mm.bing.net/th/id/OIP.i9DsDzYnHNuRbMS1Xrjc_AHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Moeda na mão" },
                        { src: "https://img.freepik.com/vector-premium/ilustracion-dibujos-animados-bonita-ahorrando-dinero-usando-alcancia_869472-1101.jpg?w=2000", desc: "Depositando no banco" },
                        { src: "https://tse1.mm.bing.net/th/id/OIP.0hUNQY1KWP1Ir5vroY_bSAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Tempo passando" },
                        { src: "https://tse3.mm.bing.net/th/id/OIP.CPVijvshD_czEmmRwkf98wHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Dinheiro com juros" }
                    ],
                    correct: [0, 1, 2, 3],
                    title: "Guardar Dinheiro",
                    narrative: "Guardamos moedas, depositamos no banco, esperamos e nosso dinheiro cresce.",
                    complexity: 3
                }
            ]
        };

        Object.values(this.allSequences).forEach(sequences => {
            sequences.forEach(seq => {
                this.sequenceStats[seq.title] = { attempts: 0, correct: 0, avgTime: 0, mistakesPattern: [] };
            });
        });

        this.loadSequence();
    }

    selectNextSequence() {
        const sequencesForDifficulty = this.allSequences[this.difficulty];
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
        if (this.consecutiveCorrect >= 3 && this.narrativeScore >= 80) {
            if (this.difficulty === 'easy') this.difficulty = 'medium';
            else if (this.difficulty === 'medium') this.difficulty = 'hard';
        } else if (this.consecutiveWrong >= 2 || this.narrativeScore < 50) {
            if (this.difficulty === 'hard') this.difficulty = 'medium';
            else if (this.difficulty === 'medium') this.difficulty = 'easy';
            this.consecutiveWrong = 0;
        }
        this.showDifficultyIndicator();
    }

    showDifficultyIndicator() {
        const indicator = document.getElementById('difficulty-indicator');
        const levels = {
            easy: '⭐ Dificuldade: FÁCIL (3 imagens)',
            medium: '⭐⭐ Dificuldade: MÉDIO (3-4 imagens)',
            hard: '⭐⭐⭐ Dificuldade: DIFÍCIL (4+ imagens)'
        };
        indicator.textContent = levels[this.difficulty];
        indicator.style.display = 'block';
    }

    showNarrativeHint() {
        if (this.consecutiveWrong >= 1) {
            const hintBox = document.getElementById('narrative-hint');
            hintBox.innerHTML = `<strong>💡 Dica narrativa:</strong> ${this.currentSequence.narrative}`;
            hintBox.style.display = 'block';
            this.audioManager.speak(`Dica: ${this.currentSequence.narrative}`);
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
        shuffledImages.forEach(image => {
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
        document.querySelectorAll('.option-item').forEach(el => el.classList.remove('dragging'));
    }

    handleDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; return false; }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.draggedElement && !this.draggedElement.classList.contains('used')) {
            const correctIndex = parseInt(this.draggedElement.dataset.correctIndex);
            if (!this.selectedSequence.includes(correctIndex)) {
                this.selectedSequence.push(correctIndex);
                this.draggedElement.classList.add('used');
                const items = document.getElementById('sequence-display').querySelectorAll('.sequence-item');
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
            const items = document.getElementById('sequence-display').querySelectorAll('.sequence-item');
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
        this.audioManager.speak('Reiniciando sequência');
        this.loadSequence();
    }

    checkSequence() {
        if (this.selectedSequence.length !== this.currentSequence.images.length) {
            const feedbackElement = document.getElementById('feedback');
            feedbackElement.textContent = 'Você deve completar toda a sequência';
            feedbackElement.className = 'feedback incorrect show';
            this.audioManager.speak('Você deve completar toda a sequência');
            return;
        }

        this.reactionTime = (Date.now() - this.startSequenceTime) / 1000;
        const isCorrect = JSON.stringify(this.selectedSequence) === JSON.stringify(this.currentSequence.correct);
        const feedbackElement = document.getElementById('feedback');
        const feedbackText = document.getElementById('feedback-text');
        const sequenceKey = this.currentSequence.title;
        this.sequenceStats[sequenceKey].attempts++;
        this.sequenceStats[sequenceKey].avgTime = (this.sequenceStats[sequenceKey].avgTime + this.reactionTime) / 2;

        if (isCorrect) {
            this.score += 20;
            this.consecutiveCorrect++;
            this.consecutiveWrong = 0;
            this.sequenceStats[sequenceKey].correct++;
            feedbackText.textContent = `Correto! 🎉 "${this.currentSequence.title}"`;
            feedbackElement.className = 'feedback correct show';
            this.audioManager.speak('Correto! Excelente trabalho');
        } else {
            this.consecutiveWrong++;
            this.consecutiveCorrect = 0;
            this.sequenceStats[sequenceKey].mistakesPattern.push(this.selectedSequence);
            if (!this.confusingImages.includes(this.currentSequence.title)) {
                this.confusingImages.push(this.currentSequence.title);
            }
            feedbackText.textContent = `Não está correto. Tente novamente 😊`;
            feedbackElement.className = 'feedback incorrect show';
            this.audioManager.speak('Não está correto. Tente novamente');
        }

        document.getElementById('score').textContent = this.score + ' pontos';
        document.getElementById('score-display').textContent = this.score + ' pontos';

        this.adjustDifficulty();
        this.showAIAnalysis();

        setTimeout(() => {
            if (this.currentRound + 1 >= this.totalQuestions) this.endGame();
            else { this.currentRound++; this.loadSequence(); }
        }, 2500);
    }

    showAIAnalysis() {
        const analysisEl = document.getElementById('ai-analysis');
        const analysisText = document.getElementById('analysis-text');
        let analysis = '';
        if (this.reactionTime < 5) analysis += '⚡ Sequenciação rápida. ';
        else if (this.reactionTime > 15) analysis += '🤔 Você precisa de mais tempo para processar. ';
        if (this.consecutiveCorrect > 0) analysis += `✅ ${this.consecutiveCorrect} acerto(s) seguido(s). `;
        if (this.consecutiveWrong > 0) analysis += `❌ ${this.consecutiveWrong} erro(s) seguido(s). `;
        if (this.difficulty === 'hard') analysis += '📈 Nível: DIFÍCIL. ';
        else if (this.difficulty === 'easy') analysis += '📉 Nível: FÁCIL. ';
        else analysis += '➡️ Nível: MÉDIO. ';
        analysisText.textContent = analysis || 'Sequenciação em desenvolvimento...';
        analysisEl.classList.add('show');
    }

    endGame() {
        const gameCard = document.querySelector('.game-card');
        const avgAccuracy = ((this.score / (this.totalQuestions * 20)) * 100).toFixed(1);
        const finalScore = this.narrativeScore.toFixed(0);

        let performanceMessage = 'Excelente sequenciação narrativa! 🏆';
        let audioMessage = 'Excelente sequenciação narrativa';
        if (avgAccuracy < 60) { performanceMessage = 'Continue praticando! A narrativa vai melhorar. 💪'; audioMessage = 'Continue praticando, a narrativa vai melhorar'; }
        else if (avgAccuracy < 80) { performanceMessage = 'Muito bom trabalho! Sua sequenciação está melhorando. 🌟'; audioMessage = 'Muito bom trabalho, sua sequenciação está melhorando'; }

        this.audioManager.speak(audioMessage);

        gameCard.innerHTML = `
            <h2>Jogo Concluído!</h2>
            <div style="font-size: 80px; margin: 30px 0;">🎉</div>
            <div style="background: linear-gradient(135deg, #0066CC 0%, #0099FF 100%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <div style="font-size: 24px; font-weight: 700; margin-bottom: 10px;">Sua pontuação final: ${this.score} pontos</div>
                <div style="font-size: 18px; opacity: 0.9;">Precisão: ${avgAccuracy}%</div>
            </div>
            <div style="background: rgba(0, 102, 204, 0.1); border-left: 4px solid #0066CC; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left; color: #1F2937; font-size: 14px;">
                <strong>📊 Análise Final de IA - Sequenciação Narrativa:</strong>
                <div style="margin-top: 10px; line-height: 1.8;">
                    <div>✓ Pontuação de sequenciação: ${finalScore}%</div>
                    <div>✓ Tempo médio de resposta: ${this.reactionTime.toFixed(2)}s</div>
                    <div>✓ Sequências confusas: ${this.confusingImages.length > 0 ? this.confusingImages.slice(0, 2).join(', ') : 'Nenhuma'}</div>
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

    goToMainPage() { window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-visual.html'; }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new AISequenceGame();
    window.checkSequence = () => game.checkSequence();
    window.resetSequence = () => game.resetSequence();
    window.goToMainPage = () => game.goToMainPage();
});