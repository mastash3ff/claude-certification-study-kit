import { describe, expect, it } from "vitest";
import { calculateResults, createProgress, isCorrect, shuffledOptions, validateProgress } from "../src/lib/core";
import { getTrack } from "../src/lib/catalog";
import { getQuestions } from "../src/lib/questions";

describe("practice engine", () => {
  const track = getTrack("ccao-f")!;
  const questions = getQuestions("ccao-f").slice(0, 3);

  it("preserves all options when shuffling", () => {
    const shuffled = shuffledOptions(questions[0].options, () => 0);
    expect(shuffled.map(({ id }) => id).sort()).toEqual(questions[0].options.map(({ id }) => id).sort());
  });

  it("creates and validates a resumable session", () => {
    const progress = createProgress(track.id, "diagnostic", null, questions);
    expect(validateProgress(progress, questions)).toEqual(progress);
    expect(() => validateProgress({ ...progress, questionOrder: ["unknown"] }, questions)).toThrow(/unknown question/);
  });

  it("scores exact selections and ranks weighted study priority", () => {
    const answers = Object.fromEntries(questions.map((question, index) => [question.id, index === 0 ? question.correct : []]));
    expect(isCorrect(questions[0], answers[questions[0].id])).toBe(true);
    const result = calculateResults(questions, track.domains, answers);
    expect(result).toMatchObject({ correct: 1, total: 3, percent: 33 });
    expect(result.domains[0].priority).toBeGreaterThanOrEqual(result.domains.at(-1)!.priority);
  });
});
