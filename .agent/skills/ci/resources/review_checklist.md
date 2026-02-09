# Mandatory Diagnosis Checklist

**Instruction:** You MUST complete this checklist based on the evidence gathered from `diagnose_ci_failure`.
**Rule:** Do NOT propose application code changes until you reach the "Real Bug" conclusion.

## 1. Failure Scope
- [ ] **Is it a Build/Compile Failure?** (e.g., Docker build, Go compile, ESLint)
  - **Yes:** -> Fix syntax/Dockerfile/Dependencies immediately. (Stop here)
  - **No:** -> It's a Runtime/E2E failure. Proceed to Step 2.

## 2. Infrastructure Health (Remote Cluster)
- [ ] **Pod Status:** Are all pods in `pr[number]` namespace showing `STATUS: Running`?
  - **No (`Pending`):** -> Cluster Resource / Node Issue. (Wait or Restart)
  - **No (`CrashLoopBackOff`):** -> Startup Panic. Check Logs.
  - **Yes:** -> Proceed.

- [ ] **Backend Logs (`gearpit-core`):** Are there `panic`, `fatal`, or `connection refused` errors?
  - **Yes:** -> Fix Backend EnvVars or DB Connectivity.

- [ ] **Frontend Logs (`gearpit-web`):** Are there Next.js startup errors?
  - **Yes:** -> Fix Frontend Config/Runtime.

- [ ] **Network Reachability:** Does `curl -I [PREVIEW_URL]` return HTTP 200 or 404 (Not 503/Timeout)?
  - **No:** -> Ingress/Traefik is not ready. (Wait or debug K8s Service)

## 3. The "Truth" Test (Local Reproduction)
*Action: Run `BASE_URL=... npx playwright test` locally against the remote preview.*

- [ ] **Did the test fail locally?**
  - **NO (Local Pass / CI Fail):** -> **CI FLAKE / TIMEOUT.**
    - *Action:* Do NOT change code. Retry CI or increase timeout configs.
  - **YES (Local Fail / CI Fail):** -> **REAL BUG.**
    - *Action:* You are authorized to modify `tests/` or application logic.