# CCAR-F field guide

The Foundations exam is detailed, scenario-based, and Claude-specific. It draws 60 items from four of six published scenarios and weights the domains as follows:

| Domain | Weight | What good judgment looks like |
|---|---:|---|
| Agentic Architecture & Orchestration | 27% | Structured loop control, adaptive decomposition, explicit handoffs, coordinator visibility, deterministic gates |
| Claude Code Configuration & Workflows | 20% | Correct scope and mechanism: CLAUDE.md, rules, Skills, hooks, plan mode, and non-interactive CI |
| Prompt Engineering & Structured Output | 20% | Explicit criteria, targeted examples, schema-constrained output, validation feedback, appropriate batching and review passes |
| Tool Design & MCP Integration | 18% | Clear boundaries, structured errors, scoped tools, correct MCP scope, and appropriate built-in tools |
| Context Management & Reliability | 15% | Durable facts, explicit error/provenance flow, calibrated escalation, bounded exploration, and segmented evaluation |

## The six official scenarios

1. Customer Support Resolution Agent
2. Code Generation with Claude Code
3. Multi-Agent Research System
4. Developer Productivity with Claude
5. Claude Code for Continuous Integration
6. Structured Data Extraction

Study the objective, not a memorized scenario label. Community reports of extra scenarios are not part of the published July 2026 blueprint.

## Frequent distinctions

- `stop_reason` controls an agent loop; natural-language phrases do not.
- Coordinators decompose, delegate, route errors, and aggregate. Subagents receive explicit context and do not inherit the parent transcript automatically.
- Hooks and server-side checks enforce guarantees; prompts explain expectations.
- Tools expose actions; MCP resources expose discoverable read-oriented content and catalogs.
- Grep searches contents; Glob matches paths; Edit needs a unique anchor; Read plus Write is a fallback when a targeted edit cannot be made reliably.
- Project configuration is shared; user configuration is personal. Path-scoped rules load conditional conventions; Skills are reusable workflows; CLAUDE.md carries durable instructions.
- Tool schemas guarantee structure, not semantic truth. Validation still checks totals, relationships, and source support.
- Batch work is latency-tolerant. Blocking checks use synchronous calls.
- A separate review instance challenges generated work more effectively than the generation session reviewing itself.
