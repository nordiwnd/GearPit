# 05. Testing Strategy & verification

## 1. The Verification Pyramid

We adhere to a pragmatic testing pyramid optimized for our "Hybrid Infra" (Local AMD64 k3d / Prod ARM64 k3s):

| Tier | Scope | Location | Tooling | Frequency |
| :--- | :--- | :--- | :--- | :--- |
| **E2E (Smoke)** | Critical User Flows | `apps/gearpit-e2e` | Playwright | Pre-Push / On-Demand |
| **Integration** | Service ↔ DB | `apps/gearpit-core` | `go test -tags=integration` | CI / Pre-Commit |
| **Unit** | Business Logic | `apps/gearpit-core` | `go test -short` | Watch Mode (Dev) |
| **Static** | Linters / Types | All Apps | `golangci-lint`, `tsc` | Editor / Save |

## 2. Backend Verification (`gearpit-core`)

- **Unit Tests**:
  - Focus on **Domain Services** and **Business Logic**.
  - Mock Repositories using generated mocks (or simple structs).
  - **Command**: `go test -v -race -short ./...`

- **Integration Tests**:
  - Focus on **Repository Layer** (GORM/Postgres interaction).
  - **Strict Rule**: Tests must run against a **Real Postgres Instance**.
  - **Local Dev**: Use the Tilt-managed DB (`localhost:5432`).
  - **Command**: `go test -v -race -run Integration ./...` (Requires `DB_HOST=localhost`).

## 3. Frontend Verification (`gearpit-web`)

- **Strict Typing**: No `any`. Zod schemas for all forms/API responses.
- **Build Check**: Next.js App Router relies heavily on static generation. Always verify `npm run build` passes before pushing.
- **Linting**: `npm run lint` (ESLint).

## 4. End-to-End (E2E) Verification

- **Philosophy**: "Smoke Test" only. Verify the wiring, not every edge case.
- **Environment**: Tests run against the **Local Tilt Cluster** (`http://localhost:3000`).
- **Critical Flows to Cover**:
  1. Load Landing Page (Frontend works).
  2. Health Check API (Backend works).
  3. Create Item (Full Stack Write: Web -> API -> DB).
  4. View Item (Full Stack Read).

## 5. Agent Skills Reference

Agents MUST use the standard skills to verify their work:

- `verify_backend_quality`: Runs Go lint, unit, and integration tests.
- `verify_frontend_quality`: Runs TypeCheck, Lint, and Build verification.
- `run_e2e_scenarios`: Executes Playwright smoke tests against the running Tilt dev environment.
