---
name: run_e2e_scenarios
description: Executes End-to-End tests using Playwright to verify critical user flows.
tags: [e2e, playwright, testing]
---

# Skill: Run E2E Smoke Tests (Playwright)

## 1. Concept
We use Playwright to run "Smoke Tests" against the **Local Tilt Environment**.
These tests verify that the Frontend, Backend, and Database are correctly wired together.

## 2. Prerequisites
- **Tilt:** Must be running (`tilt ci` or `tilt up`).
- **App Status:** `gearpit-web` must be accessible at `http://localhost:3000`.

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

## 5. Troubleshooting
- **Connection Refused:** Ensure Tilt is running and `gearpit-web` is green.
- **Timeouts:** K3d might be slow. Try increasing timeouts in `playwright.config.ts` or using `--debug` to step through.