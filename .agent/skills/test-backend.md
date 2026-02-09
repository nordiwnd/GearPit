# Skill: Run Backend Tests
Description: Executes Go backend tests ensuring Clean Architecture compliance.

## Usage context
- Use when verifying backend logic locally.
- Use before committing Go code.

## Commands (Local)
```bash
# Navigate to core
cd apps/gearpit-core

# Run all unit tests with race detection (Crucial for Go)
go test -race ./...

# Run specific package test
go test -v ./internal/service/...
```

## Verification Criteria
- All tests must pass.
- No race conditions detected.