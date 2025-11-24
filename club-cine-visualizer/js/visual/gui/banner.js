let Banner = new function() {

    const STORAGE_KEY = "tickerMessages";
    const DEFAULT_MESSAGES = [
        "MERCI DE METTRE VOS TÉLÉPHONES EN SILENCIEUX 📵 — PLACE AU CINÉMA !",
        "LE CLUB CINÉ VOUS SOUHAITE UNE EXCELLENTE PROJECTION 🎬✨",
        "POPCORN CHAUD À PETIT PRIX 🍿 — FAITES-VOUS PLAISIR !"
    ];

    let ticker;
    let track;
    let textEl;
    let messages = DEFAULT_MESSAGES.slice(0);
    let idx = 0;
    let paused = false;

    this.setUp = function() {
        ticker = document.getElementById("ticker");
        track = document.getElementById("ticker-track");
        textEl = document.getElementById("ticker-text");

        if (!ticker || !track || !textEl) {
            return;
        }

        loadMessages();
        applyCurrent();

        let audioEl = document.getElementById("audio");
        if (audioEl && audioEl.paused) {
            this.setPaused(true);
        }

        ticker.addEventListener("click", handleEditClick);

        track.addEventListener("animationiteration", function() {
            advance();
        });
    }

    this.setMessages = function(arr) {
        setMessages(arr);
    }

    this.setPaused = function(shouldPause) {
        if (!track) {
            return;
        }
        paused = shouldPause;
        track.style.animationPlayState = paused ? "paused" : "running";
    }

    let handleEditClick = function() {
        // Affiche les messages actuels avec de vrais sauts de ligne
        let currentStr = messages.join("\n");

        let updated = prompt(
            "Messages de la banderolle (sépare par des retours à la ligne ou '|') :",
            currentStr
        );

        if (updated !== null) {
            // Sépare soit sur retour à la ligne, soit sur '|'
            // \r?\n pour gérer Windows (\r\n) et Unix (\n)
            let arr = updated
                .split(/\r?\n|\|/)
                .map(s => s.trim())
                .filter(Boolean);

            setMessages(arr.length > 0 ? arr : DEFAULT_MESSAGES);
        }
    };


    let loadMessages = function() {
        let saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                let parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    messages = parsed;
                }
            } catch (e) {
                // ignore parse error
            }
        }
    }

    let setMessages = function(arr) {
        messages = arr.slice(0);
        idx = 0;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        applyCurrent();
    }

    let advance = function() {
        idx = (idx + 1) % messages.length;
        applyCurrent();
    }

    let applyCurrent = function() {
        textEl.innerText = messages[idx] || "";
        resetAnimation();
    }

    // restart the animation so the scroll loops from the right after an update
    let resetAnimation = function() {
        track.style.animation = "none";
        // force reflow
        void track.offsetWidth;
        let duration = Math.max(12, textEl.innerText.length * 0.35);
        track.style.animation = "ticker-scroll " + duration + "s linear infinite";
        track.style.animationPlayState = paused ? "paused" : "running";
    }

}
