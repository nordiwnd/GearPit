# 90. Infrastructure & Environment Matrix

This document defines the immutable constraints for Physical, Local, and Preview environments.

## 1. Environment Matrix

| Context          | Local (Development)          | Preview (Pull Request)                   | Production (Main)                |
| :--------------- | :--------------------------- | :--------------------------------------- | :------------------------------- |
| **Cluster**      | k3d (Docker on WSL2)         | k3s (Raspberry Pi Cluster)               | k3s (Raspberry Pi Cluster)       |
| **Architecture** | `linux/amd64` (Native Speed) | **`linux/arm64` (Strict)**               | **`linux/arm64` (Strict)**       |
| **Namespace**    | `gearpit-dev` / default      | `pr{{number}}`                           | `gearpit`                        |
| **Ingress Host** | `http://localhost:9000/`     | `web-pr{{number}}.192.168.40.100.nip.io` | `gearpit.192.168.40.100.nip.io`  |
| **DB Storage**   | Ephemeral (Empty on restart) | Ephemeral (Seeded via init)              | **Persistent (StatefulSet PVC)** |
| **Deployment**   | `tilt` / `kubectl apply`     | ArgoCD (ApplicationSet)                  | ArgoCD (ApplicationSet)          |

## 2. Physical Cluster Constraints (Production/Preview)

- **Hardware:** Raspberry Pi 5 (Aarch64/ARM64)
- **Node IP Range:** `192.168.40.100`
- **LoadBalancer IP:** `192.168.40.100` (MetalLB / Klipper)
- **Ingress Controller:** Traefik (Bundled with K3s)
- **Constraint:** `amd64` images will cause `Exec format error` and CrashLoopBackOff.

## 3. Local Development Constraints (WSL2)

- **Runtime:** k3d on Docker Desktop / Rancher Desktop
- **Architecture:** Use `linux/amd64` images to avoid QEMU emulation slowness.
- **Ingress:**
  - Traefik is exposed on localhost ports (e.g., `8080:80`).
  - DNS resolution via `nip.io` may not work offline; prefer `localhost` routing for dev.
