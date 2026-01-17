// ===== SISTEMA DE IA ADAPTATIVO PARA CONSTRUCCIÓN SINTÁCTICA =====
class AISyntaxGame {
    constructor() {
        this.currentRound = 0;
        this.score = 0;
        this.currentSentence = null;
        this.selectedWords = [];
        this.showFeedback = false;
        
        // Parámetros de IA
        this.syntaxScore = 0;
        this.difficulty = 'easy';
        this.consecutiveCorrect = 0;
        this.consecutiveWrong = 0;
        this.attentionTime = 0;
        this.startTime = 0;
        
        // Análisis de errores
        this.syntaxErrors = {
            wrongOrder: 0,
            wrongWord: 0,
            inversionPattern: false,
            blockedWords: []
        };
        
        this.wordStats = {};
        this.sentenceStats = {};
        
        // Niveles de dificultad (por cantidad de palabras)
        this.difficultyLevels = {
            easy: { wordCount: 3, examples: true },
            medium: { wordCount: 4, examples: false },
            hard: { wordCount: 5, examples: false }
        };

        // Base de oraciones categorizadas por dificultad
        this.sentences = [
            // FÁCIL (3 palabras)
            { 
                words: ["El", "gato", "duerme"], 
                correct: ["El", "gato", "duerme"], 
                complexity: 'easy',
                type: 'SVO', // Sujeto-Verbo-Objeto
                image: "🐱"
            },
            { 
                words: ["perro", "El", "corre"], 
                correct: ["El", "perro", "corre"], 
                complexity: 'easy',
                type: 'SV',
                image: "🐕"
            },
            { 
                words: ["vuela", "pájaro", "El"], 
                correct: ["El", "pájaro", "vuela"], 
                complexity: 'easy',
                type: 'SV',
                image: "🦅"
            },
            
            // MEDIO (4 palabras)
            { 
                words: ["niña", "come", "La", "manzana"], 
                correct: ["La", "niña", "come", "manzana"], 
                complexity: 'medium',
                type: 'SVO',
                image: "👧"
            },
            { 
                words: ["bonita", "Una", "casa", "es"], 
                correct: ["Una", "casa", "es", "bonita"], 
                complexity: 'medium',
                type: 'SVC',
                image: "🏠"
            },
            
            // DIFÍCIL (5 palabras)
            { 
                words: ["niños", "parque", "Los", "en", "juegan"], 
                correct: ["Los", "niños", "juegan", "en", "parque"], 
                complexity: 'hard',
                type: 'SVLP',
                image: "🎮"
            }
        ];

        this.totalRounds = 5;
        
        // Inicializar estadísticas
        this.sentences.forEach(sent => {
            this.sentenceStats[sent.correct.join(' ')] = {
                attempts: 0,
                correct: 0,
                errors: []
            };
        });
    }

    // ===== ANÁLISIS DE ERRORES SINTÁCTICOS =====
    analyzeError(selected, correct) {
        const selectedStr = selected.join(' ');
        const correctStr = correct.join(' ');
        
        let errorType = '';
        
        // Verificar si es el mismo conjunto de palabras pero diferente orden
        if (new Set(selected).size === new Set(correct).size && 
            selected.every(w => correct.includes(w))) {
            
            // Es un error de orden
            errorType = 'wrongOrder';
            this.syntaxErrors.wrongOrder++;
            
            // Detectar si hay patrón de inversión sistemática
            const isInverted = selected.every((w, i) => w === correct[correct.length - 1 - i]);
            if (isInverted) {
                this.syntaxErrors.inversionPattern = true;
            }
        } else {
            // Error de palabra incorrecta
            errorType = 'wrongWord';
            this.syntaxErrors.wrongWord++;
            
            // Registrar qué palabras está usando mal
            selected.forEach((word, idx) => {
                if (word !== correct[idx] && !this.syntaxErrors.blockedWords.includes(word)) {
                    this.syntaxErrors.blockedWords.push(word);
                }
            });
        }
        
        return errorType;
    }

    // ===== DETECCIÓN DE BLOQUEOS (CUANDO EL NIÑO NO AVANZA) =====
    detectBlocking() {
        // Si ha fallado 3 veces seguidas, está bloqueado
        if (this.consecutiveWrong >= 3) {
            return true;
        }
        return false;
    }

    // ===== CÁLCULO DE PUNTUACIÓN SINTÁCTICA =====
    calculateSyntaxScore() {
        const totalAttempts = this.currentRound + 1;
        const correctCount = Math.floor((this.score / 20));
        this.syntaxScore = (correctCount / totalAttempts) * 100;
        return this.syntaxScore;
    }

    // ===== AJUSTE AUTOMÁTICO DE DIFICULTAD =====
    adjustDifficulty() {
        this.calculateSyntaxScore();
        
        // Si ha acertado 3 seguidas y tiene >= 75% → aumentar dificultad
        if (this.consecutiveCorrect >= 3 && this.syntaxScore >= 75) {
            if (this.difficulty === 'easy') {
                this.difficulty = 'medium';
            } else if (this.difficulty === 'medium') {
                this.difficulty = 'hard';
            }
        }
        // Si está bloqueado o tiene < 50% → reducir dificultad
        else if (this.detectBlocking() || this.syntaxScore < 50) {
            if (this.difficulty === 'hard') {
                this.difficulty = 'medium';
            } else if (this.difficulty === 'medium') {
                this.difficulty = 'easy';
            }
            this.consecutiveWrong = 0; // Reset
        }
        // Desempeño normal
        else {
            if (this.syntaxScore < 65) {
                this.difficulty = 'easy';
            } else if (this.syntaxScore >= 75) {
                this.difficulty = 'medium';
            }
        }
        
        this.showDifficultyIndicator();
    }

    showDifficultyIndicator() {
        const indicator = document.getElementById('difficulty-indicator');
        const levels = {
            easy: '⭐ Dificultad: FÁCIL (3 palabras)',
            medium: '⭐⭐ Dificultad: MEDIO (4 palabras)',
            hard: '⭐⭐⭐ Dificultad: DIFÍCIL (5 palabras)'
        };

        indicator.textContent = levels[this.difficulty];
        indicator.style.display = 'block';
    }

    // ===== SELECCIÓN INTELIGENTE DE ORACIONES =====
    selectNextSentence() {
        // Filtrar oraciones por dificultad actual
        const sentencesByDifficulty = this.sentences.filter(
            s => s.complexity === this.difficulty
        );

        if (sentencesByDifficulty.length === 0) {
            // Fallback: cualquier oración
            return this.sentences[Math.floor(Math.random() * this.sentences.length)];
        }

        // Priorizar oraciones que causaron errores
        const errorProne = sentencesByDifficulty.filter(s => {
            const key = s.correct.join(' ');
            return this.sentenceStats[key] && this.sentenceStats[key].errors.length > 0;
        });

        if (errorProne.length > 0 && Math.random() > 0.4) {
            return errorProne[Math.floor(Math.random() * errorProne.length)];
        }

        return sentencesByDifficulty[Math.floor(Math.random() * sentencesByDifficulty.length)];
    }

    // ===== MOSTRAR EJEMPLO MODELO =====
    showModelExample() {
        const shouldShow = this.difficulty === 'easy' && this.consecutiveWrong >= 1;
        
        if (shouldShow) {
            const modelEl = document.getElementById('model-example');
            modelEl.innerHTML = `
                <strong>💡 Ejemplo modelo:</strong> 
                "${this.currentSentence.correct.join(' ')}" es una oración con orden ${this.currentSentence.type}
            `;
            modelEl.style.display = 'block';
        } else {
            document.getElementById('model-example').style.display = 'none';
        }
    }

    // ===== INICIO DEL JUEGO =====
    startNewRound() {
        this.currentSentence = this.selectNextSentence();
        this.selectedWords = [];
        this.showFeedback = false;
        this.startTime = Date.now();
        
        this.updateUI();
        this.showModelExample();
    }

    updateUI() {
        document.getElementById('current-round').textContent = this.currentRound + 1;
        document.getElementById('total-rounds').textContent = this.totalRounds;
        document.getElementById('score').textContent = this.score + ' puntos';
        document.getElementById('score-display').textContent = this.score + ' puntos';

        const progress = ((this.currentRound + 1) / this.totalRounds) * 100;
        document.getElementById('progress-fill').style.width = progress + '%';

        // Actualizar display de oración
        const sentenceDisplay = document.getElementById('sentence-display');
        sentenceDisplay.innerHTML = '';
        
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
            sentenceDisplay.appendChild(slot);
        }

        // Actualizar banco de palabras
        const wordsBank = document.getElementById('words-bank');
        wordsBank.innerHTML = '';
        
        // Mezclar palabras
        const shuffledWords = [...this.currentSentence.words].sort(() => Math.random() - 0.5);
        
        shuffledWords.forEach((word) => {
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
            this.updateUI();
        }
    }

    resetSentence() {
        this.selectedWords = [];
        this.updateUI();
    }

    // ===== VERIFICACIÓN Y ANÁLISIS =====
    checkSentence() {
        if (this.selectedWords.length !== this.currentSentence.correct.length) {
            const feedbackElement = document.getElementById('feedback');
            feedbackElement.textContent = 'Debes completar toda la oración';
            feedbackElement.className = 'feedback incorrect show';
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
            
            feedbackText.textContent = `¡Correcto! 🎉 ${this.currentSentence.image} Orden: ${this.currentSentence.type}`;
            feedbackElement.className = 'feedback correct show';
        } else {
            const errorType = this.analyzeError(this.selectedWords, this.currentSentence.correct);
            this.consecutiveWrong++;
            this.consecutiveCorrect = 0;
            this.sentenceStats[sentenceKey].errors.push(errorType);
            
            feedbackText.textContent = `No es correcto. Intenta de nuevo 😊`;
            feedbackElement.className = 'feedback incorrect show';
        }

        this.showFeedback = true;
        document.getElementById('score').textContent = this.score + ' puntos';
        document.getElementById('score-display').textContent = this.score + ' puntos';

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

    // ===== ANÁLISIS EN TIEMPO REAL =====
    showAIAnalysis() {
        const analysisEl = document.getElementById('ai-analysis');
        const analysisText = document.getElementById('analysis-text');
        
        let analysis = '';

        // Análisis de velocidad
        if (this.attentionTime < 2) {
            analysis += '⚡ Respuesta muy rápida (impulsiva). ';
        } else if (this.attentionTime > 8) {
            analysis += '🤔 Sostuvo la atención > 8s (concentración prolongada). ';
        }

        // Análisis de patrones
        if (this.syntaxErrors.inversionPattern) {
            analysis += '🔄 Patrón detectado: inversión sistemática de palabras. ';
        }

        if (this.syntaxErrors.blockedWords.length > 0) {
            analysis += `🚫 Palabras problemáticas: ${this.syntaxErrors.blockedWords.slice(0, 2).join(', ')}. `;
        }

        // Análisis de racha
        if (this.consecutiveCorrect > 0) {
            analysis += `✅ ${this.consecutiveCorrect} acierto(s) consecutivo(s). `;
        }
        if (this.consecutiveWrong > 0) {
            analysis += `❌ ${this.consecutiveWrong} error(es) consecutivo(s). `;
        }

        // Cambios de dificultad
        if (this.difficulty === 'hard') {
            analysis += '📈 Nivel: DIFÍCIL. ';
        } else if (this.difficulty === 'easy') {
            analysis += '📉 Nivel: FÁCIL. ';
        } else {
            analysis += '➡️ Nivel: MEDIO. ';
        }

        analysisText.textContent = analysis || 'Construcción sintáctica en desarrollo...';
        analysisEl.classList.add('show');
    }

    // ===== REPORTE FINAL =====
    completeGame() {
        const gameCard = document.querySelector('.game-card');
        const avgAccuracy = ((this.score / (this.totalRounds * 20)) * 100).toFixed(1);
        const finalSyntaxScore = this.calculateSyntaxScore().toFixed(0);
        
        let performanceMessage = '¡Excelente construcción sintáctica! 🏆';
        let mainWeakness = 'Ninguna detectada';

        if (avgAccuracy < 60) {
            performanceMessage = '¡Sigue practicando la construcción de oraciones! 💪';
        } else if (avgAccuracy < 80) {
            performanceMessage = '¡Muy buen trabajo! Tu sintaxis mejora. 🌟';
        }

        if (this.syntaxErrors.blockedWords.length > 0) {
            mainWeakness = this.syntaxErrors.blockedWords.slice(0, 2).join(', ');
        }

        gameCard.innerHTML = `
            <h2>¡Juego Completado!</h2>
            <div style="font-size: 80px; margin: 30px 0;">🎉</div>
            
            <div style="background: linear-gradient(135deg, #0066CC 0%, #0099FF 100%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <div style="font-size: 24px; font-weight: 700; margin-bottom: 10px;">Tu puntaje final: ${this.score} puntos</div>
                <div style="font-size: 18px; opacity: 0.9;">Precisión: ${avgAccuracy}%</div>
            </div>

            <div style="background: rgba(0, 102, 204, 0.1); border-left: 4px solid #0066CC; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left; color: #1F2937; font-size: 14px;">
                <strong>📊 Análisis Final de IA - Construcción Sintáctica:</strong>
                <div style="margin-top: 10px; line-height: 1.8;">
                    <div>✓ Puntuación sintáctica: ${finalSyntaxScore}%</div>
                    <div>✓ Errores de orden: ${this.syntaxErrors.wrongOrder}</div>
                    <div>✓ Errores de palabra: ${this.syntaxErrors.wrongWord}</div>
                    <div>✓ Palabras a practicar: ${mainWeakness}</div>
                    <div>✓ Patrón de inversión detectado: ${this.syntaxErrors.inversionPattern ? 'Sí' : 'No'}</div>
                    <div>✓ Nivel final: ${this.difficulty.toUpperCase()}</div>
                </div>
            </div>

            <div style="color: var(--primary-blue); font-size: 18px; font-weight: 600; margin: 15px 0;">
                ${performanceMessage}
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px;">
                <button style="background: linear-gradient(135deg, #0066CC 0%, #0099FF 100%); color: white; padding: 15px; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" onclick="location.reload()">
                    Jugar de Nuevo
                </button>
                <button style="background-color: #00B4D8; color: white; padding: 15px; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" onclick="goToMainPage()">
                    Volver al Menú
                </button>
            </div>
        `;
    }
}

// ===== INICIALIZACIÓN =====
const game = new AISyntaxGame();

document.addEventListener('DOMContentLoaded', () => {
    game.startNewRound();
});

// ===== FUNCIONES GLOBALES PARA LOS BOTONES =====
function checkSentence() {
    game.checkSentence();
}

function resetSentence() {
    game.resetSentence();
}

// ===== NAVEGACIÓN =====
function goToMainPage() {
    window.location.href = '/pages/BlueMindsMain.html';
}