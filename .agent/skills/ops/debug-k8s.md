---
name: debug_k8s_workload
description: Deep dives into a specific failing Pod or Deployment to identify application errors.
tags: [ops, k8s, debug, logs]
usage_patterns:
  - "Debug gearpit-core pod"
  - "Why is the app crashing?"
  - "Fetch logs for preview environment"
---

# Skill: Debug Kubernetes Workload

## Context
Use this when a deployment exists but is not running correctly (CrashLoopBackOff, Error, or 500 responses).

## Prerequisites
- Identify the target namespace (usually `gearpit` or derived from PR number).

## Commands

### 1. Identify the Failing Pod
Find the pod specifically related to the app in question.

```bash
# List pods with labels to find the right one
kubectl get pods -n gearpit --show-labels
```

### 2. Inspect Configuration & Events
Check why Kubernetes thinks the pod is failing (Liveness probe failed? OOMKilled?).

```Bash
# Replace [POD_NAME] with actual name
kubectl describe pod [POD_NAME] -n gearpit
```

### 3. Fetch Application Logs
Get logs from the container. If the pod restarted, use `--previous`.

```Bash
# Current logs
kubectl logs [POD_NAME] -n gearpit --all-containers=true --tail=100

# Previous logs (if crashed)
kubectl logs [POD_NAME] -n gearpit --previous --tail=100 || echo "No previous logs found"
```