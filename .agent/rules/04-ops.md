---
trigger: always_on
---

# Operations & GitOps Guidelines

## CI/CD Pipeline
1. **Build:** GitHub Actions builds Docker images (linux/arm64).
2. **Push:** Push to Container Registry (ghcr.io).
3. **Deploy:** ArgoCD syncs manifests from `manifests/` directory.

## Manifest Management (Kustomize)
- **Base:** `manifests/apps/[app]/base` (Common resources).
- **Overlays:**
  - `overlays/preview`: For PR previews (Ephemeral).
  - `overlays/main`: Production (RasPi Cluster).

## Constraints
- **ARM64:** All container images must be built for `linux/arm64`.
- **SealedSecrets:** NEVER commit raw secrets. Use `kubeseal`.
- **Reference:** See `docs/03-gitops-k8s.md` for Kustomize patching rules.