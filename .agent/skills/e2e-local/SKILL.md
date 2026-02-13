---
name: run_e2e_scenarios_local
description: Executes End-to-End tests on Local environment using Playwright to verify critical user flows.
tags: [e2e, playwright, testing, local]
---

# Skill: Run E2E Smoke Tests (Playwright)

## 1. Concept
We use Playwright to run "Smoke Tests" against the **Local Tilt Environment**.
These tests verify that the Frontend, Backend, and Database are correctly wired together.

## 2. Prerequisites
- **Tilt:** Must be running (`tilt ci` or `tilt up`).
- **App Status:** `gearpit-web` must be accessible at `http://localhost:9000/dashboard`.

## 3. Execution

```bash
cd apps/e2e

# Install dependencies if needed (first run)
# npm ci && npx playwright install --with-deps chromium

# Run all tests (Headless)
npx playwright test

# Run specific test file
npx playwright test tests/smoke.spec.ts

# Debug mode (Opens browser inspector)
npx playwright test --debug
```

## 4. Test Scope
The E2E tests in `apps/e2e/tests/` cover:
- **Smoke:** Basic navigation and rendering.
- **Critical Flows:** Creating items, checking weight analytics.

## 5. Automated Troubleshooting (For AI Agent)
If `npx playwright test` fails, the agent **MUST** follow these steps before reporting:

1.  **Collect Diagnostics:** Run the debug script to gather the current cluster/app status.
    ```bash
    ./collect_debug_logs.sh
    ```
2.  **Analyze Context:** Read the generated single-file log to identify the root cause (e.g., CrashLoopBackOff, DB connection errors, or Build failures).
    - **Log Location:** `./.agent/skills/e2e-local/scripts/_ALL_DEBUG_CONTEXT.txt`
3.  **Cross-Reference:** Compare the timestamps in the log with the Playwright failure time to ensure the data is fresh[cite: 1].