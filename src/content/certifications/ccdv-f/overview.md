---
track: ccdv-f
kind: overview
title: Developer Foundations study guide
description: Production-focused preparation for Claude APIs, agents, tools, security, evaluation, and operations.
order: 1
---

## Study at the developer level

Developer Foundations asks whether you can ship ordinary, well-engineered software that happens to include a probabilistic model. Applications and Integration is one third of the blueprint, so API mechanics and software boundaries deserve more study time than the number of domain headings suggests.

## Recurring decisions

- Use a deterministic workflow when the path is known; use an agent only when Claude must choose steps dynamically.
- Make the Messages API loop, tool results, stop reasons, retries, and error categories explicit.
- Pin model, prompt, tool, and configuration versions and promote changes through regression evaluation.
- Separate trusted instructions from untrusted content and enforce authorization outside the model.
- Manage context, tokens, caching, and model routing against measured service targets.
- Implement tools, Skills, hooks, and MCP servers according to the capability boundary, not their novelty.

## Readiness standard

Build the capstone until you can trace a request from validated input through model and tool calls to checked output, evaluation evidence, cost data, and an operable failure path.
