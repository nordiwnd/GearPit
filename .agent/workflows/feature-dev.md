---
description: Autonomously implements and verifies features locally, ending with a git push.
---

---
name: feature_development_loop
description: Autonomously implements and verifies features locally, ending with a git push.
trigger: "User starts a new feature, requests code changes, or fixes."
---

# Workflow: Feature Development (Local Loop)

## 1. Branch Management
- [ ] **Check Branch:** Ensure strictly on a `feature/*` or `fix/*` branch.
- [ ] **Create Branch:** If on `main`, create and switch to a new branch derived from the task name.
  - `git checkout -b feature/[task-name]`

## 2. Implementation Loop
- [ ] **Analyze & Plan:** Read `.agent/rules/*.md` and codebase to determine necessary changes.
- [ ] **Code:** Apply changes to files.

## 3. Autonomous Verification
Run the appropriate skills to verify changes. **Fix any failures immediately.**

### Backend Modified (`apps/gearpit-core`)
- [ ] **Exec:** `test_backend_logic`
- [ ] **Action:** If fails, analyze error -> Fix code -> Re-run.

### Frontend Modified (`apps/gearpit-web`)
- [ ] **Exec:** `verify_frontend_quality`
- [ ] **Action:** If fails, fix lint/type errors -> Re-run.

### Critical Flows
- [ ] **Exec:** `run_e2e_scenarios` (Smoke test)

### Architecture Check
- [ ] **Exec:** `check_arm64_compat` (Must pass before commit)

## 4. Commit & Push
- [ ] **Stage:** `git add .`
- [ ] **Commit:** Generate a Conventional Commit message (English) and execute commit.
  - `git commit -m "feat: ..."`
- [ ] **Push:** Push the branch to origin.
  - `git push origin [branch-name]`

## 5. Transition
- [ ] **Next Step:** Immediately trigger the **`feature_preview_flow`** (feature-preview.md) to handle the PR and Deployment.