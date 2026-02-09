---
name: diagnose_k3s_health
description: Inspects the health of the physical K3s nodes and cluster-wide events.
tags: [ops, k8s, nodes, infrastructure]
usage_patterns:
  - "Check cluster health"
  - "Why are pods pending?"
  - "Inspect Raspberry Pi nodes"
---

# Skill: Diagnose K3s Cluster Health

## Context
Use this skill when CI fails with timeouts or "Pending" pods, suggesting the physical infrastructure (Raspberry Pi cluster) is overloaded or unhealthy.

## Commands

### 1. Check Node Status
Verify all Pis are Ready and check version consistency.

```bash
kubectl get nodes -o wide
```

### 2. Check Resource Capacity
Check if nodes are out of CPU or RAM (common on Pi clusters).

```Bash
kubectl top nodes
```

### 3. Check Cluster Events (Warning/Errors)
Look for system-level issues like FailedScheduling, NodeNotReady, or ImagePullBackOff.

```Bash
kubectl get events -A --sort-by='.lastTimestamp' | tail -n 20
```

### 4. Check Critical System Pods
Ensure the ingress controller and DNS are healthy.

```Bash
kubectl get pods -n kube-system
```