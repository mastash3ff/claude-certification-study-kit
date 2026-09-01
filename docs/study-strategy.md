# Diagnostic-first study strategy

This certification family rewards choosing the best architecture under stated constraints. Most distractors are workable ideas applied at the wrong layer, in the wrong order, or with unnecessary complexity.

## The study loop

1. **Take the local diagnostic cold.** Do not look up answers. Explain why each rejected option is worse.
2. **Rank gaps by official weight.** The app multiplies each domain's error rate by its published exam weight. This is a study-priority score, not an exam score.
3. **Repair concepts with primary sources.** Read the Exam Guide objective first, then the linked Claude, Claude Code, or MCP documentation.
4. **Build the behavior.** Complete the lab or capstone step that exercises the weak objective.
5. **Review missed questions.** Be able to name the distractor pattern: prompt instead of enforcement, wrong component, suppressed signal, unreliable proxy, or over-engineering.
6. **Calibrate on an unseen full mock.** Use a current community mock only after remediation. Check any disputed answer against official documentation.

Do not convert a raw practice percentage into Anthropic's 100–1,000 scaled score. The form conversion is not public. Readiness means you can defend the trade-off, not that you memorized a letter.

## Track order

Foundations is the natural first track because it tests Claude-specific mechanics in detail. Professional has no formal Foundations prerequisite, but it assumes broader ownership of an enterprise solution: discovery, architecture, RAG, evaluation, governance, stakeholder decisions, handoff, and operations.

## Decision rules that recur

- Fix the root cause at the layer where it occurs.
- Prefer deterministic enforcement for required guarantees; prompts guide probabilistic behavior.
- Give an agent the minimum capabilities required for its role.
- Preserve structured state, errors, and provenance across boundaries.
- Match workflows, agents, models, protocols, and review depth to the actual uncertainty and risk.
- Evaluate the complete system by segment, not only the model or an aggregate score.
- State benefits, concessions, residual risk, ownership, and reversal cost when presenting architecture.

## Exam practice

- Read the request and constraint before comparing options.
- For multiple-response items, test each option independently; do not assume options form pairs.
- Flag uncertain questions and return after completing the form.
- Treat a perfect score on an easy bank as evidence that the bank is too easy, not that preparation is complete.
