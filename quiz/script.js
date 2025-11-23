const QUESTIONS_PER_GAME = 10;

const quizContainer = document.getElementById("quiz-container");
const feedbackEl = document.getElementById("feedback");
const resultsEl = document.getElementById("results");
const scoreText = document.getElementById("score-text");
const toggleAnswersBtn = document.getElementById("toggle-answers");
const submitBtn = document.getElementById("submit-answers");
const newGameBtn = document.getElementById("new-game");
const themeToggleBtn = document.getElementById("theme-toggle");

const THEME_KEY = "clubcine-theme";

let allQuestions = [];
let currentQuestions = [];
let selections = {};
let revealAnswers = false;
let gameLocked = false;

async function loadQuestions() {
  setFeedback("Chargement des questions...");
  try {
    const res = await fetch("data.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Aucune question trouvée.");
    }
    allQuestions = data;
    startNewGame();
  } catch (err) {
    setFeedback(`Impossible de charger les questions (${err.message}).`);
  }
}

function startNewGame() {
  if (!allQuestions.length) return;
  currentQuestions = pickRandomQuestions(allQuestions, QUESTIONS_PER_GAME);
  selections = {};
  revealAnswers = false;
  gameLocked = false;
  quizContainer.innerHTML = "";
  resultsEl.classList.add("hidden");
  toggleAnswersBtn.textContent = "Voir les réponses";
  setFeedback("Répondez aux questions puis cliquez sur Soumettre.");
  currentQuestions.forEach((question, index) => {
    quizContainer.appendChild(createQuestionCard(question, index));
  });
}

function pickRandomQuestions(list, count) {
  const shuffled = shuffleArray(list);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function shuffleArray(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createQuestionCard(question, index) {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.index = index;

  const header = document.createElement("div");
  header.className = "card-header";

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = typeLabel(question.type);

  const title = document.createElement("p");
  title.className = "card-title";
  title.innerHTML = `<strong>Question ${index + 1}.</strong> ${question.question}`;

  header.appendChild(badge);
  header.appendChild(title);
  card.appendChild(header);

  if (question.type === "image" && question.image) {
    const media = document.createElement("div");
    media.className = "media";
    const img = document.createElement("img");
    img.src = question.image;
    img.alt = "Indice visuel";
    media.appendChild(img);
    card.appendChild(media);
  }

  if (question.type === "audio" && question.audio) {
    const media = document.createElement("div");
    media.className = "media";
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = question.audio;
    media.appendChild(audio);
    card.appendChild(media);
  }

  const choicesWrapper = document.createElement("div");
  choicesWrapper.className = "choices";
  const choices = shuffleArray(question.choices);
  choices.forEach((choiceText) => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.type = "button";
    btn.textContent = choiceText;
    btn.dataset.correct = String(choiceText === question.answer);
    btn.addEventListener("click", () => handleChoiceSelect(index, btn));
    choicesWrapper.appendChild(btn);
  });

  card.appendChild(choicesWrapper);
  return card;
}

function handleChoiceSelect(questionIndex, button) {
  if (gameLocked) return;
  const card = button.closest(".card");
  if (!card) return;
  card.querySelectorAll(".choice").forEach((choice) => {
    choice.classList.remove("selected");
  });
  button.classList.add("selected");
  selections[questionIndex] = button.textContent;
}

function handleSubmit() {
  if (gameLocked) {
    setFeedback("Partie déjà soumise. Lancez une nouvelle partie pour rejouer.");
    return;
  }

  const unanswered = currentQuestions.filter(
    (_, idx) => !Object.prototype.hasOwnProperty.call(selections, idx)
  );
  if (unanswered.length) {
    setFeedback("Veuillez répondre à toutes les questions avant de soumettre.");
    return;
  }

  let score = 0;
  document.querySelectorAll(".card").forEach((card) => {
    const qIndex = Number(card.dataset.index);
    const correctAnswer = currentQuestions[qIndex].answer;
    const choiceButtons = Array.from(card.querySelectorAll(".choice"));
    choiceButtons.forEach((btn) => {
      const isCorrect = btn.dataset.correct === "true";
      const isSelected = btn.classList.contains("selected");
      btn.classList.remove("correct", "incorrect");
      if (isSelected && isCorrect) score += 1;
      if (isSelected) {
        btn.classList.add(isCorrect ? "correct" : "incorrect");
      }
    });
  });

  resultsEl.classList.remove("hidden");
  scoreText.textContent = `Score : ${score} / ${currentQuestions.length}`;
  setFeedback("Réponses soumises. Cliquez sur « Voir les réponses » pour afficher les bonnes.");
  gameLocked = true;
}

function toggleAnswers() {
  if (!gameLocked) {
    setFeedback("Soumettez d'abord vos réponses.");
    return;
  }
  revealAnswers = !revealAnswers;
  document.querySelectorAll(".choice").forEach((btn) => {
    const isCorrect = btn.dataset.correct === "true";
    if (isCorrect && revealAnswers) {
      btn.classList.add("correct");
    } else if (!btn.classList.contains("incorrect")) {
      btn.classList.remove("correct");
    }
  });
  toggleAnswersBtn.textContent = revealAnswers ? "Masquer les réponses" : "Voir les réponses";
}

function typeLabel(type) {
  if (type === "image") return "Image";
  if (type === "audio") return "Audio";
  return "Texte";
}

function setFeedback(message) {
  if (feedbackEl) feedbackEl.textContent = message;
}

function applyTheme(mode) {
  const isDark = mode === "dark";
  document.body.classList.toggle("theme-dark", isDark);
  if (themeToggleBtn) {
    themeToggleBtn.textContent = isDark ? "☀️ Mode clair" : "🌙 Mode sombre";
    themeToggleBtn.setAttribute(
      "aria-label",
      isDark ? "Passer en mode clair" : "Passer en mode sombre"
    );
  }
}

function detectPreferredTheme() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function initTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  const mode = stored === "light" || stored === "dark" ? stored : detectPreferredTheme();
  applyTheme(mode);
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("theme-dark");
    const mode = isDark ? "dark" : "light";
    localStorage.setItem(THEME_KEY, mode);
    applyTheme(mode);
  });
}

submitBtn.addEventListener("click", handleSubmit);
toggleAnswersBtn.addEventListener("click", toggleAnswers);
newGameBtn.addEventListener("click", startNewGame);

initTheme();
loadQuestions();
