---
description: Manages the lifecycle of a Pull Request, from creation to CI checks and preview verification.
---

---
name: feature_preview_flow
description: Autonomously manages Pull Requests and monitors CI/CD pipelines using specialized skills.
trigger: "After pushing code in feature-dev workflow."
---

# Workflow: Feature Preview & CI Loop

## 1. Pull Request
- [ ] **Create:** If not exists, create PR via `gh pr create`.

## 2. CI Monitoring & Diagnosis
- [ ] **Exec:** Run Skill `diagnose_ci_failure` (YAML: `skills/ci/diagnose.md`).
- [ ] **Action:**
    - **Wait:** The skill will watch the build.
    - **Green:** Proceed to Step 3.
    - **Red:** The skill will output specific logs. Analyze them.
        - *Infra Error:* Retry job (`gh run rerun ...`).
        - *Code Error:* Return to `feature-dev` workflow.

## 3. Post-Deployment Verification
*Trigger: Pipeline is GREEN.*

- [ ] **Locate URL:** `http://web-pr[NUMBER].192.168.40.100.nip.io`
- [ ] **Verify:**
  - `curl -I [URL]`
  - Report success to user.

## 4. Completion
- [ ] **Ready:** Mark task as ready for merge.