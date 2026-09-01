import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateResults,
  createProgress,
  normalizeImportedProgress,
  shuffledOptions,
  validateProgressForQuestions,
} from "../app/core.mjs";

const questions = [
  {
    id: "f-1.1",
    domain: "f-d1",
    correct: ["b"],
    options: [
      { id: "a", text: "A" },
      { id: "b", text: "B" },
      { id: "c", text: "C" },
      { id: "d", text: "D" },
    ],
  },
  {
    id: "f-2.1",
    domain: "f-d2",
    correct: ["a", "d"],
    options: [
      { id: "a", text: "A" },
      { id: "b", text: "B" },
      { id: "c", text: "C" },
      { id: "d", text: "D" },
    ],
  },
];

const domains = [
  { id: "f-d1", name: "One", weight: 60 },
  { id: "f-d2", name: "Two", weight: 40 },
];

test("results require an exact option-set match and rank weighted gaps", () => {
  const result = calculateResults(questions, domains, {
    "f-1.1": ["b"],
    "f-2.1": ["a"],
  });

  assert.equal(result.correct, 1);
  assert.equal(result.total, 2);
  assert.equal(result.percent, 50);
  assert.deepEqual(result.domains.map((domain) => domain.id), ["f-d2", "f-d1"]);
  assert.equal(result.domains[0].priority, 40);
});

test("shuffle preserves every option without mutating the source", () => {
  const original = structuredClone(questions[0].options);
  const shuffled = shuffledOptions(questions[0].options, () => 0);

  assert.deepEqual(questions[0].options, original);
  assert.deepEqual(new Set(shuffled.map((option) => option.id)), new Set(["a", "b", "c", "d"]));
  assert.notDeepEqual(shuffled, original);
});

test("progress round-trips through the public import shape", () => {
  const progress = createProgress("ccar-f", ["f-1.1", "f-2.1"]);
  progress.answers["f-1.1"] = ["b"];

  assert.deepEqual(normalizeImportedProgress(JSON.parse(JSON.stringify(progress))), progress);
});

test("progress import rejects unknown versions and malformed answers", () => {
  assert.throws(() => normalizeImportedProgress({ version: 99 }), /version/i);
  assert.throws(
    () => normalizeImportedProgress({
      version: 1,
      track: "ccar-f",
      questionOrder: ["f-1.1"],
      optionOrder: {},
      answers: { "f-1.1": "b" },
      flagged: [],
      startedAt: "2026-09-01T00:00:00.000Z",
      completedAt: null,
    }),
    /answers/i,
  );
});

test("progress validation rejects unknown questions and invalid option orders", () => {
  const unknown = createProgress("ccar-f", ["f-missing"]);
  unknown.optionOrder["f-missing"] = ["a", "b", "c", "d"];
  assert.throws(() => validateProgressForQuestions(unknown, questions), /unknown question/i);

  const invalidOrder = createProgress("ccar-f", ["f-1.1"]);
  invalidOrder.optionOrder["f-1.1"] = ["a", "a", "c", "d"];
  assert.throws(() => validateProgressForQuestions(invalidOrder, questions), /option order/i);
});
