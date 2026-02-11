# 00. GearPit Architecture & Philosophy

## 1. Core Concept

A comprehensive maintenance log and configuration management system for hobbyist gear (Skiing, Mountaineering, Motorcycles, PC Building).
The core philosophy is **"Local First & Cloud Native"**—achieving a complete GitOps pipeline running entirely on a home-lab Raspberry Pi (ARM64) cluster.

## 2. System Architecture

<architecture_stack>
<infrastructure>
<hardware>Raspberry Pi 4/5 (ARM64 architecture strictly enforced)</hardware>
<orchestration>k3s (Lightweight Kubernetes)</orchestration>
<orchestration>k3s (Lightweight Kubernetes)</orchestration>
<local_dev>k3d (Local K3s) + Tilt (Live Update)</local_dev>
<gitops>ArgoCD (Push to GitHub -> Auto-sync by ArgoCD)</gitops>
</infrastructure>

  <cicd>
    <platform>GitHub Actions</platform>
    <strategy>Cross-compile to ARM64, build multi-arch Docker containers via Buildx.</strategy>
  </cicd>

<monorepo_structure>
<directory path="apps/gearpit-core">Go Backend (Go 1.25.6). Clean Architecture (domain/handler/infra).</directory>
<directory path="apps/gearpit-web">Next.js Frontend (Node 20-alpine). App Router, shadcn/ui, Tailwind CSS.</directory>
<directory path="manifests/">Kustomize bases and overlays (dev/preview/main). Strict separation from app code.</directory>
<directory path="ops/">ArgoCD Application definitions and cluster bootstrap manifests.</directory>
</monorepo_structure>
</architecture_stack>

## 3. Preview Environment Operator (Key Feature)

To facilitate seamless development and review, the system automatically provisions isolated environments for each Pull Request.

- **Trigger**: GitHub PR Creation/Update.
- **Action**: ArgoCD Image Updater & Kustomize dynamically create a dedicated Namespace.
- **Components**: Spins up an isolated `gearpit-core`, `gearpit-web`, and a dedicated PostgreSQL instance.
- **Teardown**: Automated cleanup upon PR merge/closure.

## 4. Key Constraints & Rules for AI Agents

When generating code or manifests for GearPit, you **MUST** adhere to the following constraints:

1. **Architecture-Agnostic Docker Builds**
   - **Constraint**: Dockerfiles MUST support both AMD64 and ARM64 without code changes.
   - **Implementation**:
     - Go: Use `FROM --platform=$BUILDPLATFORM` and `GOARCH=$TARGETARCH` for cross-compilation.
     - Node.js: Use multi-arch base images (e.g., `node:20-alpine`).
   - **Policy**:
     - **Local Dev**: Build native `amd64` for speed.
     - **CI/Prod**: Build `arm64` via Docker Buildx for Raspberry Pi compatibility.

2. **Stateless App / Stateful DB**
   - Application pods (`gearpit-core`, `gearpit-web`) MUST be completely stateless (`Deployment`).

3. **Stateless App / Stateful DB**
   - Application pods (`gearpit-core`, `gearpit-web`) MUST be completely stateless (`Deployment`).
   - PostgreSQL MUST be deployed as a `StatefulSet` with properly configured PersistentVolumeClaims (PVC).

4. **Strict Monorepo Separation (App vs Infra)**
   - Application code (`apps/`) MUST NOT contain any Kubernetes definitions.
   - All infrastructure definitions MUST reside in `manifests/` (for app deployment) or `ops/` (for ArgoCD config).

5. **Component Reusability**
   - Frontend: Strictly use existing `shadcn/ui` components (`apps/gearpit-web/components/ui`). Do not install new UI libraries unless strictly necessary.
   - Backend: Domain logic MUST NOT depend on Infrastructure or Handler layer packages.

## 5. Roadmap & Current Phase

- [x] **Phase 0-1**: Monorepo Setup & GitOps Operator Logic (ArgoCD + Preview Env).
- [ ] **Phase 2 (Current)**: Application Implementation (Core Domain Logic, UI Integration, DB Connectivity).
- [ ] **Phase 3**: Release & Hardening.
