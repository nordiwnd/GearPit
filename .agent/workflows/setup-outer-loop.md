---
description: Scaffold Outer Loop & CI/CD
---

**Trigger:** `/setup-outer-loop`

## Objective
Generate CI/CD pipeline, ARC configurations, and ArgoCD application manifests for consistent GitOps deployment.

## Execution Steps
1. **Pipeline Generation:** CREATE `.github/workflows/ci.yaml` targeting self-hosted ARC runners (`runs-on: self-hosted-k3s`). INCLUDE linting, testing, and container scanning jobs.
2. **ArgoCD Scaffolding:** CREATE ApplicationSet for Preview environments and Application manifest for Production.
3. **ARC Scaffolding:** GENERATE Helm/Kustomize files for deploying Actions Runner Controller to `k3s`.
4. **Validation:** OUTPUT instructions for bootstrapping ArgoCD and ARC onto a fresh k3s cluster.