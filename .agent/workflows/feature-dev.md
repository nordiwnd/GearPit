---
description: 
---

# Feature Development Workflow ("The Loop")

This workflow guides the development of a new feature from local coding to CI/CD verification.

## Trigger
- User request: "Start feature [FEATURE_NAME]" or "Implement [TASK]"

## Process

### Phase 1: Local Development (Loop 1)
1.  **Branching:**
    - Create/Switch to branch `feature/[FEATURE_NAME]` or `fix/[ISSUE]`.
    - *Constraint:* Never commit to `main`.

2.  **Implementation:**
    - Analyze `docs/` and relevant code.
    - Implement the feature following `.agent/rules/*.md`.
    - Ensure ARM64 compatibility for any new dependencies.

3.  **Local Verification:**
    - **Unit Tests:** Run `go test ./...` (Backend) or `npm run test` (Frontend).
    - **Docker Build:** Verify `docker build --platform linux/arm64 .` succeeds.
    - **Local Run:** Ensure `docker-compose up` works strictly.

4.  **Commit:**
    - If Verification passes, generate a Commit Message (English).
    - If fails, fix and repeat Phase 1.

### Phase 2: CI/CD Validation (Loop 2)
1.  **Push & PR:**
    - Push branch to origin.
    - Instruct user to create a Pull Request.

2.  **Pipeline Watch:**
    - Monitor GitHub Actions (`Build` -> `ArgoCD Deploy` -> `E2E Preview`).
    - **IF FAILURE:** Analyze logs (race conditions, ARM specifics). Return to Phase 1.
    - **IF SUCCESS:** Task is Done. Ready for Merge.