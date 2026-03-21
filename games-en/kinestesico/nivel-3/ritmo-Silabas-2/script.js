let currentRound = 0, score = 0, currentWord = null, syllables = [], isPlaying = false, tapCount = 0, expectedTaps = 0;

// Simple English words for level 3
const words = [
    { word: "cat",   syllables: ["CAT"]        },
    { word: "dog",   syllables: ["DOG"]        },
    { word: "sun",   syllables: ["SUN"]        },
    { word: "moon",  syllables: ["MOON"]       },
    { word: "tree",  syllables: ["TREE"]       },
    { word: "apple", syllables: ["AP", "PLE"]  },
    { word: "happy", syllables: ["HAP", "PY"]  },
    { word: "water", syllables: ["WA", "TER"]  },
];
const totalRounds = 3;
let currentSyllableIndex = 0;

document.addEventListener('DOMContentLoaded', () => { setupEventListeners(); startNewRound(); });

function setupEventListeners() {
    document.getElementById('start-button').addEventListener('click', startRhythmActivity);
    document.getElementById('listen-button').addEventListener('click', startSpeechRecognition);
    document.getElementById('tapArea').addEventListener('click', onTap);
}

function startNewRound() {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    currentWord = randomWord; syllables = randomWord.syllables;
    tapCount = 0; expectedTaps = syllables.length; isPlaying = false; currentSyllableIndex = 0;
    updateUI();
}

function completeGame() {
    document.querySelector('.rhythm-card').innerHTML = `
        <h2>Activity Complete! 🎉</h2>
        <div class="syllable-stage" style="display:flex;align-items:center;justify-content:center;min-height:200px;"><div style="font-size:80px;">🌟</div></div>
        <div class="feedback correct">
            <p style="font-size:28px;margin:20px 0;">Your final score: ${score} points</p>
            <p style="font-size:16px;">Excellent rhythm and auditory memory!</p>
        </div>
        <div class="action-controls">
            <button class="action-button primary" onclick="location.reload()"><i class="fas fa-redo"></i> Play Again</button>
            <button class="action-button primary" onclick="goToMainPage()"><i class="fas fa-home"></i> Back</button>
        </div>`;
}

function updateUI() {
    document.getElementById('current-round').textContent = currentRound + 1;
    document.getElementById('total-rounds').textContent = totalRounds;
    document.getElementById('score').textContent = score + ' points';
    document.getElementById('score-display').textContent = score + ' points';
    document.getElementById('progress-fill').style.width = ((currentRound + 1) / totalRounds * 100) + '%';
    displaySyllables();
    const sb = document.getElementById('start-button');
    sb.innerHTML = '<i class="fas fa-play"></i> Listen to Word'; sb.disabled = false;
    document.getElementById('speechSection').style.display = 'none';
    document.getElementById('audioAnalysis').style.display = 'none';
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('adaptationNotice').classList.add('hidden');
    document.getElementById('tapArea').classList.remove('active');
    document.getElementById('tapFeedback').textContent = '';
    tapCount = 0;
    ['speed1','speed2','speed3'].forEach((id,i) => {
        document.getElementById(id).classList.toggle('active', i === 0);
    });
}

function displaySyllables() {
    const container = document.getElementById('syllables-container');
    container.innerHTML = '';
    syllables.forEach((syllable, index) => {
        const el = document.createElement('div');
        el.className = 'syllable'; el.textContent = syllable; el.id = `syllable-${index}`;
        container.appendChild(el);
    });
}

async function startRhythmActivity() {
    if (isPlaying) return;
    isPlaying = true;
    const sb = document.getElementById('start-button');
    sb.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Playing...'; sb.disabled = true;
    document.getElementById('audioAnalysis').style.display = 'block';
    await playSyllablesWithRhythm();
    document.getElementById('tapArea').classList.add('active');
    sb.innerHTML = '<i class="fas fa-redo"></i> Repeat'; sb.disabled = false;
}

async function playSyllablesWithRhythm() {
    const timeBetweenSyllables = 700;
    for (let i = 0; i < syllables.length; i++) {
        currentSyllableIndex = i;
        await highlightSyllable(i, timeBetweenSyllables);
        speakSyllable(syllables[i]);
        await new Promise(resolve => setTimeout(resolve, timeBetweenSyllables));
    }
    currentSyllableIndex = 0;
    setTimeout(() => { document.getElementById('speechSection').style.display = 'block'; }, 500);
}

function highlightSyllable(index, duration) {
    return new Promise(resolve => {
        const el = document.getElementById(`syllable-${index}`);
        el.classList.add('pulse', 'active');
        setTimeout(() => { el.classList.remove('pulse', 'active'); resolve(); }, duration * 0.8);
    });
}

function speakSyllable(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; utterance.rate = 0.85; utterance.pitch = 1.1; utterance.volume = 1;
    speechSynthesis.speak(utterance);
}

function onTap() {
    if (!isPlaying) return;
    tapCount++;
    const tapFeedback = document.getElementById('tapFeedback');
    tapFeedback.textContent = '👏'; tapFeedback.classList.add('tap-detected');
    setTimeout(() => tapFeedback.classList.remove('tap-detected'), 500);
    if (tapCount === expectedTaps) {
        document.getElementById('feedback-text').textContent = 'Great rhythm! 🎉';
        document.getElementById('feedback').className = 'feedback correct';
        document.getElementById('feedback').classList.remove('hidden');
        setTimeout(() => { document.getElementById('speechSection').style.display = 'block'; }, 800);
    } else if (tapCount > expectedTaps) {
        document.getElementById('feedback-text').textContent = 'Too many taps, try again';
        document.getElementById('feedback').className = 'feedback incorrect';
        document.getElementById('feedback').classList.remove('hidden');
        document.getElementById('tapArea').classList.remove('active'); tapCount = 0;
        document.getElementById('tapFeedback').textContent = '';
    }
}

async function startSpeechRecognition() {
    const listenButton = document.getElementById('listen-button');
    listenButton.disabled = true; listenButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Listening...';
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { listenButton.disabled = false; listenButton.innerHTML = '<i class="fas fa-microphone"></i> Listen'; return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; recognition.continuous = false; recognition.interimResults = false;
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        const targetWord = currentWord.word.toLowerCase();
        const isSimilar = transcript.includes(targetWord) || targetWord.includes(transcript);
        const feedback = document.getElementById('speech-feedback');
        if (isSimilar) {
            score += 20;
            document.getElementById('speech-text').textContent = 'Excellent! 🎉 You said it correctly';
            feedback.className = 'speech-feedback correct'; feedback.classList.remove('hidden');
            document.getElementById('score').textContent = score + ' points';
            document.getElementById('score-display').textContent = score + ' points';
            setTimeout(() => {
                if (currentRound + 1 >= totalRounds) completeGame();
                else { currentRound++; startNewRound(); }
            }, 2000);
        } else {
            document.getElementById('speech-text').textContent = `We heard: "${transcript}". Try again`;
            feedback.className = 'speech-feedback incorrect'; feedback.classList.remove('hidden');
        }
        listenButton.disabled = false; listenButton.innerHTML = '<i class="fas fa-microphone"></i> Listen';
    };
    recognition.onerror = () => { listenButton.disabled = false; listenButton.innerHTML = '<i class="fas fa-microphone"></i> Listen'; };
    recognition.start();
    setTimeout(() => { if (listenButton.disabled) recognition.stop(); }, 5000);
}

function goToMainPage() {window.location.href = '../../../../selectores/selector-kinestesico.html'; }
