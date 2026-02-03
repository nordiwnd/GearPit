あ、なるほど！一つ前の出力では、私が「Zettelkasten」のREADMEだと勘違いして回答してしまいましたね。失礼いたしました。

改めまして、ご提示いただいた 「現在の GearPit の README」 をベースに、これまでに策定した最新のバージョン情報（Go 1.25.6 など）や作成した設計指示書（docs/00〜04）へのリンクを組み込んで、AIがより深く理解できる**「最強のインデックス（README）」**へと校正しました。

AI（LLM）が読みやすいようにXMLタグの構造を整理し、人間にとってもナビゲーションしやすい形に整えています。

README.md
Markdown

# GearPit 🏔️🏍️🖥️

![Project Status](https://img.shields.io/badge/status-active_development-success)
![Infrastructure](https://img.shields.io/badge/infra-k3s%20%2F%20Raspberry%20Pi%205-blue)
![Architecture](https://img.shields.io/badge/architecture-Clean%20Architecture-green)
![GitOps](https://img.shields.io/badge/GitOps-ArgoCD-orange)

**The unified maintenance log & configuration management platform for serious hobbies.**
_(Skiing, Mountaineering, Motorcycles, PC Building)_

---

## 🤖 AI Context & System Directives

> **Notice to AI Agents:** Read this section first. This defines the immutable laws of this repository. Always refer to the `docs/` directory for detailed architecture and coding standards.

<project_profile>
<name>GearPit</name>
<type>Cloud-Native Monorepo</type>
<deploy_target>Raspberry Pi 4/5 (ARM64) / k3s cluster</deploy_target>
<gitops_engine>ArgoCD (App of Apps Pattern & PR Previews)</gitops_engine>
</project_profile>

<tech_stack>
<backend>
<language>Go 1.25.6</language>
<framework>Standard net/http + slog</framework>
<db>PostgreSQL 16-alpine (StatefulSet)</db>
<architecture>Clean Architecture (Strict separation: domain -> handler -> infrastructure)</architecture>
</backend>
<frontend>
<framework>Next.js 15 (App Router)</framework>
<runtime>Node.js 20-alpine</runtime>
<ui_lib>shadcn/ui + Tailwind CSS + lucide-react</ui_lib>
<language>TypeScript</language>
</frontend>
<manifests>
<tool>Kustomize</tool>
<strategy>Base/Overlays (main/preview)</strategy>
</manifests>
</tech_stack>

<coding_rules>

1. **Clean Architecture:** Domain logic MUST NOT depend on infrastructure.
2. **Monorepo Discipline:** Infrastructure code (manifests) stays in `manifests/`, App code in `apps/`.
3. **ARM64 Native:** All Docker builds MUST support `linux/arm64`.
4. **Frontend Consistency:** Use existing `shadcn/ui` components. Do not reinvent the wheel.
   </coding_rules>

---

## 📂 Repository Structure (Monorepo)

This repository follows a strict Monorepo structure managed by `go.work` (for Go) and logical separation.

| Path                  | Purpose                                                    | Key Tech / Docs                                    |
| :-------------------- | :--------------------------------------------------------- | :------------------------------------------------- |
| **`apps/`**           | Application Source Code                                    |                                                    |
| ├── `gearpit-core`    | **Backend API**. Handles business logic, DB interactions.  | [Go 1.25.6, Postgres](./docs/01-go-backend.md)     |
| └── `gearpit-web`     | **Web Frontend**. User interface and dashboard.            | [Next.js, shadcn/ui](./docs/02-nextjs-frontend.md) |
| **`manifests/`**      | Kubernetes Manifests (Kustomize)                           | [GitOps Rules](./docs/03-gitops-k8s.md)            |
| ├── `apps/`           | Base & Overlay definitions per application.                | Kustomize                                          |
| **`ops/`**            | GitOps Configuration                                       |                                                    |
| ├── `applications/`   | ArgoCD Application definitions (incl. ApplicationSet).     | ArgoCD                                             |
| └── `github-token...` | SealedSecrets for GitHub integration.                      | SealedSecrets                                      |
| **`docs/`**           | **AI & Human Knowledge Base (Design Docs)**                | [Architecture](./docs/00-architecture.md)          |
| **`.github/`**        | CI/CD Pipelines (Multi-arch builds & GHCR)                 | GitHub Actions                                     |

## 📚 Knowledge Base (Docs)

For detailed implementation rules and architectural decisions, please read the dedicated Markdown files:

- **[00. Architecture & Philosophy](./docs/00-architecture.md)**
- **[01. Go Backend Guidelines](./docs/01-go-backend.md)**
- **[02. Next.js Frontend Guidelines](./docs/02-nextjs-frontend.md)**
- **[03. GitOps & Kubernetes Guidelines](./docs/03-gitops-k8s.md)**
- **[04. DB Schema & Migration Guidelines](./docs/04-db-schema.md)**

## 🚀 Getting Started

### Prerequisites

- **Go**: 1.25.6+
- **Node.js**: 20+
- **Docker**: With Buildx support (for ARM64 emulation if on x86)
- **Kubernetes Access**: `kubectl` configured for your cluster

### Local Development

#### 1. Backend (`gearpit-core`)

```bash
cd apps/gearpit-core
# Install dependencies
go mod download

# Run locally (Requires local PostgreSQL 16 on port 5432)
go run main.go
```

#### 2. Frontend (gearpit-web)

```
Bash
cd apps/gearpit-web
# Install dependencies
npm install

# Run development server
npm run dev # Accessible at http://localhost:3000
```

## 🛠 Deployment & Operations

This project uses GitOps via ArgoCD. Use the following workflow:

1. Code Changes: Commit changes to `apps/`. GitHub Actions builds multi-arch (`linux/arm64`, `linux/amd64`) images and pushes to GHCR.
2. Manifest Updates: CI automatically updates the image tag in `manifests/` and pushes the commit.
3. Sync: ArgoCD detects the change in `manifests/` and syncs the cluster.

### Preview Environments

Opening a Pull Request triggers the Preview Environment Operator. ArgoCD (`ApplicationSet`) automatically deploys an ephemeral environment (App + DB) in a dedicated namespace for isolated testing and review.

```

```
