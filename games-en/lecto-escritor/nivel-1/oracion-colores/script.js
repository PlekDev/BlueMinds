// Global variables
let currentRound = 0;
let score = 0;
let currentExercise = null;
let selectedOption = null;
let difficulty = 'normal';
let wrongAttempts = 0;
let hintUsed = false;
let errorFrequency = {};

const exercises = {
    easy: [
        {
            sentence: "The cats is big.",
            errorWord: "is",
            correctWord: "are",
            options: ["are", "am", "was"],
            errorType: "verb agreement",
            explanation: "The subject 'the cats' is plural, so the verb must be 'ARE' (plural), not 'IS' (singular).",
            hint: "Is there one cat or several? Find the word that matches plural subjects."
        },
        {
            sentence: "She have a red ball.",
            errorWord: "have",
            correctWord: "has",
            options: ["has", "had", "having"],
            errorType: "verb agreement",
            explanation: "'She' is a third-person singular pronoun, so it needs 'HAS', not 'HAVE'.",
            hint: "When the subject is 'he', 'she', or 'it', we usually add -s or -es to the verb."
        },
        {
            sentence: "I goes to school every day.",
            errorWord: "goes",
            correctWord: "go",
            options: ["go", "gone", "went"],
            errorType: "verb agreement",
            explanation: "With 'I', the base form of the verb is used: 'I GO'. 'Goes' is only for he/she/it.",
            hint: "Think about which verb form matches the pronoun 'I'."
        }
    ],
    normal: [
        {
            sentence: "The childs played in the park.",
            errorWord: "childs",
            correctWord: "children",
            options: ["children", "childs", "child's"],
            errorType: "irregular plural",
            explanation: "'Child' has an irregular plural: 'CHILDREN'. You cannot just add -s.",
            hint: "Some nouns have irregular plurals — think of 'child' becoming something completely different."
        },
        {
            sentence: "She runned very fast in the race.",
            errorWord: "runned",
            correctWord: "ran",
            options: ["ran", "runned", "runs"],
            errorType: "irregular past tense",
            explanation: "'Run' has an irregular past tense: 'RAN'. There is no 'runned' in English.",
            hint: "Some verbs don't follow the regular -ed rule for past tense."
        },
        {
            sentence: "He is more taller than his brother.",
            errorWord: "more taller",
            correctWord: "taller",
            options: ["taller", "more tall", "tallest"],
            errorType: "double comparative",
            explanation: "We never use 'more' and '-er' together. For short adjectives, just use '-er': 'TALLER'.",
            hint: "Short adjectives use '-er' for comparison. Never use 'more' AND '-er' at the same time."
        }
    ],
    hard: [
        {
            sentence: "If I was rich, I would travel everywhere.",
            errorWord: "was",
            correctWord: "were",
            options: ["were", "am", "had been"],
            errorType: "subjunctive mood",
            explanation: "In hypothetical 'If' clauses (things that aren't true), we use 'WERE' for all persons, not 'was'.",
            hint: "In conditional sentences that are imaginary, the verb 'to be' always becomes 'were'."
        },
        {
            sentence: "Neither the students nor the teacher were ready.",
            errorWord: "were",
            correctWord: "was",
            options: ["was", "were", "is"],
            errorType: "subject-verb agreement",
            explanation: "With 'neither...nor', the verb agrees with the closest subject ('the teacher' = singular → 'WAS').",
            hint: "When using 'neither...nor', look at the subject closest to the verb to decide singular or plural."
        },
        {
            sentence: "She suggested that he goes to the doctor.",
            errorWord: "goes",
            correctWord: "go",
            options: ["go", "goes", "went"],
            errorType: "subjunctive mood",
            explanation: "After 'suggest', 'recommend', 'insist', etc., the verb in the 'that' clause uses the base form: 'GO'.",
            hint: "After verbs like 'suggest', 'recommend', 'insist', use the base form of the verb in the next clause."
        }
    ]
};

const totalRounds = 5;

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    startNewRound();
});

function setupEventListeners() {
    document.getElementById('check-button').addEventListener('click', checkAnswer);
    document.getElementById('reset-button').addEventListener('click', resetRound);
    document.getElementById('hint-button').addEventListener('click', showHint);
}

function startNewRound() {
    const difficultyPool = selectDifficultyPool();
    const randomIndex = Math.floor(Math.random() * difficultyPool.length);
    currentExercise = difficultyPool[randomIndex];
    selectedOption = null;
    wrongAttempts = 0;
    hintUsed = false;
    updateUI();
    updateDifficulty();
}

function selectDifficultyPool() {
    if (wrongAttempts >= 3) { difficulty = 'easy'; return exercises.easy; }
    if (score >= 80 && currentRound > 2) { difficulty = 'hard'; return exercises.hard; }
    difficulty = 'normal';
    return exercises.normal;
}

function updateUI() {
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('total-rounds').textContent = totalRounds;
    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';

    const progress = ((currentRound + 1) / totalRounds) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';

    const sentenceText = document.getElementById('sentence-text');
    const parts = currentExercise.sentence.split(currentExercise.errorWord);
    sentenceText.innerHTML = parts[0] +
        `<span class="error-word">${currentExercise.errorWord}</span>` +
        (parts[1] || '');

    const badges = {
        'verb agreement':      '🔤 Error: Verb Agreement',
        'irregular plural':    '📊 Error: Irregular Plural',
        'irregular past tense':'⏰ Error: Irregular Past Tense',
        'double comparative':  '📝 Error: Double Comparative',
        'subjunctive mood':    '📚 Error: Subjunctive Mood',
        'subject-verb agreement': '🔤 Error: Subject-Verb Agreement'
    };
    document.getElementById('word-type-badge').textContent = badges[currentExercise.errorType] || 'Grammar Error';

    const container = document.getElementById('options-container');
    container.innerHTML = '';
    currentExercise.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.addEventListener('click', () => selectOption(option, button));
        container.appendChild(button);
    });

    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('explanation').classList.add('hidden');
    document.getElementById('error-hint').classList.add('hidden');
}

function selectOption(option, button) {
    document.querySelectorAll('.option-button').forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    selectedOption = option;
}

function showHint() {
    if (hintUsed) { showFeedback("You already used the hint", false); return; }
    hintUsed = true;
    document.getElementById('hint-text').textContent = currentExercise.hint;
    document.getElementById('error-hint').classList.remove('hidden');
    showFeedback("💡 Hint shown", true);
}

function checkAnswer() {
    if (!selectedOption) { showFeedback("You must select an option", false); return; }

    const isCorrect = selectedOption === currentExercise.correctWord;

    if (isCorrect) {
        let points = hintUsed ? 15 : 20;
        score += points;
        const key = currentExercise.errorType;
        errorFrequency[key] = (errorFrequency[key] || 0) + 1;

        showFeedback(`Correct! +${points} points 🎉`, true);

        document.querySelectorAll('.option-button').forEach(btn => {
            if (btn.textContent === selectedOption) btn.classList.add('correct');
        });

        setTimeout(() => showExplanation(), 500);

        document.getElementById('check-button').disabled = true;
        document.getElementById('reset-button').disabled = true;
        document.getElementById('hint-button').disabled = true;

        setTimeout(() => {
            if (currentRound + 1 >= totalRounds) {
                completeGame();
            } else {
                currentRound++;
                startNewRound();
                document.getElementById('check-button').disabled = false;
                document.getElementById('reset-button').disabled = false;
                document.getElementById('hint-button').disabled = false;
            }
        }, 3000);
    } else {
        wrongAttempts++;
        showFeedback("Incorrect. Try again", false);
        document.querySelectorAll('.option-button').forEach(btn => {
            if (btn.textContent === selectedOption) btn.classList.add('incorrect');
        });
        updateDifficulty();
    }

    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';
}

function showExplanation() {
    document.getElementById('explanation-text').textContent = currentExercise.explanation;
    document.getElementById('explanation').classList.remove('hidden');
}

function resetRound() {
    selectedOption = null;
    document.querySelectorAll('.option-button').forEach(btn => {
        btn.classList.remove('selected', 'incorrect', 'correct');
    });
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('explanation').classList.add('hidden');
    document.getElementById('error-hint').classList.add('hidden');
    wrongAttempts = 0;
    hintUsed = false;
}

function showFeedback(message, isCorrect) {
    const feedbackElement = document.getElementById('feedback');
    feedbackElement.textContent = message;
    feedbackElement.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
    feedbackElement.classList.remove('hidden');
}

function updateDifficulty() {
    let newDifficulty = wrongAttempts >= 3 ? 'easy' : (score >= 80 && currentRound > 2 ? 'hard' : 'normal');
    const badge = document.getElementById('difficulty-badge');
    badge.textContent = { easy: '🎯 Easy', normal: 'Normal', hard: '⭐ Advanced' }[newDifficulty];
}

function completeGame() {
    const errorSummary = Object.entries(errorFrequency)
        .sort((a, b) => b[1] - a[1]).slice(0, 2)
        .map(([type, count]) => `${type} (${count})`).join(', ');

    document.querySelector('.error-card').innerHTML = `
        <h2>Game Complete! 🏆</h2>
        <div class="feedback correct" style="margin-top:20px;">
            <p><strong>Your final score:</strong> ${score} points</p>
        </div>
        <div class="explanation" style="margin-top:20px;">
            <h3>Error Types Practiced</h3>
            <p>You mainly worked on: ${errorSummary || 'Various grammar errors'}</p>
            <p style="margin-top:10px;font-size:14px;">Keep practicing these structures to improve your grammar.</p>
        </div>
        <div class="action-controls" style="margin-top:30px;">
            <button class="action-button primary" onclick="location.reload()">
                <i class="fas fa-redo"></i> Play Again
            </button>
            <button class="action-button blue" onclick="goToMainPage()">
                <i class="fas fa-home"></i> Back to Menu
            </button>
        </div>`;
}

function goToMainPage() {
     window.location.href = 'https://plekdev.github.io/BlueMinds/selectores/selector-lecto-escritor.html';
}
