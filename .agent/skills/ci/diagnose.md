---
name: diagnose_ci_failure
description: Deeply investigates CI failures by correlating GitHub Action logs with K8s Cluster state and Remote Connectivity.
tags: [ci, k8s, debugging, playwright, github-actions, debugging]
usage_patterns:
  - "Why did the preview build fail?"
  - "Diagnose e2e-preview failure"
---

# Skill: Diagnose CI Failure (Deep Dive)

## Context
When the `build-app.yaml` pipeline fails, standard logs are often insufficient.
Use this skill to determine if the failure is **Code-related** (Logic) or **Infrastructure-related** (Timeouts, OOM, Network).

## 1. Identify Failed Step
```bash
# Get the Run ID and find the failed job
RUN_ID=$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')
JOB_ID=$(gh run view $RUN_ID --json jobs --jq '.jobs[] | select(.conclusion=="failure") | .databaseId')
gh run view --job $JOB_ID --log
```

## 2. Infrastructure Health Check (CRITICAL)
If the failure happened in e2e-preview, DO NOT assume the code is broken. The Preview environment might be unstable. Execute these commands immediately to verify the cluster state:
```bash
# 0. Check existing preview namespaces
# The largest number is the most recent pr[number]
kubectl get ns | grep "pr"

# 1. Check if Pods are actually running (Look for CrashLoopBackOff or Pending)
# Replace [number] with the actual PR number if known, or check all namespaces
kubectl get pods -A | grep "pr[number]"

# 2. Check Backend Logs for 500 Errors or Panics
# (Assuming namespace is pr[number])
kubectl logs -l app=gearpit-app -n pr[number] --tail=50

# 3. Check Frontend Logs for Errors
# (Assuming namespace is pr[number])
kubectl logs -l app=gearpit-web -n pr[number] --tail=50
```
## 3. Remote Reproduction (The "Truth" Test)
Before fixing any code, try to reproduce the error from your local environment against the remote preview. This isolates whether the issue is the test code or the CI runner.

```bash
# 1. Construct Preview URL (e.g., https://web-pr[number].192.168.40.100.nip.io)
# 2. Run Playwright against the Remote URL
BASE_URL="https://web-pr[number].192.168.40.100.nip.io" npx playwright test
```
