# CCAR-F hands-on labs

These labs condense the four exercises in the official guide. Use a small reversible project; the goal is to observe architecture behavior, not build a polished product.

## 1. Multi-tool support agent

- Define three or four clearly bounded tools, including two that could be confused.
- Implement the loop using `stop_reason` and append each tool result to context.
- Return categorized, retry-aware tool errors and distinguish no-match from access failure.
- Enforce one high-impact prerequisite in code or a hook.
- Test a request containing two independent concerns and produce one structured handoff.

Evidence: a trace showing correct loop termination, one blocked policy violation, and different recovery for transient and non-retryable errors.

## 2. Team Claude Code configuration

- Add project instructions, a path-scoped rule, and one project Skill with constrained tools.
- Configure one project MCP server using environment expansion and one personal experimental server.
- compare a one-file fix under direct execution with a multi-file design under plan mode.
- Run a non-interactive structured review command suitable for CI.

Evidence: explain why each behavior belongs in CLAUDE.md, a rule, a Skill, a hook, or CI code.

## 3. Structured extraction pipeline

- Define nullable and extensible schema fields and force structured tool output.
- Validate one semantic relationship that JSON Schema alone cannot prove.
- Retry once with the exact validation error, and stop retrying when source information is absent.
- Design a batch submission with stable `custom_id` correlation and a human-review route.

Evidence: a missing field returns null, a repairable failure corrects, and an absent fact does not appear after retries.

## 4. Multi-agent research pipeline

- Use a coordinator and at least two scoped specialists.
- Launch independent work concurrently and pass structured claims, excerpts, source URLs, and dates.
- Simulate a partial timeout and preserve both partial evidence and the coverage gap.
- Synthesize two credible conflicting values without erasing the disagreement.

Evidence: the final report lets a reader trace every material claim and see what could not be established.
