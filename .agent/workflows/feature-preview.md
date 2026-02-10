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
Monitor the GitHub Actions pipeline.
// turbo
1. Watch the build status: `gh pr checks`
2. **Critical**: Monitor the **ARM64** build jobs (`build-push-image`).
   - If the build fails on ARM64, check for architecture-specific errors (e.g., missing libraries in Alpine, `amd64` binary usage).

# 3. Preview Environment Verification
Once CI passes, ArgoCD will provision a preview environment.
1. **Wait for Deployment**: The PR comment will eventually contain the dynamic URL (e.g., `https://gearpit-pr-123.nip.io`).
2. **Health Check**:
   - Check if the preview pods are healthy (if you have access to the cluster, otherwise rely on ArgoCD status).
   - **Log Check**: Check logs for startup errors, specifically looking for `exec format error` which indicates an Architecture Mismatch (running amd64 binary on arm64).

# 4. Merge
1. Once approved and verified, merge the PR.
   - `gh pr merge --squash --delete-branch`