---
description: Manages the lifecycle of a Pull Request, from creation to CI checks and preview verification.
---

---
name: feature_preview_flow
description: Manages the feedback loop between Local Code and Remote Preview. Prioritizes infrastructure verification over blind code fixes.
trigger: "After pushing code in feature-dev workflow, or when CI reports failure."
---

# Workflow: Feature Preview & Remote Debugging

This workflow governs the "Loop 2" (Remote Validation).
**Prime Directive:** Never commit a "fix" for a Preview failure without first verifying the failure locally against the remote URL.

## 1. Pull Request & CI Monitoring
- [ ] **Ensure PR:** `gh pr list --head [branch]` -> `gh pr create` if missing.
- [ ] **Watch Pipeline:** Run `gh run watch`.

## 2. Analyze Outcome (The Fork in the Road)

### 🟢 CASE A: Pipeline PASS
- [ ] **Manual Check:** `curl -I [PREVIEW_URL]` to confirm availability.
- [ ] **Report:** "Preview is live and verified."

### 🔴 CASE B: Cloud Phase FAIL (Build/Push)
- **Scope:** Syntax errors, Dockerfile issues, Unit Tests.
- **Action:** Fix code immediately in `feature-dev`. This is a pure code issue.

### 🔴 CASE C: On-Prem Phase FAIL (E2E Preview)
**⚠️ STOP! DO NOT CHANGE CODE YET.**
Antigravity often misinterprets infrastructure timeouts as test failures.

- [ ] **Step 1: Diagnose Infra (Skill: `diagnose_ci_failure`)**
  - Check `kubectl get pods`: Is the app `Running`?
  - Check `kubectl logs`: Are there DB connection errors or Panics?
  - **Decision:**
    - If Pods are crashing -> Fix Infra/Env Vars (Not Test Code).
    - If Pods are pending -> Cluster Resource Issue (Wait or Restart).

- [ ] **Step 2: Reproduce Locally (Remote Debugging)**
  - Run the test from **Local** targeting **Remote**:
  - `BASE_URL=https://web-pr[NUM]... npx playwright test`
  - **Decision:**
    - If Local passes but CI fails -> **CI Runner Issue** (Add retries/timeout).
    - If Local fails -> **Real Bug** -> Now you can fix the code.

## 3. Resolution & Merge
- [ ] **Fix & Verify:** Apply fixes based on Step 2 evidence.
- [ ] **Merge:** `gh pr merge --auto --squash` once Green.