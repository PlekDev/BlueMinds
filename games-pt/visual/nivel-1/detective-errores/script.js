// ===== SISTEMA DE IA ADAPTATIVO PARA CONSTRUÇÃO SINTÁTICA COM ÁUDIO =====

class AudioManager {
    constructor() {
        this.synth = window.speechSynthesis;
        this.isSpeaking = false;
        this.audioEnabled = true;
    }

    speak(text, rate = 1, pitch = 1) {
        if (!this.audioEnabled) return;
        this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.lang = 'pt-BR';
        utterance.onstart = () => { this.isSpeaking = true; };
        utterance.onend = () => { this.isSpeaking = false; };
        utterance.onerror = () => { this.isSpeaking = false; };
        this.synth.speak(utterance);
    }

    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        return this.audioEnabled;
    }
}

class AISyntaxGame {
    constructor() {
        this.currentRound = 0;
        this.score = 0;
        this.currentSentence = null;
        this.selectedWords = [];
        this.showFeedback = false;
        this.audioManager = new AudioManager();

        this.syntaxScore = 0;
        this.difficulty = 'easy';
        this.consecutiveCorrect = 0;
        this.consecutiveWrong = 0;
        this.attentionTime = 0;
        this.startTime = 0;

        this.syntaxErrors = {
            wrongOrder: 0,
            wrongWord: 0,
            inversionPattern: false,
            blockedWords: []
        };

        this.wordStats = {};
        this.sentenceStats = {};

        this.difficultyLevels = {
            easy: { wordCount: 3, examples: true },
            medium: { wordCount: 4, examples: false },
            hard: { wordCount: 5, examples: false }
        };

        this.sentences = [
            {
                words: ["O", "gato", "dorme"],
                correct: ["O", "gato", "dorme"],
                complexity: 'easy',
                type: 'SVO',
                image: "🐱💤",
                audioDescription: "Aparece um gato. Qual é o animal na imagem?",
                audioInstruction: "Monte a frase correta clicando nas palavras na ordem adequada"
            },
            {
                words: ["cachorro", "O", "corre"],
                correct: ["O", "cachorro", "corre"],
                complexity: 'easy',
                type: 'SV',
                image: "🐕",
                audioDescription: "Aparece um cachorro. Qual é esse animal?",
                audioInstruction: "Clique nas palavras para formar: O cachorro corre"
            },
            {
                words: ["voa", "pássaro", "O"],
                correct: ["O", "pássaro", "voa"],
                complexity: 'easy',
                type: 'SV',
                image: "🦅",
                audioDescription: "Aparece um pássaro voando. Que animal você vê?",
                audioInstruction: "Ordene as palavras para dizer que o pássaro voa"
            },
            {
                words: ["menina", "come", "A", "maçã"],
                correct: ["A", "menina", "come", "maçã"],
                complexity: 'medium',
                type: 'SVO',
                image: "👧🍎",
                audioDescription: "Aparece uma menina comendo uma maçã. Quem aparece na imagem?",
                audioInstruction: "Monte a frase com quatro palavras sobre a menina"
            },
            {
                words: ["bonita", "Uma", "casa", "é"],
                correct: ["Uma", "casa", "é", "bonita"],
                complexity: 'medium',
                type: 'SVC',
                image: "🏠",
                audioDescription: "Aparece uma casa. Como é essa casa?",
                audioInstruction: "Complete a frase sobre as características da casa"
            },
            {
                words: ["crianças", "parque", "As", "no", "brincam"],
                correct: ["As", "crianças", "brincam", "no", "parque"],
                complexity: 'hard',
                type: 'SVLP',
                image: "👦🛝👦",
                audioDescription: "Aparecem crianças brincando no parque. Onde estão brincando?",
                audioInstruction: "Monte a frase de cinco palavras sobre onde as crianças brincam"
            }
        ];

        this.totalRounds = 5;

        this.sentences.forEach(sent => {
            this.sentenceStats[sent.correct.join(' ')] = {
                attempts: 0,
                correct: 0,
                errors: []
            };
        });
    }

    announceGameStart() {
        const message = `Bem-vindo ao Detetive de Erros. Seu objetivo é montar frases corretas clicando nas palavras na ordem adequada. Você tem cinco rodadas para completar. Boa sorte!`;
        this.audioManager.speak(message, 0.9);
    }

    announceImageDescription() {
        if (this.currentSentence) {
            this.audioManager.speak(this.currentSentence.audioDescription, 0.95, 1.1);
        }
    }

    announceRoundInstruction() {
        const roundMessage = `Rodada ${this.currentRound + 1} de ${this.totalRounds}. ${this.currentSentence.audioInstruction}`;
        setTimeout(() => {
            this.audioManager.speak(roundMessage, 0.9);
        }, 500);
    }

    analyzeError(selected, correct) {
        let errorType = '';

        if (new Set(selected).size === new Set(correct).size &&
            selected.every(w => correct.includes(w))) {
            errorType = 'wrongOrder';
            this.syntaxErrors.wrongOrder++;
            const isInverted = selected.every((w, i) => w === correct[correct.length - 1 - i]);
            if (isInverted) this.syntaxErrors.inversionPattern = true;
        } else {
            errorType = 'wrongWord';
            this.syntaxErrors.wrongWord++;
            selected.forEach((word, idx) => {
                if (word !== correct[idx] && !this.syntaxErrors.blockedWords.includes(word)) {
                    this.syntaxErrors.blockedWords.push(word);
                }
            });
        }

        return errorType;
    }

    detectBlocking() {
        return this.consecutiveWrong >= 3;
    }

    calculateSyntaxScore() {
        const totalAttempts = this.currentRound + 1;
        const correctCount = Math.floor((this.score / 20));
        this.syntaxScore = (correctCount / totalAttempts) * 100;
        return this.syntaxScore;
    }

    adjustDifficulty() {
        this.calculateSyntaxScore();

        if (this.consecutiveCorrect >= 3 && this.syntaxScore >= 75) {
            if (this.difficulty === 'easy') {
                this.difficulty = 'medium';
                this.audioManager.speak('Excelente! Passamos para o nível médio.', 0.9);
            } else if (this.difficulty === 'medium') {
                this.difficulty = 'hard';
                this.audioManager.speak('Muito bem! Agora o nível difícil.', 0.9);
            }
        } else if (this.detectBlocking() || this.syntaxScore < 50) {
            if (this.difficulty === 'hard') {
                this.difficulty = 'medium';
                this.audioManager.speak('Voltamos ao nível médio para continuar praticando.', 0.9);
            } else if (this.difficulty === 'medium') {
                this.difficulty = 'easy';
                this.audioManager.speak('Vamos praticar o nível fácil.', 0.9);
            }
            this.consecutiveWrong = 0;
        }

        this.showDifficultyIndicator();
    }

    showDifficultyIndicator() {
        const indicator = document.getElementById('difficulty-indicator');
        const levels = {
            easy: '⭐ Dificuldade: FÁCIL (3 palavras)',
            medium: '⭐⭐ Dificuldade: MÉDIO (4 palavras)',
            hard: '⭐⭐⭐ Dificuldade: DIFÍCIL (5 palavras)'
        };
        indicator.textContent = levels[this.difficulty];
        indicator.style.display = 'block';
    }

    selectNextSentence() {
        const sentencesByDifficulty = this.sentences.filter(s => s.complexity === this.difficulty);
        if (sentencesByDifficulty.length === 0) {
            return this.sentences[Math.floor(Math.random() * this.sentences.length)];
        }

        const errorProne = sentencesByDifficulty.filter(s => {
            const key = s.correct.join(' ');
            return this.sentenceStats[key] && this.sentenceStats[key].errors.length > 0;
        });

        if (errorProne.length > 0 && Math.random() > 0.4) {
            return errorProne[Math.floor(Math.random() * errorProne.length)];
        }

        return sentencesByDifficulty[Math.floor(Math.random() * sentencesByDifficulty.length)];
    }

    showModelExample() {
        const shouldShow = this.difficulty === 'easy' && this.consecutiveWrong >= 1;
        if (shouldShow) {
            const modelEl = document.getElementById('model-example');
            modelEl.innerHTML = `<strong>💡 Exemplo modelo:</strong> "${this.currentSentence.correct.join(' ')}" é uma frase com ordem ${this.currentSentence.type}`;
            modelEl.style.display = 'block';
            this.audioManager.speak(`Exemplo: ${this.currentSentence.correct.join(' ')}`, 1);
        } else {
            document.getElementById('model-example').style.display = 'none';
        }
    }

    startNewRound() {
        this.currentSentence = this.selectNextSentence();
        this.selectedWords = [];
        this.showFeedback = false;
        this.startTime = Date.now();

        this.updateUI();
        this.showModelExample();

        setTimeout(() => this.announceImageDescription(), 300);
        setTimeout(() => this.announceRoundInstruction(), 2000);
    }

    updateUI() {
        document.getElementById('current-round').textContent = this.currentRound + 1;
        document.getElementById('total-rounds').textContent = this.totalRounds;
        document.getElementById('score').textContent = this.score + ' pontos';
        document.getElementById('score-display').textContent = this.score + ' pontos';

        const progress = ((this.currentRound + 1) / this.totalRounds) * 100;
        document.getElementById('progress-fill').style.width = progress + '%';

        const sentenceDisplay = document.getElementById('sentence-display');
        sentenceDisplay.innerHTML = '';

        const imageEl = document.createElement('div');
        imageEl.style.fontSize = '60px';
        imageEl.textContent = this.currentSentence.image;
        sentenceDisplay.appendChild(imageEl);

        const wordsContainer = document.createElement('div');
        wordsContainer.style.cssText = 'width:100%;display:flex;flex-wrap:wrap;gap:8px;justify-content:center;';

        for (let i = 0; i < this.currentSentence.correct.length; i++) {
            const slot = document.createElement('div');
            slot.className = 'word-slot';
            if (this.selectedWords[i]) {
                slot.textContent = this.selectedWords[i];
                if (this.selectedWords[i] === this.currentSentence.correct[i]) {
                    slot.classList.add('correct');
                } else if (this.currentSentence.correct.includes(this.selectedWords[i])) {
                    slot.classList.add('wrong-position');
                } else {
                    slot.classList.add('incorrect');
                }
            } else {
                slot.textContent = '?';
                slot.classList.add('empty');
            }
            wordsContainer.appendChild(slot);
        }

        sentenceDisplay.appendChild(wordsContainer);

        const wordsBank = document.getElementById('words-bank');
        wordsBank.innerHTML = '';

        const shuffledWords = [...this.currentSentence.words].sort(() => Math.random() - 0.5);
        shuffledWords.forEach(word => {
            const button = document.createElement('button');
            button.className = 'word-button';
            button.textContent = word;
            button.disabled = this.selectedWords.includes(word);
            button.classList.toggle('used', this.selectedWords.includes(word));
            button.onclick = () => this.selectWord(word);
            wordsBank.appendChild(button);
        });

        document.getElementById('feedback').classList.remove('show');
        document.getElementById('ai-analysis').classList.remove('show');
    }

    selectWord(word) {
        if (!this.selectedWords.includes(word) && this.selectedWords.length < this.currentSentence.correct.length) {
            this.selectedWords.push(word);
            this.audioManager.speak(word, 1, 1.2);
            this.updateUI();
        }
    }

    resetSentence() {
        this.selectedWords = [];
        this.audioManager.speak('Reiniciado. Tente novamente.', 0.9);
        this.updateUI();
    }

    checkSentence() {
        if (this.selectedWords.length !== this.currentSentence.correct.length) {
            const feedbackElement = document.getElementById('feedback');
            feedbackElement.textContent = 'Você deve completar toda a frase';
            feedbackElement.className = 'feedback incorrect show';
            this.audioManager.speak('Você deve selecionar todas as palavras', 0.9);
            return;
        }

        this.attentionTime = (Date.now() - this.startTime) / 1000;
        const isCorrect = JSON.stringify(this.selectedWords) === JSON.stringify(this.currentSentence.correct);
        const feedbackElement = document.getElementById('feedback');
        const feedbackText = document.getElementById('feedback-text');
        const sentenceKey = this.currentSentence.correct.join(' ');
        this.sentenceStats[sentenceKey].attempts++;

        if (isCorrect) {
            this.score += 20;
            this.consecutiveCorrect++;
            this.consecutiveWrong = 0;
            this.sentenceStats[sentenceKey].correct++;
            feedbackText.textContent = `Correto! 🎉 ${this.currentSentence.image} Ordem: ${this.currentSentence.type}`;
            feedbackElement.className = 'feedback correct show';
            this.audioManager.speak(`Correto! A frase é: ${this.currentSentence.correct.join(' ')}`, 0.95);
        } else {
            const errorType = this.analyzeError(this.selectedWords, this.currentSentence.correct);
            this.consecutiveWrong++;
            this.consecutiveCorrect = 0;
            this.sentenceStats[sentenceKey].errors.push(errorType);
            feedbackText.textContent = `Não está correto. Tente novamente 😊`;
            feedbackElement.className = 'feedback incorrect show';
            this.audioManager.speak(`Incorreto. A resposta correta é: ${this.currentSentence.correct.join(' ')}. Tente novamente.`, 0.9);
        }

        document.getElementById('score').textContent = this.score + ' pontos';
        document.getElementById('score-display').textContent = this.score + ' pontos';

        this.adjustDifficulty();
        this.showAIAnalysis();

        setTimeout(() => {
            if (this.currentRound + 1 >= this.totalRounds) {
                this.completeGame();
            } else {
                this.currentRound++;
                this.startNewRound();
            }
        }, 3000);
    }

    showAIAnalysis() {
        const analysisEl = document.getElementById('ai-analysis');
        const analysisText = document.getElementById('analysis-text');
        let analysis = '';

        if (this.attentionTime < 2) {
            analysis += '⚡ Resposta muito rápida (impulsiva). ';
        } else if (this.attentionTime > 8) {
            analysis += '🤔 Sustentou a atenção > 8s (concentração prolongada). ';
        }
        if (this.syntaxErrors.inversionPattern) {
            analysis += '🔄 Padrão detectado: inversão sistemática de palavras. ';
        }
        if (this.syntaxErrors.blockedWords.length > 0) {
            analysis += `🚫 Palavras problemáticas: ${this.syntaxErrors.blockedWords.slice(0, 2).join(', ')}. `;
        }
        if (this.consecutiveCorrect > 0) {
            analysis += `✅ ${this.consecutiveCorrect} acerto(s) consecutivo(s). `;
        }
        if (this.consecutiveWrong > 0) {
            analysis += `❌ ${this.consecutiveWrong} erro(s) consecutivo(s). `;
        }
        if (this.difficulty === 'hard') {
            analysis += '📈 Nível: DIFÍCIL. ';
        } else if (this.difficulty === 'easy') {
            analysis += '📉 Nível: FÁCIL. ';
        } else {
            analysis += '➡️ Nível: MÉDIO. ';
        }

        analysisText.textContent = analysis || 'Construção sintática em desenvolvimento...';
        analysisEl.classList.add('show');
    }

    completeGame() {
        const gameCard = document.querySelector('.game-card');
        const avgAccuracy = ((this.score / (this.totalRounds * 20)) * 100).toFixed(1);
        const finalSyntaxScore = this.calculateSyntaxScore().toFixed(0);

        let performanceMessage = 'Excelente construção sintática! 🏆';
        let mainWeakness = 'Nenhuma detectada';

        if (avgAccuracy < 60) {
            performanceMessage = 'Continue praticando a construção de frases! 💪';
        } else if (avgAccuracy < 80) {
            performanceMessage = 'Muito bom trabalho! Sua sintaxe está melhorando. 🌟';
        }

        if (this.syntaxErrors.blockedWords.length > 0) {
            mainWeakness = this.syntaxErrors.blockedWords.slice(0, 2).join(', ');
        }

        const finalMessage = `Jogo concluído. Sua pontuação final é de ${this.score} pontos com uma precisão de ${avgAccuracy} por cento. ${performanceMessage}`;
        this.audioManager.speak(finalMessage, 0.9);

        gameCard.innerHTML = `
            <h2>Jogo Concluído!</h2>
            <div style="font-size: 80px; margin: 30px 0;">🎉</div>
            <div style="background: linear-gradient(135deg, #0066CC 0%, #0099FF 100%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <div style="font-size: 24px; font-weight: 700; margin-bottom: 10px;">Sua pontuação final: ${this.score} pontos</div>
                <div style="font-size: 18px; opacity: 0.9;">Precisão: ${avgAccuracy}%</div>
            </div>
            <div style="background: rgba(0, 102, 204, 0.1); border-left: 4px solid #0066CC; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left; color: #1F2937; font-size: 14px;">
                <strong>📊 Análise Final de IA - Construção Sintática:</strong>
                <div style="margin-top: 10px; line-height: 1.8;">
                    <div>✓ Pontuação sintática: ${finalSyntaxScore}%</div>
                    <div>✓ Erros de ordem: ${this.syntaxErrors.wrongOrder}</div>
                    <div>✓ Erros de palavra: ${this.syntaxErrors.wrongWord}</div>
                    <div>✓ Palavras para praticar: ${mainWeakness}</div>
                    <div>✓ Padrão de inversão detectado: ${this.syntaxErrors.inversionPattern ? 'Sim' : 'Não'}</div>
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
}

const game = new AISyntaxGame();

document.addEventListener('DOMContentLoaded', () => {
    game.announceGameStart();
    setTimeout(() => { game.startNewRound(); }, 3000);
});

function checkSentence() { game.checkSentence(); }
function resetSentence() { game.resetSentence(); }

function toggleAudio() {
    const enabled = game.audioManager.toggleAudio();
    const btn = document.getElementById('audio-toggle');
    if (btn) btn.innerHTML = enabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
}

function goToMainPage() {
    window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-visual.html';
}