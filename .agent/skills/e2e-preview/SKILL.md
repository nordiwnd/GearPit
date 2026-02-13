---
name: run_preview_diagnostics
description: Monitors GitHub Actions builds and collects comprehensive Kubernetes diagnostics for PR Preview environments.
tags: [e2e, preview, troubleshooting, gha, k8s]
---

# Skill: Preview Environment Diagnostics & Troubleshooting

## 1. Concept
This skill allows the agent to wait for a CI build to complete and then collect deep diagnostic information from a specific PR namespace (`prxxx`) in the **default** Kubernetes context. This is essential for debugging failures in the Preview environment before running E2E tests.

## 2. Prerequisites
- **Context:** The agent MUST operate within the **`default`** context for Preview environments.
- **Authentication:** `gh` (GitHub CLI) must be authenticated with repository access.
- **Workflow:** Tilt or GitHub Actions must have triggered a build for the PR.

## 3. Execution

The agent should invoke the diagnostic script whenever a Preview environment deployment fails or E2E tests return a connection error.

```bash
# Execute from project root. Replace <PR_NUMBER> with the actual ID.
./collect_preview_logs.sh <PR_NUMBER> <BRANCH_NAME> 
```

### Automated Steps Performed:
1. GHA Watch: Uses gh run watch to wait for the CI pipeline without wasting tokens.
2. GHA Log Capture: If the build fails, it captures the raw Actions logs into the diagnostic file.
3. Sync & Restart: If the build succeeds, it performs a rollout restart to sync the cluster with the latest image.
4. Full Context Bundle: Merges K8s events, Pod describes, Current/Previous logs, and YAML manifests into a single file.

## 4. Troubleshooting Checklist (For AI Agent)
Analyze ./.agent/skills/e2e-preview/scripts/_PREVIEW_DEBUG_CONTEXT.txt using the following hierarchy:

1. Build Failures: Check the GHA BUILD FAILED section for compilation or Docker build errors.
2. Provisioning Failures: Check 00_NAMESPACE_EVENTS for FailedScheduling or ImagePullBackOff.
3. Runtime Crashes: If a Pod is not running, compare POD_LOG_CURRENT with POD_LOG_PREVIOUS to find the fatal error.
4. Network/Ingress Issues: Verify the 01_INGRESS section to ensure the hostnames match the expected PR URL.

## 5. File Location
Input for Agent: ./.agent/skills/e2e-preview/scripts/_PREVIEW_DEBUG_CONTEXT.txt