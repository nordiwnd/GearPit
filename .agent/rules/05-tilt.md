---
trigger: model_decision
description: When running tests locally with tilt
---

# Kubernetes & Tilt Development Constraints

## Interaction Protocol
- **PROHIBITED:** Do NOT run `tilt up`. This is a blocking daemon process that causes agent timeout.
- **ALLOWED:** Use `tilt ci` for validation if a full cluster sync check is required.
- **PREFERRED:** Run local unit tests or linters (`pytest`, `ruff`, etc.) for rapid feedback before triggering a Tilt build.

## Environment
- Local Kubernetes: k3d
- Orchestration: Tilt
- Artifacts: Images are built locally and injected into k3d registry.

## Debugging Strategy
1. Attempt to fix code based on static analysis first.
2. If deployment validation is needed, run `tilt ci --hue=false`.
3. Read stdout/stderr from `tilt ci` to identify build/deploy failures.