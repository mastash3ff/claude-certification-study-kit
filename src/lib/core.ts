import type { Domain, ProgressRecordV2, Question, QuestionOption, TrackId } from "./types";

const sameSet = (left: string[], right: string[]): boolean => {
  if (left.length !== right.length) return false;
  const expected = new Set(right);
  return left.every((value) => expected.has(value));
};

export function shuffledOptions(options: QuestionOption[], random = Math.random): QuestionOption[] {
  const result = options.map((option) => ({ ...option }));
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function createProgress(
  track: TrackId,
  mode: "diagnostic" | "drill",
  domain: string | null,
  questions: Question[],
): ProgressRecordV2 {
  const optionOrder = Object.fromEntries(
    questions.map((question) => [question.id, shuffledOptions(question.options).map((option) => option.id)]),
  );
  return {
    schemaVersion: 2,
    track,
    mode,
    domain,
    questionOrder: questions.map((question) => question.id),
    optionOrder,
    answers: {},
    flagged: [],
    revealed: [],
    startedAt: new Date().toISOString(),
    elapsedSeconds: 0,
    completedAt: null,
  };
}

export function validateProgress(progress: ProgressRecordV2, questions: Question[]): ProgressRecordV2 {
  if (!progress || progress.schemaVersion !== 2) throw new Error("Unsupported progress version.");
  if (!Array.isArray(progress.questionOrder) || !progress.questionOrder.length) throw new Error("Progress has no questions.");
  if (new Set(progress.questionOrder).size !== progress.questionOrder.length) throw new Error("Progress has duplicate questions.");
  const byId = new Map(questions.map((question) => [question.id, question]));
  const active = new Set(progress.questionOrder);
  if (progress.questionOrder.some((id) => !byId.has(id))) throw new Error("Progress contains an unknown question.");
  if (progress.flagged.some((id) => !active.has(id)) || progress.revealed.some((id) => !active.has(id))) {
    throw new Error("Progress references an inactive question.");
  }
  for (const questionId of progress.questionOrder) {
    const question = byId.get(questionId)!;
    const validOptions = new Set(question.options.map((option) => option.id));
    const order = progress.optionOrder[questionId];
    if (!Array.isArray(order) || order.length !== validOptions.size || new Set(order).size !== order.length || order.some((id) => !validOptions.has(id))) {
      throw new Error("Progress option order does not match the question bank.");
    }
  }
  for (const [questionId, selected] of Object.entries(progress.answers)) {
    const question = byId.get(questionId);
    if (!question || !active.has(questionId) || !Array.isArray(selected) || new Set(selected).size !== selected.length || selected.length > question.select) {
      throw new Error("Progress answers do not match the question bank.");
    }
    const validOptions = new Set(question.options.map((option) => option.id));
    if (selected.some((id) => !validOptions.has(id))) throw new Error("Progress contains an unknown option.");
  }
  if (!Number.isFinite(progress.elapsedSeconds) || progress.elapsedSeconds < 0) throw new Error("Progress elapsed time is invalid.");
  return structuredClone(progress);
}

export function calculateResults(questions: Question[], domains: Domain[], answers: Record<string, string[]>) {
  const byDomain = new Map(domains.map((domain) => [domain.id, { ...domain, correct: 0, total: 0 }]));
  let correct = 0;
  for (const question of questions) {
    const isCorrect = sameSet(answers[question.id] ?? [], question.correct);
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
    return { ...domain, percent: Math.round(accuracy * 100), priority: Math.round((1 - accuracy) * domain.weight * 10) / 10 };
  }).filter((domain) => domain.total > 0).sort((left, right) => right.priority - left.priority || left.id.localeCompare(right.id));
  return { correct, total: questions.length, percent: questions.length ? Math.round((correct / questions.length) * 100) : 0, domains: domainResults };
}

export function isCorrect(question: Question, selected: string[]): boolean {
  return sameSet(selected, question.correct);
}
