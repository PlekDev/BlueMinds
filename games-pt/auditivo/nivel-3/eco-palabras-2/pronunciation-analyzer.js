// ========================
// ANÁLISE DE PRONÚNCIA GRATUITA
// ========================

// Base de dados de fonemas do português brasileiro
const PORTUGUESE_PHONEMES = {
  'a': { ipa: 'a', esperado: /a/ },
  'e': { ipa: 'e', esperado: /e/ },
  'i': { ipa: 'i', esperado: /i/ },
  'o': { ipa: 'o', esperado: /o/ },
  'u': { ipa: 'u', esperado: /u/ },
  's': { ipa: 's', esperado: /s/ },
  'l': { ipa: 'l', esperado: /l/ },
  'n': { ipa: 'n', esperado: /n/ },
  'r': { ipa: 'ɾ', esperado: /r/ }, // vibrante simples
  'rr': { ipa: 'x', esperado: /rr/ }, // vibrante múltipla / gutural
  't': { ipa: 't', esperado: /t/ },
  'b': { ipa: 'b', esperado: /b/ },
  'd': { ipa: 'd', esperado: /d/ },
  'g': { ipa: 'g', esperado: /g/ },
  'p': { ipa: 'p', esperado: /p/ },
  'c': { ipa: 'k', esperado: /c|k/ },
  'z': { ipa: 'z', esperado: /z/ },
  'j': { ipa: 'ʒ', esperado: /j/ },
  'v': { ipa: 'v', esperado: /v/ },
  'm': { ipa: 'm', esperado: /m/ },
  'f': { ipa: 'f', esperado: /f/ },
  'h': { ipa: 'x', esperado: /h/ }, // aspirado em português
  'ch': { ipa: 'ʃ', esperado: /ch/ },
  'lh': { ipa: 'ʎ', esperado: /lh/ },
  'nh': { ipa: 'ɲ', esperado: /nh/ }
};

// Dicionário de palavras com fonemas
const WORD_PHONEME_DATABASE = {
  'sol': {
    phonemes: ['s', 'o', 'l'],
    difficulty: 'easy',
    commonErrors: ['troca de s por z', 'omissão do l']
  },
  'lua': {
    phonemes: ['l', 'u', 'a'],
    difficulty: 'easy',
    commonErrors: ['omissão do u', 'omissão do a']
  },
  'estrela': {
    phonemes: ['e', 's', 't', 'r', 'e', 'l', 'a'],
    difficulty: 'medium',
    commonErrors: ['dificuldade com r vibrante', 'omissão de sílabas']
  },
  'nuvem': {
    phonemes: ['n', 'u', 'v', 'e', 'm'],
    difficulty: 'easy',
    commonErrors: ['troca de v por b', 'omissão do m nasal']
  },
  'chuva': {
    phonemes: ['ch', 'u', 'v', 'a'],
    difficulty: 'medium',
    commonErrors: ['dificuldade com ch', 'troca de v por b']
  },
  'árvore': {
    phonemes: ['a', 'r', 'v', 'o', 'r', 'e'],
    difficulty: 'hard',
    commonErrors: ['dificuldade com r vibrante', 'omissão de sílabas']
  }
};

// ========================
// CLASSE DE ANÁLISE DE PRONÚNCIA
// ========================

class PronunciationAnalyzer {
  constructor() {
    this.userHistory = {
      successfulPhonemes: [],
      failedPhonemes: [],
      attempts: [],
      sessionStats: {
        totalAttempts: 0,
        totalScore: 0,
        averageScore: 0
      }
    };
  }

  /**
   * Analisar pronúncia
   * @param {string} targetWord - Palavra esperada
   * @param {string} recordedText - O que o usuário gravou
   * @returns {Object} Análise completa
   */
  analyze(targetWord, recordedText) {
    const targetPhonemes = WORD_PHONEME_DATABASE[targetWord].phonemes;
    const recordedPhonemes = this.extractPhonemes(recordedText);

    // Comparar fonemas
    const phonemeComparison = this.comparePhonemes(targetPhonemes, recordedPhonemes);

    // Calcular similaridade
    const similarity = this.calculateSimilarity(targetWord, recordedText);

    // Análise detalhada por fonema
    const detailedAnalysis = this.analyzeByPhoneme(targetWord, recordedText);

    // Detectar erros específicos
    const errors = this.detectSpecificErrors(targetWord, recordedText);

    // Gerar score
    const score = this.generateScore(phonemeComparison, similarity, errors);

    // Registrar tentativa
    const attempt = {
      timestamp: new Date(),
      targetWord,
      recordedText,
      score,
      similarity,
      phonemeComparison,
      errors,
      detailedAnalysis
    };

    this.userHistory.attempts.push(attempt);
    this.updateHistoricalData(attempt);

    return {
      score,
      similarity,
      phonemeComparison,
      detailedAnalysis,
      errors,
      feedback: this.generateFeedback(score, errors),
      nextExercise: this.generateAdaptiveExercise()
    };
  }

  /**
   * Extrair fonemas do texto gravado
   */
  extractPhonemes(text) {
    const cleaned = text.toLowerCase().trim();
    const phonemes = [];

    // Processar texto caractere por caractere
    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      const nextChar = cleaned[i + 1];

      // Detectar combinações (ch, lh, nh, rr, etc.)
      if ((char === 'c' && nextChar === 'h') ||
          (char === 'l' && nextChar === 'h') ||
          (char === 'n' && nextChar === 'h') ||
          (char === 'r' && nextChar === 'r')) {
        phonemes.push(char + nextChar);
        i++; // Pular próximo caractere
      } else if (PORTUGUESE_PHONEMES[char]) {
        phonemes.push(char);
      }
    }

    return phonemes;
  }

  /**
   * Comparar fonemas esperados vs gravados
   */
  comparePhonemes(expected, recorded) {
    const results = [];
    const maxLen = Math.max(expected.length, recorded.length);

    for (let i = 0; i < maxLen; i++) {
      const exp = expected[i] || null;
      const rec = recorded[i] || null;

      let status = 'correct';
      let errorType = null;

      if (!exp && rec) {
        status = 'extra';
        errorType = 'Fonema extra';
      } else if (exp && !rec) {
        status = 'missing';
        errorType = 'Fonema omitido';
      } else if (exp !== rec) {
        status = 'incorrect';
        errorType = 'Substituição';
      }

      results.push({
        position: i,
        expected: exp,
        recorded: rec,
        status,
        errorType,
        accuracy: this.calculatePhonemeAccuracy(exp, rec)
      });
    }

    return results;
  }

  /**
   * Calcular similaridade de strings (Levenshtein)
   */
  calculateSimilarity(target, recorded) {
    const targetLower = target.toLowerCase();
    const recordedLower = recorded.toLowerCase();

    const maxLen = Math.max(targetLower.length, recordedLower.length);
    let matches = 0;

    for (let i = 0; i < Math.min(targetLower.length, recordedLower.length); i++) {
      if (targetLower[i] === recordedLower[i]) {
        matches++;
      }
    }

    // Bônus se contém a palavra
    if (recordedLower.includes(targetLower) || targetLower.includes(recordedLower)) {
      matches = Math.min(maxLen, matches + 15);
    }

    return Math.round((matches / maxLen) * 100);
  }

  /**
   * Precisão de um fonema individual
   */
  calculatePhonemeAccuracy(expected, recorded) {
    if (!expected || !recorded) return 0;
    if (expected === recorded) return 100;

    // Verificar similaridade acústica (substituições comuns no português brasileiro)
    const similarPairs = [
      ['b', 'v'], // troca comum
      ['lh', 'li'], // liotacismo
      ['nh', 'ni'], // substituição comum
      ['d', 't'],
      ['g', 'k'],
      ['z', 's']
    ];

    for (const [a, b] of similarPairs) {
      if ((expected === a && recorded === b) || (expected === b && recorded === a)) {
        return 75; // Parcialmente correto
      }
    }

    return 40; // Incorreto
  }

  /**
   * Análise detalhada por fonema
   */
  analyzeByPhoneme(targetWord, recordedText) {
    const targetData = WORD_PHONEME_DATABASE[targetWord];
    const targetPhonemes = targetData.phonemes;
    const recordedPhonemes = this.extractPhonemes(recordedText);

    const analysis = {};

    targetPhonemes.forEach((phoneme, index) => {
      const recordedPhoneme = recordedPhonemes[index];
      const accuracy = this.calculatePhonemeAccuracy(phoneme, recordedPhoneme);

      analysis[phoneme] = {
        expected: phoneme,
        recorded: recordedPhoneme || 'omitido',
        accuracy,
        isCorrect: accuracy >= 80,
        commonError: accuracy < 80 ? this.identifyCommonError(phoneme, recordedPhoneme) : null
      };
    });

    return analysis;
  }

  /**
   * Identificar erros comuns
   */
  identifyCommonError(expected, recorded) {
    const commonErrors = {
      's': 'Confunde "s" com "z"',
      'z': 'Diz "s" em vez de "z"',
      'r': 'Dificuldade com "r" vibrante (rotacismo)',
      'rr': 'Confunde "r" com "rr"',
      'lh': 'Dificuldade com "lh" (liotacismo)',
      'nh': 'Troca "nh" por "ni"',
      'b': 'Confunde "b" com "v"',
      'v': 'Confunde "v" com "b"',
      'd': 'Omite ou substitui "d"',
      'g': 'Dificuldade com "g"',
      'ch': 'Dificuldade com "ch"'
    };

    return commonErrors[expected] || 'Erro de pronúncia';
  }

  /**
   * Detectar erros específicos
   */
  detectSpecificErrors(targetWord, recordedText) {
    const targetLower = targetWord.toLowerCase();
    const recordedLower = recordedText.toLowerCase();

    const errors = [];

    // Erro tipo: Omissão
    if (recordedLower.length < targetLower.length) {
      errors.push({
        type: 'Omission',
        description: 'Omitiu sons da palavra'
      });
    }

    // Erro tipo: Substituição (z por s)
    if (targetLower.includes('z') && !recordedLower.includes('z')) {
      errors.push({
        type: 'Substitution',
        phoneme: 'z/s',
        description: 'Disse "s" em vez de "z"'
      });
    }

    // Erro tipo: Rotacismo (r)
    if ((targetLower.includes('r') || targetLower.includes('rr')) &&
        !recordedLower.match(/r/)) {
      errors.push({
        type: 'Rhotic',
        description: 'Dificuldade com o som "r"'
      });
    }

    // Erro tipo: Liotacismo (lh)
    if (targetLower.includes('lh') && !recordedLower.includes('lh')) {
      errors.push({
        type: 'Liotacism',
        description: 'Disse "li" em vez de "lh"'
      });
    }

    // Erro tipo: Troca b/v
    if (targetLower.includes('v') && recordedLower.includes('b')) {
      errors.push({
        type: 'BV_Swap',
        description: 'Disse "b" em vez de "v"'
      });
    }

    return errors;
  }

  /**
   * Gerar score final ponderado
   */
  generateScore(phonemeComparison, similarity, errors) {
    const correctPhonemes = phonemeComparison.filter(p => p.status === 'correct').length;
    const totalPhonemes = phonemeComparison.length;
    const phonemeAccuracy = (correctPhonemes / totalPhonemes) * 100;

    // Score ponderado
    const score = Math.round(
      (similarity * 0.4) +        // 40% similaridade geral
      (phonemeAccuracy * 0.4) +   // 40% precisão fonética
      ((100 - (errors.length * 20)) * 0.2)  // 20% ausência de erros
    );

    return Math.max(0, Math.min(100, score)); // Limitar 0-100
  }

  /**
   * Gerar feedback personalizado
   */
  generateFeedback(score, errors) {
    let feedback = {};
    let emoji = '';
    let messages = [];

    if (score >= 90) {
      emoji = '🎉';
      feedback.level = 'excellent';
      messages.push('Pronúncia excelente!');
    } else if (score >= 75) {
      emoji = '👍';
      feedback.level = 'good';
      messages.push('Muito bem, faltam pequenos ajustes');
    } else if (score >= 50) {
      emoji = '🔄';
      feedback.level = 'okay';
      messages.push('Tente de novo, mais devagar');
    } else {
      emoji = '💪';
      feedback.level = 'needswork';
      messages.push('Você precisa praticar mais este som');
    }

    // Feedback específico por erro
    errors.forEach(error => {
      if (error.type === 'Omission') {
        messages.push('✋ Você não pronunciou a palavra inteira');
      } else if (error.type === 'Substitution') {
        messages.push(`⚠️ Você trocou "${error.phoneme}"`);
      } else if (error.type === 'Rhotic') {
        messages.push('🔄 Trabalhe o "r" vibrante');
      } else if (error.type === 'Liotacism') {
        messages.push('🔄 Lembre-se: "lh" tem som especial');
      } else if (error.type === 'BV_Swap') {
        messages.push('🔄 Atenção: "v" e "b" são diferentes');
      }
    });

    return {
      emoji,
      level: feedback.level,
      score: score,
      messages,
      advice: this.getAdviceByScore(score)
    };
  }

  /**
   * Dicas por score
   */
  getAdviceByScore(score) {
    if (score >= 90) {
      return 'Vamos para um som mais difícil!';
    } else if (score >= 70) {
      return 'Repita mais uma vez, com atenção';
    } else if (score >= 50) {
      return 'Ouça bem a palavra e fale mais devagar';
    } else {
      return 'Peça ajuda ao seu professor(a) ou terapeuta';
    }
  }

  /**
   * Gerar exercício adaptativo
   */
  generateAdaptiveExercise() {
    const failedPhonemes = this.userHistory.failedPhonemes;

    // Se houver fonemas problemáticos, focar neles
    if (failedPhonemes.length > 0) {
      const targetPhoneme = failedPhonemes[0];

      // Buscar palavra fácil com esse fonema
      const matchingWords = Object.entries(WORD_PHONEME_DATABASE)
        .filter(([word, data]) =>
          data.phonemes.includes(targetPhoneme) && data.difficulty === 'easy'
        );

      if (matchingWords.length > 0) {
        return {
          type: 'phoneme_focus',
          targetPhoneme,
          word: matchingWords[0][0],
          difficulty: 'easy',
          instruction: `Foque no som "${targetPhoneme}"`
        };
      }
    }

    // Se está indo bem, aumentar dificuldade
    return {
      type: 'difficulty_increase',
      instruction: 'Vamos para uma palavra mais difícil'
    };
  }

  /**
   * Atualizar histórico do usuário
   */
  updateHistoricalData(attempt) {
    this.userHistory.sessionStats.totalAttempts++;
    this.userHistory.sessionStats.totalScore += attempt.score;
    this.userHistory.sessionStats.averageScore =
      Math.round(this.userHistory.sessionStats.totalScore / this.userHistory.sessionStats.totalAttempts);

    // Atualizar fonemas problemáticos
    attempt.detailedAnalysis.forEach((phoneme, index) => {
      if (phoneme.accuracy >= 80) {
        if (!this.userHistory.successfulPhonemes.includes(phoneme.expected)) {
          this.userHistory.successfulPhonemes.push(phoneme.expected);
        }
      } else {
        if (!this.userHistory.failedPhonemes.includes(phoneme.expected)) {
          this.userHistory.failedPhonemes.push(phoneme.expected);
        }
      }
    });
  }

  /**
   * Obter relatório de progresso
   */
  getProgressReport() {
    return {
      totalAttempts: this.userHistory.sessionStats.totalAttempts,
      averageScore: this.userHistory.sessionStats.averageScore,
      strongPhonemes: this.userHistory.successfulPhonemes,
      weakPhonemes: this.userHistory.failedPhonemes,
      recommendedFocus: this.userHistory.failedPhonemes.slice(0, 3)
    };
  }
}

// ========================
// USO NO SEU JOGO
// ========================

const analyzer = new PronunciationAnalyzer();

// Na função analyzePronunciation() do script original:
function analyzePronunciation(transcript) {
  const currentWordName = currentWord.name;

  // Usar o novo analisador
  const result = analyzer.analyze(currentWordName, transcript);

  // Exibir resultados
  console.log('Score:', result.score);
  console.log('Feedback:', result.feedback);
  console.log('Próximo exercício:', result.nextExercise);

  // Atualizar UI
  document.getElementById('similarity-fill').style.width = result.score + '%';
  document.getElementById('similarity-text').textContent = result.score + '%';

  showFeedback(result.feedback.emoji + ' ' + result.feedback.messages[0], result.score >= 70);

  // Aplicar próximo exercício adaptativo
  if (result.nextExercise.type === 'phoneme_focus') {
    console.log('Próxima palavra focada em:', result.nextExercise.targetPhoneme);
  }
}

// ========================
// EXPORTAR PARA USO
// ========================
// No HTML:
// <script src="pronunciation-analyzer.js"></script>