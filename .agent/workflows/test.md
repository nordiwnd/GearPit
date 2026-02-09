---
description: Unified testing workflow for local development
---

# Unified Test Workflow

Run this workflow to verify your changes before committing.

## // turbo-all
The following steps can be auto-executed.

1. **Determine Scope & Test**
   - Check which directories have changes.
   - Run appropriate tests based on the scope.

### Backend Changes (`apps/gearpit-core`)
```bash
echo "Testing Backend..."
cd apps/gearpit-core
go test -race ./...
```

### Frontend Changes (`apps/gearpit-web`)
```bash
echo "Testing Frontend..."
cd apps/gearpit-web
# Type Check
npx tsc --noEmit
# Lint
npm run lint
# Build Verification
npm run build
```

### E2E Changes (`apps/e2e`)
```bash
echo "Running E2E..."
cd apps/e2e
npx playwright test
```
