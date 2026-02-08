---
trigger: always_on
---

# Tech Stack & Infrastructure Constraints

## Infrastructure (Immutable Laws)
- **Target:** Raspberry Pi 5 Cluster (k3s).
- **Architecture:** `linux/arm64`. ALL Dockerfiles/Images MUST support ARM64.
- **Orchestration:** Kubernetes (K3s) managed via ArgoCD.
- **Secrets:** SealedSecrets (Bitnami).

## Core Stack
- **Backend:** Go 1.25.6 (Monorepo path: `apps/gearpit-core`)
- **Frontend:** Next.js 15 (Monorepo path: `apps/gearpit-web`)
- **Database:** PostgreSQL 16 (Primary Key: UUID v7)
- **CI/CD:** GitHub Actions -> ArgoCD

## Documentation Reference
- See `docs/00-architecture.md` for full system diagram.