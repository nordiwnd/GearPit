---
name: test_backend_logic
description: Executes Go unit tests with race detection for the backend service.
tags: [backend, go, testing]
---

# Skill: Backend Testing Strategy (Go)

## 1. Unit Tests (Pure Logic)
- **Scope:** Domain logic, utility functions, and handlers with mocked interfaces.
- **Command:** `go test ./internal/... -v`
- **Dependency:** None. Can be run instantly.

## 2. Integration Tests (DB Required)
- **Scope:** Repository layer, Database interactions.
- **Environment:**
  - **DO NOT** spin up a manual Postgres container.
  - **USE** the `k3d` environment managed by Tilt.
- **Action:**
  1. Ensure `tilt up` is running.
  2. Connect to the forwarded DB port (default: `5432` on localhost).
  3. Run tests with `DB_HOST=localhost` `DB_PORT=5432`.

## 3. Linting
- **Command:** `golangci-lint run ./...`
- **Rule:** Zero tolerance for lint errors before commit.