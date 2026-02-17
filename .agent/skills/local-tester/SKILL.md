---
name: local-tester
description: "Standardized local testing procedures for Backend (Go) and Frontend (Next.js) to ensure safety and correctness without full CI/CD overhead."
version: 1.0.0
author: Antigravity
created: 2026-02-15
updated: 2026-02-15
platforms: [github-copilot-cli, claude-code]
category: testing
tags: [testing, backend, frontend, go, nextjs]
risk: safe
---

# local-tester

## Purpose

To standardize local testing procedures for both frontend and backend, ensuring the Agent can execute tests safely and correctly without triggering heavy CI/CD processes or Docker builds.

## When to Use This Skill

This skill should be used when:
- The user asks to "run tests", "test backend", "test frontend", or "verify changes locally".
- You have modified backend domain logic and need to verify correctness.
- You have modified frontend components and need to verify them.
- You need to ensure no regressions were introduced before committing.

## Core Capabilities

1.  **Backend Test (Go)**:
    -   Executes unit tests for domain logic (`internal/domain/...`).
    -   Runs on the Host machine (no Docker).
    -   Fast feedback loop.

2.  **Frontend Test (Next.js)**:
    -   Executes unit tests (`npm test`).
    -   Conditionally executes E2E tests (`playwright`) ONLY IF configuration exists.
    -   Skips E2E if not configured, preventing false positives/negatives.

## Usage

### Backend Testing

```bash
.agent/skills/local-tester/scripts/test_backend.sh
```

### Frontend Testing

```bash
.agent/skills/local-tester/scripts/test_frontend.sh
```

## Constraints & Rules

1.  **Enforce Context**: Always run these tests on the **Host Machine**. Do not attempt to run them inside `kubectl exec`.
2.  **No Tilt Up**: Never run `tilt up` as part of this skill. The user manages Tilt.
3.  **No Docker Builds**: Tests must run against the local source code, not built containers.
4.  **Fast Feedback**: Priority is speed. If tests are taking too long (>1min), warn the user.

## Detailed Instructions

### Backend (Go)

-   We prioritize testing `internal/domain` because it contains the core business logic and has no external dependencies (mocked).
-   If you need to test `internal/handler` or `internal/repository`, ensure you have a running database (port-forwarded) or mocked interfaces. The provided script focuses on **Domain Logic**.

### Frontend (Next.js)

-   `npm test` usually runs Jest or Vitest.
-   Playwright E2E tests are heavy. We only run them if `playwright.config.ts` exists.
-   If E2E tests are needed but missing, the script will exit with success (0) but print a message.

## Troubleshooting

-   **"command not found: go"**: Ensure you are in the correct environment (Host execution).
-   **"connection refused"**: If tests require DB, ensure `kubectl port-forward` is active or use mocks.
