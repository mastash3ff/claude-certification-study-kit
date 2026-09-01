import {
  calculateResults,
  createProgress,
  normalizeImportedProgress,
  shuffledOptions,
  validateProgressForQuestions,
} from "./core.mjs";

const EXTERNAL_MOCKS = {
  "ccar-f": {
    label: "Claude Certification Guide CCAR-F mock",
    url: "https://claudecertificationguide.com/mock-exam",
    note: "Use after remediation for unseen, full-length calibration. Verify disputed explanations against Anthropic documentation.",
  },
  "ccar-p": {
    label: "Ravn CCAR-P practice exam",
    url: "https://ravnhq.github.io/claude-certified-architect/guides/professional-en.html#ravn-practice-exam",
    note: "Use after the end-to-end capstone to rehearse the 63-item Professional format.",
  },
};

const views = ["home-view", "track-view", "quiz-view", "results-view"];
const state = {
  metadata: null,
  track: null,
  questions: [],
  progress: null,
  index: 0,
  timer: null,
};

const byId = (id) => document.getElementById(id);
const storageKey = (track) => `claude-architect-study:${track}:v1`;
const questionMap = () => new Map(state.questions.map((question) => [question.id, question]));

function showView(id) {
  if (id !== "quiz-view" && state.timer) {
    window.clearInterval(state.timer);
    state.timer = null;
  }
  views.forEach((view) => byId(view).classList.toggle("hidden", view !== id));
  byId("app").focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toast(message) {
  const element = byId("toast");
  element.textContent = message;
  element.classList.add("visible");
  window.setTimeout(() => element.classList.remove("visible"), 2600);
}

async function loadMetadata() {
  const response = await fetch("data/tracks.json");
  if (!response.ok) throw new Error("Could not load track metadata.");
  state.metadata = await response.json();
}

async function loadTrack(trackId) {
  state.track = state.metadata.tracks.find((track) => track.id === trackId);
  if (!state.track) throw new Error(`Unknown track ${trackId}.`);
  const response = await fetch(`data/${trackId}.json`);
  if (!response.ok) throw new Error(`Could not load ${trackId} questions.`);
  state.questions = (await response.json()).questions;
  renderTrack();
  showView("track-view");
}

function renderHome() {
  byId("track-grid").innerHTML = state.metadata.tracks.map((track) => `
    <article class="track-card">
      <p class="eyebrow">${track.id.toUpperCase()}</p>
      <h2>${track.shortName}</h2>
      <div class="facts"><span><strong>${track.domains.length}</strong> domains</span><span><strong>${track.expectedQuestions}</strong> diagnostic items</span><span><strong>${track.examItems}</strong> exam items</span></div>
      <p>${track.id === "ccar-f" ? "Product mechanics, orchestration, Claude Code, MCP, structured output, and reliability." : "Enterprise solution design, integration, evaluation, governance, stakeholder leadership, and operations."}</p>
      <button class="primary" type="button" data-track="${track.id}">Open track</button>
    </article>`).join("");
}

function savedProgress(trackId) {
  const raw = localStorage.getItem(storageKey(trackId));
  if (!raw) return null;
  try {
    return normalizeImportedProgress(JSON.parse(raw));
  } catch {
    return null;
  }
}

function renderTrack() {
  const saved = savedProgress(state.track.id);
  byId("track-code").textContent = state.track.id.toUpperCase();
  byId("track-title").textContent = state.track.shortName;
  byId("track-summary").textContent = `${state.track.expectedQuestions} original questions cover every published objective once. The diagnostic is intentionally shorter than the ${state.track.examItems}-item exam and reports raw accuracy, not a scaled score.`;
  byId("domain-grid").innerHTML = state.track.domains.map((domain) => `
    <article class="domain-card">
      <span class="weight">${domain.weight}% of exam</span>
      <h3>${domain.name}</h3>
      <p>${domain.objectives.length} objectives in this diagnostic.</p>
      <button class="secondary" type="button" data-domain="${domain.id}">Drill this domain</button>
    </article>`).join("");
  const mock = EXTERNAL_MOCKS[state.track.id];
  byId("track-resource").innerHTML = `<strong>Final calibration:</strong> <a href="${mock.url}" target="_blank" rel="noreferrer">${mock.label}</a>. ${mock.note}`;
  document.querySelector('[data-action="resume"]').classList.toggle("hidden", !saved || saved.completedAt);
}

function persist() {
  if (!state.progress) return;
  localStorage.setItem(storageKey(state.progress.track), JSON.stringify(state.progress));
}

function startQuiz(questionIds) {
  const saved = savedProgress(state.track.id);
  if (saved && !saved.completedAt && !window.confirm("Starting a new session will replace unfinished progress for this track. Continue?")) return;
  state.progress = createProgress(state.track.id, questionIds);
  const map = questionMap();
  for (const id of questionIds) {
    state.progress.optionOrder[id] = shuffledOptions(map.get(id).options).map((option) => option.id);
  }
  state.index = 0;
  persist();
  beginTimer();
  renderQuestion();
  showView("quiz-view");
}

function resumeQuiz(progress) {
  if (progress.track !== state.track.id) {
    throw new Error("Saved progress does not match this question bank.");
  }
  state.progress = validateProgressForQuestions(progress, state.questions);
  state.index = Math.max(0, progress.questionOrder.findIndex((id) => !progress.answers[id]));
  beginTimer();
  renderQuestion();
  showView("quiz-view");
}

function beginTimer() {
  if (state.timer) window.clearInterval(state.timer);
  const update = () => {
    const seconds = Math.max(0, Math.floor((Date.now() - Date.parse(state.progress.startedAt)) / 1000));
    byId("elapsed").textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  };
  update();
  state.timer = window.setInterval(update, 1000);
}

function currentQuestion() {
  return questionMap().get(state.progress.questionOrder[state.index]);
}

function renderQuestion() {
  const question = currentQuestion();
  const domain = state.track.domains.find((item) => item.id === question.domain);
  const objective = domain.objectives.find((item) => item.id === question.objective);
  const selected = state.progress.answers[question.id] ?? [];
  const optionById = new Map(question.options.map((option) => [option.id, option]));
  const order = state.progress.optionOrder[question.id] ?? question.options.map((option) => option.id);
  const inputType = question.select === 1 ? "radio" : "checkbox";

  byId("question-position").textContent = `Question ${state.index + 1} of ${state.progress.questionOrder.length}`;
  byId("question-domain").textContent = domain.name;
  byId("question-objective").textContent = `Objective ${question.objective}: ${objective.name}`;
  byId("question-title").textContent = question.stem;
  byId("select-hint").textContent = question.select === 1 ? "Select one answer." : `Select ${question.select} answers.`;
  byId("progress-bar").style.width = `${((state.index + 1) / state.progress.questionOrder.length) * 100}%`;
  byId("flag-button").classList.toggle("active", state.progress.flagged.includes(question.id));
  byId("flag-button").textContent = state.progress.flagged.includes(question.id) ? "Flagged" : "Flag for review";
  byId("answer-form").innerHTML = order.map((optionId) => {
    const option = optionById.get(optionId);
    return `<label class="option"><input type="${inputType}" name="answer" value="${option.id}" ${selected.includes(option.id) ? "checked" : ""}><span>${option.text}</span></label>`;
  }).join("");
}

function updateAnswer(event) {
  const question = currentQuestion();
  const selected = [...document.querySelectorAll('#answer-form input:checked')].map((input) => input.value);
  if (question.select > 1 && selected.length > question.select) {
    const changed = event.target;
    if (changed instanceof HTMLInputElement) changed.checked = false;
    toast(`Select exactly ${question.select} answers.`);
    return;
  }
  if (selected.length) state.progress.answers[question.id] = selected;
  else delete state.progress.answers[question.id];
  persist();
}

function move(delta) {
  state.index = Math.max(0, Math.min(state.progress.questionOrder.length - 1, state.index + delta));
  renderQuestion();
}

function finishQuiz() {
  const unanswered = state.progress.questionOrder.filter((id) => !state.progress.answers[id]).length;
  if (unanswered && !window.confirm(`${unanswered} question(s) are unanswered. Finish anyway?`)) return;
  state.progress.completedAt = new Date().toISOString();
  persist();
  if (state.timer) window.clearInterval(state.timer);
  renderResults();
  showView("results-view");
}

function renderResults() {
  const active = state.progress.questionOrder.map((id) => questionMap().get(id));
  const activeDomainIds = new Set(active.map((question) => question.domain));
  const domains = state.track.domains.filter((domain) => activeDomainIds.has(domain.id));
  const result = calculateResults(active, domains, state.progress.answers);
  byId("score-card").innerHTML = `<strong>${result.percent}%</strong><span>${result.correct} of ${result.total} correct, raw diagnostic score</span>`;
  byId("domain-results").innerHTML = result.domains.map((domain) => `<tr><td>${domain.name}</td><td>${domain.correct}/${domain.total}</td><td>${domain.percent}%</td><td>${domain.priority}</td></tr>`).join("");
  const mock = EXTERNAL_MOCKS[state.track.id];
  byId("results-resource").innerHTML = `<strong>Next:</strong> study the highest-priority domain, complete its hands-on exercise, then use <a href="${mock.url}" target="_blank" rel="noreferrer">${mock.label}</a> for unseen calibration. ${mock.note}`;
  byId("review-list").innerHTML = "";
}

function renderMissed() {
  const map = questionMap();
  const sourceMap = state.metadata.sources;
  const missed = state.progress.questionOrder.map((id) => map.get(id)).filter((question) => {
    const selected = state.progress.answers[question.id] ?? [];
    return selected.length !== question.correct.length || selected.some((id) => !question.correct.includes(id));
  });
  byId("review-list").innerHTML = missed.length ? `<h2>Missed and unanswered</h2>${missed.map((question) => {
    const selected = state.progress.answers[question.id] ?? [];
    return `<article class="review-card"><p class="eyebrow">Objective ${question.objective}</p><h3>${question.stem}</h3>${question.options.map((option) => {
      const classes = [question.correct.includes(option.id) ? "correct" : "", selected.includes(option.id) && !question.correct.includes(option.id) ? "selected-wrong" : ""].filter(Boolean).join(" ");
      return `<div class="review-option ${classes}"><strong>${option.text}</strong><small>${option.rationale}</small></div>`;
    }).join("")}<p class="source-list">Sources: ${question.sources.map((id) => `<a href="${sourceMap[id].url}" target="_blank" rel="noreferrer">${sourceMap[id].label}</a>`).join("; ")}</p></article>`;
  }).join("")}` : "<p>No missed questions in this session.</p>";
  byId("review-list").scrollIntoView({ behavior: "smooth" });
}

function exportProgress() {
  const records = state.metadata.tracks.map((track) => savedProgress(track.id)).filter(Boolean);
  if (!records.length) return toast("There is no saved progress to export.");
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), records }, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "claude-architect-progress.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

async function importProgress(file) {
  const payload = JSON.parse(await file.text());
  if (!Array.isArray(payload.records) || !payload.records.length) throw new Error("Import has no progress records.");
  const validated = [];
  for (const record of payload.records) {
    const progress = normalizeImportedProgress(record);
    const response = await fetch(`data/${progress.track}.json`);
    if (!response.ok) throw new Error(`Could not validate ${progress.track} progress.`);
    const questions = (await response.json()).questions;
    validated.push(validateProgressForQuestions(progress, questions));
  }
  for (const progress of validated) {
    localStorage.setItem(storageKey(progress.track), JSON.stringify(progress));
  }
  toast("Progress imported.");
  if (state.track) renderTrack();
}

document.addEventListener("click", async (event) => {
  try {
    const trackButton = event.target.closest("[data-track]");
    if (trackButton) return await loadTrack(trackButton.dataset.track);
    const domainButton = event.target.closest("[data-domain]");
    if (domainButton) return startQuiz(state.questions.filter((question) => question.domain === domainButton.dataset.domain).map((question) => question.id));
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;
    if (action === "home") showView("home-view");
    if (action === "track" || action === "exit-quiz") { renderTrack(); showView("track-view"); }
    if (action === "start-diagnostic" || action === "restart") startQuiz(state.questions.map((question) => question.id));
    if (action === "resume") resumeQuiz(savedProgress(state.track.id));
    if (action === "previous") move(-1);
    if (action === "next") move(1);
    if (action === "finish") finishQuiz();
    if (action === "review-missed") renderMissed();
    if (action === "flag") {
      const id = currentQuestion().id;
      state.progress.flagged = state.progress.flagged.includes(id) ? state.progress.flagged.filter((item) => item !== id) : [...state.progress.flagged, id];
      persist(); renderQuestion();
    }
    if (action === "reset" && window.confirm(`Delete saved ${state.track.id.toUpperCase()} progress?`)) {
      localStorage.removeItem(storageKey(state.track.id)); renderTrack(); toast("Saved progress reset.");
    }
  } catch (error) {
    toast(`Action failed: ${error.message}`);
  }
});

byId("answer-form").addEventListener("change", updateAnswer);
byId("export-button").addEventListener("click", exportProgress);
byId("import-file").addEventListener("change", async (event) => {
  try { if (event.target.files[0]) await importProgress(event.target.files[0]); }
  catch (error) { toast(`Import failed: ${error.message}`); }
  event.target.value = "";
});
window.addEventListener("hashchange", () => { if (location.hash === "#home") showView("home-view"); });

try {
  await loadMetadata();
  renderHome();
} catch (error) {
  byId("track-grid").innerHTML = `<p>Could not load the study kit: ${error.message} Run it through the local HTTP server described in the README.</p>`;
}
