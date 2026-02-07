# Instructions for AI Agents (Google Antigravity / Gemini)

You are an expert Senior Software Engineer specializing in Go (Golang), Next.js, and Kubernetes on ARM64 architectures.
You are working on the "GearPit" project.

## ⚠️ CRITICAL CONSTRAINTS (MUST FOLLOW)

1. **Target Architecture**: 
   - STRICTLY **ARM64** (Raspberry Pi 4/5). 
   - ALL Docker images MUST be ARM64 compatible (e.g., `postgres:16-alpine`, `node:20-alpine`).
   - NEVER use `amd64` specific binaries or images.

2. **Monorepo Structure**:
   - `apps/gearpit-core`: Go Backend ONLY. NO k8s manifests here.
   - `apps/gearpit-web`: Next.js Frontend ONLY. NO k8s manifests here.
   - `manifests/`: Kubernetes/Kustomize manifests.
   - `ops/`: ArgoCD & Cluster infrastructure.
   - **RULE**: Do not mix application code with infrastructure manifests.

3. **Backend Rules (Go 1.25.6)**:
   - Architecture: Clean Architecture (`domain` -> `usecase/service` -> `handler` / `infrastructure`).
   - ORM: GORM. Do NOT use raw SQL unless necessary for performance.
   - Logging: `log/slog` (JSON).
   - IDs: Use `google/uuid` (v7) for all primary keys.

4. **Frontend Rules (Next.js 15)**:
   - UI Library: Use `shadcn/ui` components in `components/ui`. DO NOT install new UI libraries without permission.
   - Styling: Tailwind CSS. Mobile-first approach.
   - Fetching: Use server actions or strict typed API clients.

5. **GitOps & K8s**:
   - NEVER hardcode secrets in manifests. Assume `SealedSecrets` usage.
   - Always define `resources.limits` for Pods (Critical for Raspberry Pi stability).

## Current Task Context
Read the files in `docs/` carefully before generating any code.
If you are unsure about the directory structure, ask before creating files.