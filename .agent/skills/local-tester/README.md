# Local Tester Skill

Standardized local testing procedures for GearPit.

## Overview

This skill provides a safe and standardized way to run tests locally for both the backend (Go) and frontend (Next.js). It adheres to the project's strict separation of concerns and execution context rules.

## Usage

### Run Backend Tests

Executes Go unit tests, focusing on `internal/domain`.

```bash
.agent/skills/local-tester/scripts/test_backend.sh
```

### Run Frontend Tests

Executes `npm test` and properly handles conditional E2E testing (Playwright).

```bash
.agent/skills/local-tester/scripts/test_frontend.sh
```

## Why use this?

-   **Safety**: Guarantees no accidental `tilt up` or unwanted Docker builds.
-   **Correctness**: Ensures tests run in the correct context (Host vs Container).
-   **Standardization**: Both humans and agents use the same scripts.
