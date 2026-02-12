---
description: Feature Delivery Orchestration (Simplified)
---

## 1. Executive Summary
This workflow integrates the local and remote delivery phases by sequencing existing sub-workflows. It acts as a single point of entry for feature delivery.

## 2. Sequential Pipeline

### [Phase 1] Local Verification
**Action**: Execute all steps defined in [feature-dev.md](./feature-dev.md).
- **Target**: Local k3d cluster + Tilt environment.
- **Constraint**: This phase MUST be completed with all tests passing before proceeding.

### [Phase 2] Remote Preview
**Action**: Execute all steps defined in [feature-preview.md](./feature-preview.md).
- **Target**: Remote k3s cluster (Raspberry Pi) via GitHub PR & ArgoCD.
- **Trigger**: Successful completion of Phase 1 and pushing code to the feature branch.

## 3. Error Handling
- **Phase 1 Fail**: The developer must fix the code/environment locally. No remote PR should be updated or created.
- **Phase 2 Fail**: Check CI/CD logs. Re-run Phase 1 for any required fixes, then push to trigger the sync again.