---
name: debug_k8s_workload
description: Deep dives into a specific failing Pod or Deployment to identify application errors.
tags: [ops, k8s, debug, logs]
usage_patterns:
  - "Debug gearpit-core pod"
  - "Why is the app crashing?"
  - "Fetch logs for preview environment"
---

# Skill: Kubernetes Debugging (Local vs Remote)

## 1. Identify Context
Always check which cluster you are targeting before running commands.
- **Local (Dev):** `k3d-gearpit-dev` (Managed by Tilt)
- **Remote (Prod):** `default` (Raspberry Pi / k3s)

## 2. Pod Status
- **Command:** `kubectl get pods -A`
- **Common Issues:**
  - `ImagePullBackOff`: Check if the image exists in the local registry (k3d) or GHCR (Remote).
  - `CrashLoopBackOff`: Check logs (`kubectl logs [pod]`).
  - `Pending`:
    - **Local:** Docker Desktop resource limits (CPU/Memory).
    - **Remote:** Node capacity or Taints.

## 3. Logs
- **Tilt (Local):** Use the Tilt Web UI for aggregated, color-coded logs.
- **Kubectl (Raw):** `kubectl logs -f -l app=[app-name]`

## 4. Networking (Ingress)
- **Local:** `http://localhost:8080` (Backend), `http://localhost:3000` (Frontend).
- **Remote:** `https://api.gearpit.local`, `https://gearpit.local`.