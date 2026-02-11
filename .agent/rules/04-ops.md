---
trigger: model_decision
description: Implementation and testing using CICD pipeline
---

# Operations & GitOps Guidelines

## CI/CD Pipeline
1. **Build:** GitHub Actions builds Production images (Target: `linux/arm64`).
   - *Note:* Local builds should use Native Architecture (AMD64) for speed.
2. **Push:** Push to Container Registry (ghcr.io).
3. **Deploy:** ArgoCD syncs manifests from `manifests/` directory.

## Manifest Management (Kustomize)
- **Base:** `manifests/apps/[app]/base` (Common resources).
- **Overlays:**
  - `overlays/preview`: For PR previews (Ephemeral, patched for AMD64/ARM64).
  - `overlays/main`: Production (RasPi Cluster, strictly ARM64).

## Constraints
- **Architecture Agnostic:**
  - Dockerfiles MUST use `$BUILDPLATFORM` / `$TARGETARCH` pattern.
  - DO NOT hardcode `FROM --platform=...` unless absolutely necessary.
- **SealedSecrets:** NEVER commit raw secrets. Use `kubeseal`.
- **Reference:** See `docs/90-infrastructure.md` for the full Environment Matrix.
- **Reference:** See `docs/03-gitops-k8s.md` for the full GitOps Guidelines.