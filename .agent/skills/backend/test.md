---
name: test_backend_logic
description: Executes Go unit tests with race detection for the backend service.
tags: [backend, go, testing]
---

# Skill: Run Backend Tests

## Context
Use this skill when verifying logic changes in `apps/gearpit-core`.

## Commands
Run from the repository root:

```bash
# Ensure dependencies are tidy
cd apps/gearpit-core && go mod tidy

# Run tests with Race Detector (Critical for concurrent Go code)
go test -race ./...
```
