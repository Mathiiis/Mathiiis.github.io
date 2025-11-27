let Countdown = new function() {

    const STORAGE_DURATION = "countdownDurationMs";
    const STORAGE_TARGET = "countdownTarget";
    const DEFAULT_MS = 5 * 60 * 1000; // 5 minutes
    const LABEL_PREFIX = "Début de la projection dans : ";

    let el;
    let durationMs = DEFAULT_MS;
    let targetTime;
    let intervalId;

    this.setUp = function() {
        el = document.getElementById("countdown");
        if (!el) {
            return;
        }

        loadState();
        if (!targetTime || targetTime <= Date.now()) {
            resetTarget();
        }

        render();
        startTick();

        el.addEventListener("click", handleClick);
    }

    let handleClick = function() {
        let current = formatMs(Math.max(0, targetTime - Date.now()));
        let input = prompt("Durée du compte à rebours (hh:mm:ss ou mm:ss)", current);
        if (input === null) {
            return; // cancelled
        }
        let parsed = parseDuration(input.trim());
        if (parsed === null) {
            alert("Format invalide. Utilise hh:mm:ss, mm:ss ou secondes.");
            return;
        }
        durationMs = parsed;
        resetTarget();
        render();
        startTick(true);
        saveState();
    }

    let startTick = function(restart = false) {
        if (restart && intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        if (!intervalId) {
            intervalId = setInterval(tick, 1000);
            tick(); // immediate refresh so it doesn't appear frozen
        }
    }

    let tick = function() {
        let remaining = Math.max(0, targetTime - Date.now());
        if (remaining <= 0) {
            render("00:00");
            clearInterval(intervalId);
            intervalId = null;
            return;
        }
        render(formatMs(remaining));
    }

    let render = function(str) {
        if (!el) {
            return;
        }
        let display = str || formatMs(Math.max(0, targetTime - Date.now()));
        el.innerText = LABEL_PREFIX + display;
    }

    let resetTarget = function() {
        targetTime = Date.now() + durationMs;
        saveState();
    }

    let saveState = function() {
        localStorage.setItem(STORAGE_DURATION, durationMs.toString());
        localStorage.setItem(STORAGE_TARGET, targetTime.toString());
    }

    let loadState = function() {
        let storedDur = localStorage.getItem(STORAGE_DURATION);
        if (storedDur) {
            let val = parseInt(storedDur);
            if (!isNaN(val) && val > 0) {
                durationMs = val;
            }
        }
        let storedTarget = localStorage.getItem(STORAGE_TARGET);
        if (storedTarget) {
            let val = parseInt(storedTarget);
            if (!isNaN(val) && val > 0) {
                targetTime = val;
            }
        }
    }

    let parseDuration = function(str) {
        if (!str) {
            return null;
        }
        if (/^\d+$/.test(str)) {
            return parseInt(str, 10) * 1000;
        }
        let parts = str.split(":").map(p => p.trim()).filter(Boolean);
        if (parts.length === 2) {
            let m = parseInt(parts[0], 10);
            let s = parseInt(parts[1], 10);
            if (isNaN(m) || isNaN(s)) {
                return null;
            }
            return ((m * 60) + s) * 1000;
        }
        if (parts.length === 3) {
            let h = parseInt(parts[0], 10);
            let m = parseInt(parts[1], 10);
            let s = parseInt(parts[2], 10);
            if ([h, m, s].some(isNaN)) {
                return null;
            }
            return ((h * 3600) + (m * 60) + s) * 1000;
        }
        return null;
    }

    let formatMs = function(ms) {
        let totalSeconds = Math.floor(ms / 1000);
        let s = totalSeconds % 60;
        let totalMinutes = Math.floor(totalSeconds / 60);
        let m = totalMinutes % 60;
        let h = Math.floor(totalMinutes / 60);
        if (h > 0) {
            return pad(h) + ":" + pad(m) + ":" + pad(s);
        }
        return pad(m) + ":" + pad(s);
    }

    let pad = function(n) {
        return (n < 10 ? "0" : "") + n;
    }

}
