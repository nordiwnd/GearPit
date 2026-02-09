# Skill: Run E2E Tests
Description: Executes End-to-End tests using Playwright against the local environment.

## Usage context
- Use after backend and frontend are running (`docker-compose up` or local dev servers).
- Use to verify critical user flows before PR.

## Prerequisites
- **Environment:** Applications must be running and accessible at `http://localhost:3000` (Web) and `http://localhost:8080` (API).
- **Dependencies:** `npm install` inside `apps/e2e`.

## Commands (Local)
```bash
cd apps/e2e

# Install dependencies (if needed)
npm ci

# Run E2E Tests (Headless)
npx playwright test

# Run E2E Tests (UI Mode - for debugging)
npx playwright test --ui
```

## Verification Criteria
- **All specs must pass.**
- **Screenshots/Videos:** Check `apps/e2e/playwright-report/` if failures occur.
- **Clean Run:** No flaky tests allowed in final verification.
