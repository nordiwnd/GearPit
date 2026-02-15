---
trigger: always_on
description: Implementation and testing using CICD pipeline
---

# Operations & GitOps Guidelines

## CI/CD Pipeline
1. **Build:** GitHub Actions builds Production images (Target: `linux/arm64`).
   - *Note:* Local builds (Tilt/WSL2) MUST use Native Architecture (**AMD64**) for performance.
2. **Push:** Push to Container Registry (ghcr.io).
3. **Deploy:** ArgoCD syncs manifests from `manifests/` directory.

## Manifest Management (Kustomize)
- **Base:** `manifests/apps/[app]/base` (Common resources).
- **Overlays:**
  - `overlays/preview`: For PR previews (Ephemeral, patched for AMD64/ARM64).
  - `overlays/main`: Production (RasPi Cluster, strictly **ARM64**).

## Constraints
- **Architecture Agnostic:**
  - Dockerfiles MUST use `$BUILDPLATFORM` / `$TARGETARCH` pattern.
  - DO NOT hardcode `FROM --platform=...` unless absolutely necessary.
- **SealedSecrets:** NEVER commit raw secrets. Use `kubeseal`.
- **Reference:** See `docs/90-infrastructure.md` for the full Environment Matrix.
- **Reference:** See `docs/03-gitops-k8s.md` for the full GitOps Guidelines.

## Network Topology (Source of Truth)

| Service | Access from Host (Browser/Tests) | Access from Pods (Internal) |
| :--- | :--- | :--- |
| **Web App** | `http://gearpit.localhost` | `http://gearpit-web:9000` |
| **API** | `http://gearpit.localhost/api` | `http://gearpit-core:8080` |
| **DB** | `localhost:5432` (Requires Port Forward) | `postgres:5432` |
| **Registry**| `k3d-registry.localhost:5001` | `k3d-gearpit-registry:5000` |

## Kubernetes Access
* **Context:** Assume the current kubecontext is already set to the local k3d cluster (`k3d-gearpit`).
* **Port Forwarding:** Use `kubectl port-forward` only when absolutely necessary for debugging DB or internal metrics. Use Ingress (`gearpit.localhost`) for standard access.