---
name: run_e2e_scenarios
description: Executes End-to-End tests using Playwright to verify critical user flows.
tags: [e2e, playwright, testing]
---

# Skill: Run Local E2E / Integration Verification

## 1. Concept
In the new GearPit workflow, **Local E2E = Tilt Environment**.
We do not spin up a separate "test stack". We verify against the running development cluster (k3d).

## 2. Preparation
- **Command:** `tilt up` (Must be running in background)
- **Status Check:**
  - Open Tilt UI (default: `http://localhost:10350`).
  - Verify `gearpit-core`, `gearpit-web`, and `gearpit-db` are **Green (Active)**.

## 3. Execution Steps

### A. Manual Smoke Test (Browser)
1. Open **`http://localhost:3000`** (Next.js via Ingress/PortForward).
2. **Critical Path:**
   - Create a new Gear Item.
   - Verify it appears in the list.
   - (This confirms Frontend -> Backend -> DB write/read flow).

### B. API Verification (Curl)
1. Check Backend Health:
   - `curl http://localhost:8080/healthz` (or equivalent endpoint).
2. Check specific API (optional):
   - `curl http://localhost:8080/api/v1/gears`

## 4. Troubleshooting
- **If Frontend cannot connect to Backend:**
  - Check `gearpit-web` logs in Tilt.
  - Verify `NEXT_PUBLIC_API_URL` is correctly configured in the k8s manifest (likely pointing to `/api/v1` or full URL).