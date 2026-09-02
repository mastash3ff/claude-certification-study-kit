# Contributing

Corrections, clearer explanations, accessibility improvements, and original practice questions are welcome.

## Before opening a change

1. Create a focused branch.
2. Run `npm ci` and `npm run check`.
3. Run `npm run build` for route, content, or styling changes.
4. Describe the user-facing effect and the evidence behind content changes.

## Question contract

Every question must:

- be original and avoid recalled, copied, or reconstructed exam material;
- map to exactly one track, domain, and published objective;
- contain at least three distinct options and the declared number of correct answers;
- explain why every option fits or does not fit;
- cite at least one source registered in `src/data/tracks.json`;
- avoid claiming that a raw practice score predicts an official result.

Add sources by authority: official certification material is tier 1, product documentation is tier 2, and community calibration is tier 3. Technical claims should resolve to tier 1 or 2 material.

## Content style

Use direct prose and concrete scenarios. Explain the decision boundary, not just a definition. Spell out an abbreviation on first use. Keep certification scope separate from current product behavior when the two sources differ.

By contributing code, you agree to license it under MIT. By contributing original study prose or question data, you agree to license it under CC BY 4.0.
