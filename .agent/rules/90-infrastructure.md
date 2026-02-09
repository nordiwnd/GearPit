---
trigger: model_decision
---

# Infrastructure & Physical Environment (Knowledge Base)

This file defines the immutable constraints of the physical home-lab environment.

## Physical Cluster (K3s on Raspberry Pi 5)
- **Architecture:** `linux/arm64` (Aarch64). **CRITICAL:** x86_64 images will crash.
- **Node IP Range:** `192.168.40.x`
- **Ingress Controller:** Traefik (bundled with K3s).
- **Domain Pattern:** `*.192.168.40.100.nip.io` (Wildcard DNS).

## CI/CD Runner Context
- **Self-Hosted Runner:** Runs directly on the K3s cluster nodes.
- **Capabilities:** Has direct access to `kubectl` within the cluster network.
- **Limitations:**
  - Cold starts can be slow (SD Card I/O).
  - Network timeouts are common during heavy image pulls.

## Troubleshooting References
- **Pod Pending:** Usually implies insufficient RAM/CPU on the Pis.
- **ImagePullBackOff:** Check `ghcr.io` secrets or internet connectivity of the cluster.
- **Exec Format Error:** You built an amd64 image instead of arm64.