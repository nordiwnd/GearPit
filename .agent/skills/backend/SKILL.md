---
name: verify_backend_quality
description: Runs comprehensive quality checks for the Go backend (Lint, Unit, Integration).
tags: [backend, go, testing, quality]
---

# Skill: Verify Backend Quality (Go)

## Context
Use this skill to verify the integrity of the Go backend service.
This should be run before pushing code or when debugging CI failures.

## Prerequisites
- **Tilt:** Must be running for Integration tests (`tilt up` in separate terminal).
- **Database:** Postgres must be accessible on `localhost:5432` (Port-forwarded by Tilt).

## Commands

### 1. Static Analysis (Lint)
Ensures code style and catches common errors.

```bash
# Run golangci-lint
cd apps/gearpit-core
golangci-lint run ./... --timeout 3m
```

### 2. Unit Tests (Fast)
Runs domain logic tests. Skips tests requiring a database.

```Bash
cd apps/gearpit-core
go test -v -race -short ./...
```

### 3. Integration Tests (Slow)
Runs tests that interact with the database.
**Requirement:** Verify k3d or docker-compose is active.

```Bash
# Set env vars to point to local Tilt environment
cd apps/gearpit-core
export DB_HOST=localhost
export DB_PORT=5432
# Ensure DB is ready before running
go test -v -race -run Integration ./...
```

### 4. Full Verification Script (Recommended)
Runs all checks in sequence. Stops on first failure.

```Bash
set -e
cd apps/gearpit-core

echo ">>> Running Linter..."
golangci-lint run ./...

echo ">>> Running Unit Tests..."
go test -v -race -short ./...

echo ">>> Running Integration Tests (Requires localhost:5432)..."
export DB_HOST=localhost
export DB_PORT=5432
go test -v -race -run Integration ./...

echo "✅ Backend Verification Passed!"
```