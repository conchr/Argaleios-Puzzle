/* ============================================================
   ΚΡΕΜΑΛΑ — ΠΗΛΙΝΗ ΚΥΨΕΛΗ
   Αρχαιολογική Συλλογή Φαρσάλων / Κάστρο Καλλιθέας
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    // ------------------------------------------------------------
    // DOM
    // ------------------------------------------------------------
    const wordDisplay      = document.getElementById('word-display');
    const alphabetEl       = document.getElementById('alphabet');
    const messageEl        = document.getElementById('message');
    const mistakesCountEl  = document.getElementById('mistakes-count');
    const infoOverlay      = document.getElementById('info-overlay');
    const restartBtn       = document.getElementById('restart-btn');
    const backBtn          = document.getElementById('back-btn');
    const hangmanSvg       = document.querySelector('.hangman-svg');

    // ------------------------------------------------------------
    // CONSTANTS
    // ------------------------------------------------------------
    const TARGET_WORD = 'ΚΥΨΕΛΗ';
    const GREEK_ALPHABET = [
        'Α','Β','Γ','Δ','Ε','Ζ','Η','Θ','Ι','Κ','Λ','Μ',
        'Ν','Ξ','Ο','Π','Ρ','Σ','Τ','Υ','Φ','Χ','Ψ','Ω'
    ];
    const MAX_WRONG = 6;
    const GAMES_HUB_URL = 'https://conchr.github.io/Games/';

    // ------------------------------------------------------------
    // STATE
    // ------------------------------------------------------------
    let guessedLetters = [];
    let wrongCount = 0;
    let gameOver = false;

    // ------------------------------------------------------------
    // RENDER — WORD SLOTS
    // ------------------------------------------------------------
    function renderWordSlots() {
        wordDisplay.innerHTML = '';
        for (const ch of TARGET_WORD) {
            const slot = document.createElement('div');
            slot.className = 'letter-slot';
            slot.dataset.letter = ch;
            wordDisplay.appendChild(slot);
        }
    }

    // ------------------------------------------------------------
    // RENDER — ALPHABET
    // ------------------------------------------------------------
    function renderAlphabet() {
        alphabetEl.innerHTML = '';
        GREEK_ALPHABET.forEach(letter => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'letter-btn';
            btn.textContent = letter;
            btn.dataset.letter = letter;
            btn.setAttribute('aria-label', 'Γράμμα ' + letter);
            btn.addEventListener('click', () => guessLetter(letter));
            alphabetEl.appendChild(btn);
        });
    }

    // ------------------------------------------------------------
    // UPDATE — HANGMAN PARTS
    // ------------------------------------------------------------
    function updateHangman() {
        // Reset όλα
        document.querySelectorAll('.hangman-part').forEach(p => p.classList.remove('visible'));

        // Εμφάνιση τόσων μερών όσα τα λάθη
        for (let i = 1; i <= wrongCount; i++) {
            const part = document.querySelector(`.hangman-part[data-part="${i}"]`);
            if (part) part.classList.add('visible');
        }
    }

    // ------------------------------------------------------------
    // SHAKE ANIMATION
    // ------------------------------------------------------------
    function shakeHangman() {
        hangmanSvg.classList.remove('shake');
        // force reflow
        void hangmanSvg.offsetWidth;
        hangmanSvg.classList.add('shake');
        setTimeout(() => hangmanSvg.classList.remove('shake'), 450);
    }

    // ------------------------------------------------------------
    // GUESS LETTER
    // ------------------------------------------------------------
    function guessLetter(letter) {
        if (gameOver || guessedLetters.includes(letter)) return;
        guessedLetters.push(letter);

        const btn = alphabetEl.querySelector(`[data-letter="${letter}"]`);
        if (btn) btn.disabled = true;

        if (TARGET_WORD.includes(letter)) {
            if (btn) btn.classList.add('correct');

            document.querySelectorAll('.letter-slot').forEach(slot => {
                if (slot.dataset.letter === letter && !slot.textContent) {
                    slot.textContent = letter;
                    slot.classList.add('revealed');
                }
            });

            checkWin();
        } else {
            if (btn) btn.classList.add('wrong');
            wrongCount++;
            mistakesCountEl.textContent = wrongCount;

            updateHangman();
            shakeHangman();
            checkLose();
        }
    }

    // ------------------------------------------------------------
    // CHECK WIN
    // ------------------------------------------------------------
    function checkWin() {
        const won = Array.from(document.querySelectorAll('.letter-slot'))
            .every(slot => slot.textContent !== '');

        if (!won) return;

        gameOver = true;
        messageEl.textContent = '🎉 Συγχαρητήρια! Βρήκες τη λέξη!';
        messageEl.className = 'win-message';

        setTimeout(() => {
            infoOverlay.classList.add('visible');
        }, 700);
    }

    // ------------------------------------------------------------
    // CHECK LOSE
    // ------------------------------------------------------------
    function checkLose() {
        if (wrongCount < MAX_WRONG) return;

        gameOver = true;
        messageEl.textContent = `💀 Κρίμα! Η λέξη ήταν: ${TARGET_WORD}`;
        messageEl.className = 'lose-message';

        document.querySelectorAll('.letter-slot').forEach(slot => {
            if (!slot.textContent) {
                slot.textContent = slot.dataset.letter;
                slot.style.color = 'var(--red-light)';
            }
        });
    }

    // ------------------------------------------------------------
    // CLOSE INFO OVERLAY (exposed globally for inline onclick)
    // ------------------------------------------------------------
    window.closeInfo = function () {
        infoOverlay.classList.remove('visible');
    };

    // ------------------------------------------------------------
    // INIT / RESTART
    // ------------------------------------------------------------
    function initGame() {
        guessedLetters = [];
        wrongCount = 0;
        gameOver = false;

        infoOverlay.classList.remove('visible');
        messageEl.textContent = 'Διάλεξε ένα γράμμα για να ξεκινήσεις!';
        messageEl.className = '';
        mistakesCountEl.textContent = '0';

        updateHangman();
        renderWordSlots();
        renderAlphabet();
    }

    // ------------------------------------------------------------
    // EVENT LISTENERS
    // ------------------------------------------------------------
    restartBtn.addEventListener('click', initGame);

    backBtn.addEventListener('click', function () {
        window.location.href = GAMES_HUB_URL;
    });

    // Keyboard support — ελληνικά γράμματα
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            window.location.href = GAMES_HUB_URL;
            return;
        }
        const key = e.key.toUpperCase();
        if (GREEK_ALPHABET.includes(key)) {
            guessLetter(key);
        }
    });

    // ------------------------------------------------------------
    // INIT
    // ------------------------------------------------------------
    initGame();
});