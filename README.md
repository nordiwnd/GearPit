# GearPit

![Project Status](https://img.shields.io/badge/status-active-success)
![Infrastructure](https://img.shields.io/badge/infra-k3s%20%2F%20Raspberry%20Pi-blue)
![Architecture](https://img.shields.io/badge/architecture-Clean%20Architecture-green)

**The unified maintenance log & configuration management platform for serious hobbies.**
_(Skiing, Mountaineering, Motorcycles, PC Building)_

---

## 🤖 AI Context & Constraints

> **Notice to AI Agents:** Read this section first. This defines the immutable laws of this repository.

<project_profile>
<name>GearPit</name>
<type>Monorepo</type>
<deploy_target>Raspberry Pi 4 (ARM64) / k3s cluster</deploy_target>
<gitops_engine>ArgoCD (App of Apps Pattern)</gitops_engine>
</project_profile>

<tech_stack>
<backend>
<language>Go 1.22+</language>
<framework>Standard Lib + Chi (or similar)</framework>
<architecture>Clean Architecture (Strict separation: domain -> usecase -> interface -> infrastructure)</architecture>
<path>apps/gearpit-core</path>
</backend>
<frontend>
<framework>Next.js (App Router)</framework>
<ui_lib>shadcn/ui + Tailwind CSS</ui_lib>
<language>TypeScript</language>
<path>apps/gearpit-web</path>
</frontend>
<manifests>
<tool>Kustomize</tool>
<strategy>Base/Overlays (production/preview)</strategy>
<path>manifests/</path>
</manifests>
</tech_stack>

<coding_rules>

1. **Clean Architecture:** Domain logic MUST NOT depend on infrastructure.
2. **Monorepo Discipline:** Infrastructure code (manifests) stays in `manifests/`, App code in `apps/`.
3. **ARM64 Native:** All Docker builds must support `linux/arm64`.
4. **Frontend Consistency:** Use existing `shadcn/ui` components. Do not reinvent the wheel.
   </coding_rules>

---

## 📂 Repository Structure

This repository follows a strict Monorepo structure managed by `go.work` (for Go) and logical separation.

| Path                | Purpose                                                   | Key Tech           |
| :------------------ | :-------------------------------------------------------- | :----------------- |
| **`apps/`**         | Application Source Code                                   |                    |
| ├── `gearpit-core`  | **Backend API**. Handles business logic, DB interactions. | Go, PostgreSQL     |
| └── `gearpit-web`   | **Web Frontend**. User interface and dashboard.           | Next.js, shadcn/ui |
| **`manifests/`**    | Kubernetes Manifests (Kustomize)                          |                    |
| ├── `apps/`         | Base & Overlay definitions per application.               | Kustomize          |
| └── `infra/`        | Middleware & shared resources.                            |                    |
| **`ops/`**          | GitOps Configuration                                      |                    |
| ├── `applications/` | ArgoCD Application definitions.                           | ArgoCD             |
| └── `bootstrap/`    | Cluster bootstrapping configurations.                     |                    |
| **`.github/`**      | CI/CD Pipelines                                           | GitHub Actions     |

## 🚀 Getting Started

### Prerequisites

- **Go**: 1.22+
- **Node.js**: 20+
- **Docker**: With Buildx support (for ARM64 emulation if on x86)
- **Kubernetes Access**: `kubectl` configured for your cluster (or local dev)

### Local Development

#### 1. Backend (`gearpit-core`)

```bash
cd apps/gearpit-core
# Install dependencies
go mod download

# Run locally (requires local DB or connection string)
go run main.go
```

#### 2. Frontend (gearpit-web)

```Bash
cd apps/gearpit-web
# Install dependencies
npm install

# Run development server
npm run dev
```

## 🛠 Deployment & Operations

This project uses GitOps. Use the following workflow:

- Code Changes: Commit changes to apps/. CI builds the image and pushes to GHCR.
- Manifest Updates: Kustomize edits the image tag in manifests/.
- Sync: ArgoCD detects the change in ops/ (or manifests/) and syncs the cluster.

### Preview Environments

Opening a Pull Request triggers the Preview Environment Operator (planned), which deploys a temporary ephemeral environment for testing.
