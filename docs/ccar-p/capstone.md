# CCAR-P end-to-end capstone

Design one enterprise knowledge-and-action assistant for a regulated organization. It answers policy questions from a changing corpus, drafts case recommendations, and may call a small set of internal tools. High-impact actions require authorization and human approval.

Use one coherent solution so decisions interact as they do in production.

## Deliverables

1. **Discovery brief** — users, current workflow, baseline costs, risks, measurable outcomes, latency and quality targets, non-goals.
2. **Architecture** — input, screening, retrieval, model, orchestration, tools, output validation, approval, feedback, and monitoring boundaries.
3. **Decision records** — workflow vs agent, model routing, RAG chunking/retrieval, MCP vs direct API, and context reuse. Record benefits, concessions, residual risk, and reversal cost.
4. **RAG experiment** — structure-aware chunks, at least two retrieval strategies, a labeled evaluation set, and a documented failure injected through stale or mismatched indexing.
5. **Evaluation plan** — quality, safety, latency, cost, and user-outcome metrics; normal, edge, adversarial, and production-sampled data; an A/B change gate.
6. **Safety and compliance map** — data flows, threats, least-privilege tools, authorization, human-review points, applicable obligations, control owners, and evidence artifacts.
7. **Operations package** — correlated traces, alerts, runbook, feedback triage, incident owner, drift checks, change approval, and iteration cadence.
8. **Stakeholder briefings** — one-page versions for executives, engineering, security/legal, and operations using the same facts at the appropriate altitude.

## Failure drills

- Retrieval returns stale chunks after a corpus refresh.
- An end user attempts to invoke a tool outside their authorization.
- Tail latency misses the SLA while average latency remains healthy.
- A high-confidence output is wrong for a rare document type.
- The primary operator leaves and the handoff must work without them.

For each drill, identify the first evidence to inspect, the responsible component, the immediate containment, the durable correction, and the proof of recovery.

## Completion standard

The capstone is ready when another engineer can operate it from the package, a reviewer can trace every high-impact decision to evidence, and a stakeholder can explain what the solution will not do.
