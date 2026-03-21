// ========================
// PRONUNCIATION ANALYSIS
// ========================

// English phoneme database
const ENGLISH_PHONEMES = {
    'a': { ipa: 'æ' },
    'e': { ipa: 'ɛ' },
    'i': { ipa: 'ɪ' },
    'o': { ipa: 'ɒ' },
    'u': { ipa: 'ʌ' },
    's': { ipa: 's' },
    'l': { ipa: 'l' },
    'n': { ipa: 'n' },
    'r': { ipa: 'ɹ' },
    't': { ipa: 't' },
    'b': { ipa: 'b' },
    'd': { ipa: 'd' },
    'g': { ipa: 'g' },
    'p': { ipa: 'p' },
    'k': { ipa: 'k' },
    'c': { ipa: 'k' },
    'z': { ipa: 'z' },
    'j': { ipa: 'dʒ' },
    'y': { ipa: 'j' },
    'v': { ipa: 'v' },
    'm': { ipa: 'm' },
    'f': { ipa: 'f' },
    'h': { ipa: 'h' },
    'w': { ipa: 'w' },
    'sh': { ipa: 'ʃ' },
    'ch': { ipa: 'tʃ' },
    'th': { ipa: 'θ' }
};

// English word phoneme database
const WORD_PHONEME_DATABASE = {
    'sun': { phonemes: ['s', 'u', 'n'], difficulty: 'easy', commonErrors: ['omit n'] },
    'moon': { phonemes: ['m', 'u', 'n'], difficulty: 'easy', commonErrors: ['short oo'] },
    'star': { phonemes: ['s', 't', 'a', 'r'], difficulty: 'easy', commonErrors: ['drop r'] },
    'cloud': { phonemes: ['c', 'l', 'a', 'u', 'd'], difficulty: 'easy', commonErrors: ['omit d'] },
    'rain': { phonemes: ['r', 'a', 'i', 'n'], difficulty: 'easy', commonErrors: ['drop n'] },
    'tree': { phonemes: ['t', 'r', 'i'], difficulty: 'easy', commonErrors: ['drop r'] },
    'butterfly': { phonemes: ['b', 'u', 't', 'e', 'r', 'f', 'l', 'i'], difficulty: 'hard', commonErrors: ['drop syllables'] },
    'dinosaur': { phonemes: ['d', 'i', 'n', 'o', 's', 'o', 'r'], difficulty: 'hard', commonErrors: ['drop syllables'] },
    'computer': { phonemes: ['c', 'o', 'm', 'p', 'u', 't', 'e', 'r'], difficulty: 'hard', commonErrors: ['drop r'] }
};

// ========================
// PRONUNCIATION ANALYZER CLASS
// ========================

class PronunciationAnalyzer {
    constructor() {
        this.userHistory = {
            successfulPhonemes: [],
            failedPhonemes: [],
            attempts: [],
            sessionStats: { totalAttempts: 0, totalScore: 0, averageScore: 0 }
        };
    }

    analyze(targetWord, recordedText) {
        const targetData = WORD_PHONEME_DATABASE[targetWord];
        if (!targetData) {
            // Fallback: simple string similarity
            const similarity = this.calculateSimilarity(targetWord, recordedText);
            const score = Math.min(100, Math.round(similarity));
            return {
                score,
                similarity,
                phonemeComparison: [],
                detailedAnalysis: {},
                errors: [],
                feedback: this.generateFeedback(score, []),
                nextExercise: { type: 'continue', instruction: 'Keep going!' }
            };
        }

        const targetPhonemes = targetData.phonemes;
        const recordedPhonemes = this.extractPhonemes(recordedText);
        const phonemeComparison = this.comparePhonemes(targetPhonemes, recordedPhonemes);
        const similarity = this.calculateSimilarity(targetWord, recordedText);
        const detailedAnalysis = this.analyzeByPhoneme(targetWord, recordedText);
        const errors = this.detectSpecificErrors(targetWord, recordedText);
        const score = this.generateScore(phonemeComparison, similarity, errors);

        const attempt = { timestamp: new Date(), targetWord, recordedText, score, similarity, phonemeComparison, errors, detailedAnalysis };
        this.userHistory.attempts.push(attempt);
        this.updateHistoricalData(attempt);

        return {
            score, similarity, phonemeComparison, detailedAnalysis, errors,
            feedback: this.generateFeedback(score, errors),
            nextExercise: this.generateAdaptiveExercise()
        };
    }

    extractPhonemes(text) {
        const cleaned = text.toLowerCase().trim();
        const phonemes = [];
        for (let i = 0; i < cleaned.length; i++) {
            const char = cleaned[i];
            const nextChar = cleaned[i + 1];
            if ((char === 's' && nextChar === 'h') ||
                (char === 'c' && nextChar === 'h') ||
                (char === 't' && nextChar === 'h')) {
                phonemes.push(char + nextChar);
                i++;
            } else if (ENGLISH_PHONEMES[char]) {
                phonemes.push(char);
            }
        }
        return phonemes;
    }

    comparePhonemes(expected, recorded) {
        const results = [];
        const maxLen = Math.max(expected.length, recorded.length);
        for (let i = 0; i < maxLen; i++) {
            const exp = expected[i] || null;
            const rec = recorded[i] || null;
            let status = 'correct', errorType = null;
            if (!exp && rec) { status = 'extra'; errorType = 'Extra phoneme'; }
            else if (exp && !rec) { status = 'missing'; errorType = 'Omitted phoneme'; }
            else if (exp !== rec) { status = 'incorrect'; errorType = 'Substitution'; }
            results.push({ position: i, expected: exp, recorded: rec, status, errorType, accuracy: this.calculatePhonemeAccuracy(exp, rec) });
        }
        return results;
    }

    calculateSimilarity(target, recorded) {
        const targetLower = target.toLowerCase();
        const recordedLower = recorded.toLowerCase();
        const maxLen = Math.max(targetLower.length, recordedLower.length);
        let matches = 0;
        for (let i = 0; i < Math.min(targetLower.length, recordedLower.length); i++) {
            if (targetLower[i] === recordedLower[i]) matches++;
        }
        if (recordedLower.includes(targetLower) || targetLower.includes(recordedLower)) {
            matches = Math.min(maxLen, matches + 15);
        }
        return Math.round((matches / maxLen) * 100);
    }

    calculatePhonemeAccuracy(expected, recorded) {
        if (!expected || !recorded) return 0;
        if (expected === recorded) return 100;
        const similarPairs = [['b', 'p'], ['d', 't'], ['v', 'f'], ['g', 'k'], ['z', 's']];
        for (const [a, b] of similarPairs) {
            if ((expected === a && recorded === b) || (expected === b && recorded === a)) return 75;
        }
        return 40;
    }

    analyzeByPhoneme(targetWord, recordedText) {
        const targetData = WORD_PHONEME_DATABASE[targetWord];
        if (!targetData) return {};
        const targetPhonemes = targetData.phonemes;
        const recordedPhonemes = this.extractPhonemes(recordedText);
        const analysis = {};
        targetPhonemes.forEach((phoneme, index) => {
            const recordedPhoneme = recordedPhonemes[index];
            const accuracy = this.calculatePhonemeAccuracy(phoneme, recordedPhoneme);
            analysis[phoneme] = {
                expected: phoneme,
                recorded: recordedPhoneme || 'omitted',
                accuracy,
                isCorrect: accuracy >= 80,
                commonError: accuracy < 80 ? this.identifyCommonError(phoneme) : null
            };
        });
        return analysis;
    }

    identifyCommonError(expected) {
        const commonErrors = {
            'r': 'Difficulty with English "r" sound',
            'th': 'Difficulty with "th" sound',
            'v': 'Confusing "v" with "b"',
            'w': 'Difficulty with "w" sound',
            'sh': 'Difficulty with "sh" sound'
        };
        return commonErrors[expected] || 'Pronunciation error';
    }

    detectSpecificErrors(targetWord, recordedText) {
        const targetLower = targetWord.toLowerCase();
        const recordedLower = recordedText.toLowerCase();
        const errors = [];
        if (recordedLower.length < targetLower.length - 1) {
            errors.push({ type: 'Omission', description: 'Omitted sounds from the word' });
        }
        if (targetLower.includes('th') && !recordedLower.includes('th')) {
            errors.push({ type: 'Substitution', phoneme: 'th', description: 'Difficulty with "th" sound' });
        }
        return errors;
    }

    generateScore(phonemeComparison, similarity, errors) {
        const correctPhonemes = phonemeComparison.filter(p => p.status === 'correct').length;
        const totalPhonemes = phonemeComparison.length || 1;
        const phonemeAccuracy = (correctPhonemes / totalPhonemes) * 100;
        const score = Math.round(
            (similarity * 0.4) +
            (phonemeAccuracy * 0.4) +
            ((100 - (errors.length * 20)) * 0.2)
        );
        return Math.max(0, Math.min(100, score));
    }

    generateFeedback(score, errors) {
        let emoji = '', messages = [];
        let level = '';
        if (score >= 90) {
            emoji = '🎉'; level = 'excellent';
            messages.push('Excellent pronunciation!');
        } else if (score >= 75) {
            emoji = '👍'; level = 'good';
            messages.push('Very good, small improvements needed');
        } else if (score >= 50) {
            emoji = '🔄'; level = 'okay';
            messages.push('Try again, more slowly');
        } else {
            emoji = '💪'; level = 'needswork';
            messages.push('Keep practicing this sound');
        }
        errors.forEach(error => {
            if (error.type === 'Omission') messages.push('✋ You did not say the whole word');
            else if (error.type === 'Substitution') messages.push(`⚠️ Check the "${error.phoneme}" sound`);
        });
        return { emoji, level, score, messages, advice: this.getAdviceByScore(score) };
    }

    getAdviceByScore(score) {
        if (score >= 90) return 'Ready for a harder word!';
        if (score >= 70) return 'Try once more, carefully';
        if (score >= 50) return 'Listen again and go slowly';
        return 'Ask your teacher for help';
    }

    generateAdaptiveExercise() {
        const failedPhonemes = this.userHistory.failedPhonemes;
        if (failedPhonemes.length > 0) {
            const targetPhoneme = failedPhonemes[0];
            const matchingWords = Object.entries(WORD_PHONEME_DATABASE)
                .filter(([word, data]) => data.phonemes.includes(targetPhoneme) && data.difficulty === 'easy');
            if (matchingWords.length > 0) {
                return { type: 'phoneme_focus', targetPhoneme, word: matchingWords[0][0], difficulty: 'easy', instruction: `Focus on the "${targetPhoneme}" sound` };
            }
        }
        return { type: 'difficulty_increase', instruction: 'Moving to a harder word' };
    }

    updateHistoricalData(attempt) {
        this.userHistory.sessionStats.totalAttempts++;
        this.userHistory.sessionStats.totalScore += attempt.score;
        this.userHistory.sessionStats.averageScore =
            Math.round(this.userHistory.sessionStats.totalScore / this.userHistory.sessionStats.totalAttempts);
        Object.values(attempt.detailedAnalysis).forEach(phoneme => {
            if (phoneme.accuracy >= 80) {
                if (!this.userHistory.successfulPhonemes.includes(phoneme.expected))
                    this.userHistory.successfulPhonemes.push(phoneme.expected);
            } else {
                if (!this.userHistory.failedPhonemes.includes(phoneme.expected))
                    this.userHistory.failedPhonemes.push(phoneme.expected);
            }
        });
    }

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
