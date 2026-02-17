# Tech Stack

## Backend (`apps/gearpit-core`)
- **Language**: Go 1.25.6
- **Framework**: Standard `net/http` + `chi` router + `slog` for logging.
- **Database**: PostgreSQL 16-alpine (StatefulSet in Prod, Ephemeral in Local). Driver: `pgx/v5`.
- **Architecture**: Clean Architecture (Domain -> Handler -> Infrastructure).

## Frontend (`apps/gearpit-web`)
- **Framework**: Next.js 15 (App Router).
- **Language**: TypeScript.
- **Runtime**: Node.js 20-alpine (Dev: Node 22-alpine based on Tiltfile).
- **UI Library**: `shadcn/ui` + Tailwind CSS + `lucide-react`.

## Infrastructure
- **Orchestration**: Kubernetes (K3s on Pi 5, k3d for local).
- **GitOps**: ArgoCD.
- **Manifest Management**: Kustomize (Base/Overlays).
- **CI/CD**: GitHub Actions (Multi-arch builds).
