---
track: ccdv-f
kind: practice
title: Developer Foundations production capstone
description: Build and operate a source-grounded document triage service using Python or TypeScript.
order: 99
---

Build one document-triage service in Python or TypeScript. It accepts a document, extracts a typed case record, classifies urgency, cites evidence, and may call one internal lookup tool. Use synthetic data and a development API key supplied through the environment.

## Stage 1. Application contract

- Define functional requirements, volume, latency, quality, privacy, cost, and failure behavior.
- Implement a version-pinned Messages API client with typed request and response boundaries.
- Support streaming for interactive work and a batch path for overnight processing.

## Stage 2. Agent and tools

- Implement a bounded tool-use loop using structured stop reasons and matching tool results.
- Give the lookup tool a narrow schema, structured errors, authorization checks, and idempotent behavior.
- Compare the direct tool with an MCP server boundary and record when reuse justifies MCP.

## Stage 3. Context, output, and cost

- Separate instructions from untrusted documents and prune bulky tool output.
- Validate JSON syntax and business invariants; retry only repairable failures.
- Measure tokens, cacheable prefixes, latency, and per-document cost across two model routes.

## Stage 4. Security, evaluation, and operation

- Add prompt-injection cases, secret handling, least privilege, and a hook or code gate for one prohibited action.
- Build a labeled normal, edge, and adversarial evaluation set plus a regression threshold.
- Emit correlated traces and write runbook steps for rate limits, invalid requests, timeouts, malformed output, and tool denial.

Completion evidence: another developer can clone the capstone, supply their own authorized key, run tests, reproduce the evaluation, and explain every security and cost boundary.
