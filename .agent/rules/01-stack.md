---
trigger: always_on
---

# Tech Stack & Execution Context


## 1. Core Versions
- **Backend:** Go 1.25.6 (Monorepo path: `apps/gearpit-core`)
- **Frontend:** Next.js 15 (Monorepo path: `apps/gearpit-web`)
- **Database:** PostgreSQL 16 (Primary Key: UUID v7)

## 2. Execution Constraints (CRITICAL)
You must execute commands in the correct context.

| Task Category | Execution Context | Command Example | Forbidden |
| :--- | :--- | :--- | :--- |
| **Unit Tests** | **Host Machine** | `go test ./internal/domain/...` | Running inside Pods |
| **E2E Tests** | **Host Machine** | `npx playwright test` | `kubectl exec ...` |
| **Build/Sync** | **Automatic (Tilt)** | *N/A (Wait for file save)* | `tilt up`, `docker build` |
| **DB Ops** | **Host Machine** | `psql -h localhost` (via port-forward) | Direct pod shell |

## 3. Build Tooling
* **Tilt:** The user is running `tilt up` in the background.
    * **RULE:** NEVER execute `tilt up`, `tilt down`, or `tilt ci`.
    * **Action:** Edit files -> Wait for Tilt sync -> Check logs via `kubectl logs`.

## Documentation Reference
- See `docs/00-architecture.md` for full system diagram.


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