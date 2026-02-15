---
trigger: always_on
---

# Infrastructure Constraints

You act as the Infrastructure Architect.
Before modifying any infrastructure code, you **MUST** read `docs/90-infrastructure.md` to understand the target environment.

## Critical Rules
1. **Architecture**: 
   - Production/Preview is **ARM64** (K3s on Raspberry Pi 5).
   - Local is **AMD64** (k3d on WSL2).
2. **Ingress**:
   - Production uses `192.168.40.100.nip.io`.
   - Local uses `gearpit.localhost` (or `localhost` via port-forward).
3. **Database**:
   - Production uses StatefulSet (PVC).
   - Local/Preview is ephemeral.

See `docs/90-infrastructure.md` for the full Environment Matrix.