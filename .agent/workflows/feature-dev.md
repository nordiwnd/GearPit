---
description: Autonomously implements and verifies features locally using Tilt & k3d
---

This workflow guides the agent through the full feature development lifecycle using the local Kubernetes environment.

# 0. Create Branch
Create an appropriately named branch.
(eg. feat/feat-name-branch, fix/fix-name-branch)

# 1. Environment Check
Check if the local development environment is ready.
// turbo
1. Check if `k3d` cluster is running: `k3d cluster list`
2. If not, run setup script: `./scripts/setup-dev.sh`
3. Start Tilt in the background (or ensure it's running): `tilt ci --stream` (Use a separate terminal or background process if possible, otherwise rely on `kubectl` for status checks).

# 2. Implementation Loop (TDD/Inner Loop)
Iterate on code changes.
1. **Plan**: Analyze requirements and create an implementation plan.
2. **Code**: Implement changes in `apps/gearpit-core` (Go) or `apps/gearpit-web` (Next.js).
3. **Verify (Fast)**:
   - Go: `go test ./internal/...`
   - Next.js: `npm run lint`
4. **Verify (Integration)**:
   - Check Tilt status (via `kubectl get pods` or Tilt UI if accessible).
   - Ensure Pods restart and become `Running`.
   - Check logs for errors: `kubectl logs -l app=gearpit-app` or `kubectl logs -l app=gearpit-web`.
5. **Data Seeding**:
   - If the feature changes the data model, you **MUST** update `apps/gearpit-core/cmd/seeder/main.go` to reflect these changes.
   - Run the seeder locally to verify: `go run apps/gearpit-core/cmd/seeder/main.go`

# 3. Security & Quality Check
Run static analysis before committing.
// turbo
1. **Security Scan**: Run Trivy on the filesystem.
   - `trivy fs --scanners vuln,secret,config .`
   - **CRITICAL**: Fix any `HIGH` or `CRITICAL` vulnerabilities immediately.
2. **Linting**:
   - Backend: `golangci-lint run ./...` (if available) or `go vet ./...`
   - Frontend: `npm run lint` (in `apps/gearpit-web`)

# 4. Final verification
Ensure the feature works end-to-end in the local k3d cluster.

1. **Automated E2E (Critical)**: Run the full E2E suite to ensure no regressions.
   - **Command**: `tilt ci`
   - *Note*: This runs the `e2e` resource defined in Tiltfile and exits automatically upon success/failure.
   - *Skill Ref*: See `@run_e2e_scenarios` for debugging failures.

2. **Manual Verification**: Perform ad-hoc testing against the local ingress.
   - Core: `curl http://localhost:8080/api/v1/...`
   - Web: Open browser (if applicable) or `curl http://localhost:3000`.

# 5. Commit & Push
1. Create a conventional commit message (e.g., `feat: add new gear type`).
2. Push to the feature/fix branch.

# 6. Launch Preview workflow
Run the preview environment workflow according to `.agent/workflows/feature-preview.md`.