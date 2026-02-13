---
description: Manages the lifecycle of a Pull Request, from creation to CI checks and preview verification.
---

This workflow focuses on the "Outer Loop" — CI/CD, Pull Requests, and Preview Environments.

# 1. PR Creation
1. Ensure `feature-dev` workflow is complete and code is pushed.
2. Create Pull Request using GitHub CLI:
   - `gh pr create --title "feat: ..." --body "..."`
3. **Label**: Add relevant labels (e.g., `enhancement`, `frontend`, `backend`).

# 2. CI/CD Monitoring
please following skill @run_preview_diagnostics

# 3. Preview Environment Verification
Once CI passes, ArgoCD will provision a preview environment.
1. **Wait for Deployment**: The PR comment will eventually contain the dynamic URL (e.g., `https://gearpit-pr123.nip.io`).
2. **Health Check**:
   - Check if the preview pods are healthy (if you have access to the cluster, otherwise rely on ArgoCD status).
   - **Log Check**: Check logs for startup errors, specifically looking for `exec format error` which indicates an Architecture Mismatch (running amd64 binary on arm64).
3. If it fails, please analyze the log according to the @run_preview_diagnostics in skill.

# 4. Data Seeding & Handover
1. **Seed Test Data**:
   - Run the preview seeder script: `./scripts/seed-preview.sh <PR_NUMBER>`
   - Verify that the seeding script completes successfully.
2. **Handover**:
   - Notify the user that the preview environment is ready and seeded.
   - The user will perform manual verification and handle the merge.