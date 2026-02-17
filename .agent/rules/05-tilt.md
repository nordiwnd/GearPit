---
trigger: always_on
description: When running tests locally with tilt
---

# Kubernetes & Tilt Development Constraints (GearPit Project)

## Interaction Protocol
- **STRICTLY PROHIBITED:** Running `tilt up`. The user (Human) maintains this process as a persistent daemon. AI agents must never attempt to start a new Tilt session to avoid resource contention and timeouts.
- **MANDATORY ASSUMPTION:** Assume `tilt up` is already active and watching the filesystem. Any code changes suggested by the AI will be automatically detected and deployed by the user's Tilt process.
- **SECONDARY OPTION:** Use `tilt ci --hue=false` only for one-shot full cluster synchronization validation if requested.
- **PRIMARY FEEDBACK LOOP:** Prioritize local unit tests and linters (`go test`, `npm test`, `ruff`, etc.) to catch errors before they reach the container build stage.

## Environment
- **Platform:** k3d (Local Kubernetes)
- **Host OS:** WSL2 (Windows Subsystem for Linux)
- **Architecture:** **AMD64** (Native)
    - 🚫 **STOP:** Do NOT attempt to build `ARM64` images locally. QEMU emulation on WSL2 is too slow.
    - ✅ **USE:** `linux/amd64` for all local development artifacts.
- **Orchestration:** Tilt
- **Registry:** Local k3d-registry (via `localhost:5001` or `k3d-gearpit-registry:5000`)
- **Context:** `k3d-gearpit-dev`

## Debugging Strategy (AI Agent)
1. **Static Analysis First:** Identify syntax errors or logic flaws in Go/TypeScript/Tiltfile before any deployment occurs.
2. **Observational Debugging:** - Request the user to provide logs from the Tilt Web UI (Alerts tab).
    - Use `kubectl` commands to inspect the cluster state without triggering new builds:
        - `kubectl logs -l labels=backend --tail=100`
        - `kubectl describe pod -l labels=backend`
        - `kubectl get events --sort-by='.lastTimestamp'`
3. **Log-Driven Fixes:** Analyze `stdout/stderr` provided by the user to pinpoint failures in `live_update` or container entrypoints.
4. **Validation:** Only if local analysis is inconclusive, suggest running `tilt ci --hue=false` to verify the entire manifest integrity.