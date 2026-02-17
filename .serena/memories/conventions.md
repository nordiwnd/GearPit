# Coding Conventions & Rules

## General
1. **Monorepo Discipline**:
   - Application code in `apps/`.
   - Kubernetes manifests in `manifests/`.
   - GitOps config in `ops/`.
2. **ARM64 Native**: All code and Docker images MUST support `linux/arm64`.

## Backend (Go)
- **Clean Architecture**: Domain logic must NOT depend on infrastructure.
- **Structure**:
  - `cmd/`: Entrypoints.
  - `internal/handler/`: HTTP transport.
  - `internal/service/`: Business logic.
  - `internal/repository/`: Data access.
  - `internal/domain/`: Core models.

## Frontend (Next.js)
- **Consistency**: Use existing `shadcn/ui` components from `components/ui/`.
- **Styling**: Tailwind CSS.
