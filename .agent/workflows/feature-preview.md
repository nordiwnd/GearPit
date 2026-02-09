---
description: Manages the lifecycle of a Pull Request, from creation to CI checks and preview verification.
---

---
name: feature_preview_flow
description: Autonomously manages Pull Requests, monitors CI pipelines (including Self-Hosted E2E), and verifies deployments.
trigger: "After pushing code in feature-dev workflow, or user requests deployment status."
---

# Workflow: Feature Preview & CI Loop

This workflow manages the "Loop 2" (Remote Validation), bridging the gap between GitHub Actions cloud runners and the on-premise Raspberry Pi cluster.

## 1. Pull Request Management
- [ ] **Check Existing:** Check if a PR exists for the current branch.
  - `gh pr list --head [branch-name]`
- [ ] **Create PR:** If no PR exists, create one autonomously.
  - `gh pr create --title "feat: [description]" --body "Automated PR for feature verification."`

## 2. CI Pipeline Monitoring
The pipeline `build-app.yaml` consists of two phases:
1. **Cloud Phase:** Build & Push (Ubuntu).
2. **On-Prem Phase:** E2E Preview (Raspberry Pi/Self-Hosted).

- [ ] **Exec:** Run Skill `diagnose_ci_failure` (YAML: `skills/ci/diagnose.md`) to watch the build.
- [ ] **Analyze Outcome:**
  - **🟢 PASS:** Proceed to Step 3.
  - **🔴 FAIL (Cloud/Build):** Fix code syntax or Dockerfile in `feature-dev` workflow.
  - **🔴 FAIL (E2E/On-Prem):** The failure occurred on the physical cluster.
    - **Action:** IMMEDIATELY run Skill `debug_k8s_cluster` to check for Pod/Node issues (Pending, CrashLoop, OOM).

## 3. Post-Deployment Verification
*Trigger: Pipeline is GREEN.*

- [ ] **Locate URL:** Extract URL (Format: `http://web-pr[NUM].192.168.40.100.nip.io`).
- [ ] **Health Check:**
  - `curl -I [PREVIEW_URL]`
- [ ] **Manual Verification:** Instruct the user to open the link if visual confirmation is needed.

## 4. Final Status Report
- [ ] **Report:** "PR is green. E2E tests passed on ARM64 cluster. Preview is live."
- [ ] **Merge:** Wait for approval or merge command (`gh pr merge`).