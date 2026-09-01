export const PROGRESS_VERSION = 1;

const sameSet = (left, right) => {
  if (left.length !== right.length) return false;
  const expected = new Set(right);
  return left.every((value) => expected.has(value));
};

export function shuffledOptions(options, random = Math.random) {
  const result = options.map((option) => ({ ...option }));
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function createProgress(track, questionOrder) {
  return {
    version: PROGRESS_VERSION,
    track,
    questionOrder: [...questionOrder],
    optionOrder: {},
    answers: {},
    flagged: [],
    startedAt: new Date().toISOString(),
    completedAt: null,
  };
}

export function normalizeImportedProgress(value) {
  if (!value || value.version !== PROGRESS_VERSION) {
    throw new Error(`Unsupported progress version; expected version ${PROGRESS_VERSION}.`);
  }
  if (!["ccar-f", "ccar-p"].includes(value.track)) {
    throw new Error("Progress track must be ccar-f or ccar-p.");
  }
  if (!Array.isArray(value.questionOrder) || !Array.isArray(value.flagged)) {
    throw new Error("Progress question order and flagged values must be arrays.");
  }
  if (value.questionOrder.some((item) => typeof item !== "string") || new Set(value.questionOrder).size !== value.questionOrder.length) {
    throw new Error("Progress question order must contain unique question IDs.");
  }
  if (value.flagged.some((item) => typeof item !== "string")) {
    throw new Error("Progress flagged values must contain question IDs.");
  }
  if (!value.optionOrder || typeof value.optionOrder !== "object" || Array.isArray(value.optionOrder)) {
    throw new Error("Progress optionOrder must be an object.");
  }
  if (!value.answers || typeof value.answers !== "object" || Array.isArray(value.answers)) {
    throw new Error("Progress answers must be an object.");
  }
  for (const answer of Object.values(value.answers)) {
    if (!Array.isArray(answer) || answer.some((item) => typeof item !== "string")) {
      throw new Error("Progress answers must contain arrays of option IDs.");
    }
  }
  for (const order of Object.values(value.optionOrder)) {
    if (!Array.isArray(order) || order.some((item) => typeof item !== "string")) {
      throw new Error("Progress optionOrder must contain arrays of option IDs.");
    }
  }
  if (typeof value.startedAt !== "string") {
    throw new Error("Progress startedAt must be an ISO timestamp string.");
  }
  if (value.completedAt !== null && typeof value.completedAt !== "string") {
    throw new Error("Progress completedAt must be null or an ISO timestamp string.");
  }
  return structuredClone(value);
}

export function validateProgressForQuestions(progress, questions) {
  const byId = new Map(questions.map((question) => [question.id, question]));
  const active = new Set(progress.questionOrder);
  if (!active.size || progress.questionOrder.some((id) => !byId.has(id))) {
    throw new Error("Progress contains an unknown question ID.");
  }
  if (progress.flagged.some((id) => !active.has(id))) {
    throw new Error("Progress flags must refer to active questions.");
  }
  for (const [questionId, selected] of Object.entries(progress.answers)) {
    const question = byId.get(questionId);
    const validOptions = new Set(question?.options.map((option) => option.id));
    if (!active.has(questionId) || !question || selected.some((id) => !validOptions.has(id)) || new Set(selected).size !== selected.length || selected.length > question.select) {
      throw new Error("Progress answers do not match the question bank.");
    }
  }
  for (const questionId of progress.questionOrder) {
    const question = byId.get(questionId);
    const order = progress.optionOrder[questionId];
    const expected = new Set(question.options.map((option) => option.id));
    if (!Array.isArray(order) || order.length !== expected.size || order.some((id) => !expected.has(id)) || new Set(order).size !== order.length) {
      throw new Error("Progress option order does not match the question bank.");
    }
  }
  return progress;
}

export function calculateResults(questions, domains, answers) {
  const byDomain = new Map(domains.map((domain) => [domain.id, {
    ...domain,
    correct: 0,
    total: 0,
  }]));
  let correct = 0;

  for (const question of questions) {
    const selected = answers[question.id] ?? [];
    const isCorrect = sameSet(selected, question.correct);
    const domain = byDomain.get(question.domain);
    if (!domain) throw new Error(`Unknown domain ${question.domain}.`);
    domain.total += 1;
    if (isCorrect) {
      correct += 1;
      domain.correct += 1;
    }
  }

  const domainResults = [...byDomain.values()].map((domain) => {
    const accuracy = domain.total ? domain.correct / domain.total : 0;
    return {
      ...domain,
      accuracy,
      percent: Math.round(accuracy * 100),
      priority: Math.round((1 - accuracy) * domain.weight * 10) / 10,
    };
  }).sort((left, right) => right.priority - left.priority || left.id.localeCompare(right.id));

  return {
    correct,
    total: questions.length,
    percent: questions.length ? Math.round((correct / questions.length) * 100) : 0,
    domains: domainResults,
  };
}
