---
name: diagnose_ci_failure
description: Monitors GitHub Actions, identifies specific failure jobs (like e2e-preview), and extracts relevant logs.
tags: [ci, github-actions, debugging]
usage_patterns:
  - "Check why the build failed"
  - "Get logs for e2e-preview"
  - "Monitor CI status"
---

# Skill: Diagnose CI Failure

## Context
Use this skill to autonomously monitor the `build-app.yaml` pipeline and extract logs if it fails.
This is critical for debugging the Self-Hosted ARM64 runner issues.

## 1. Monitor Pipeline
```bash
# Watch the latest run for the current branch
gh run watch
```

## 2. Identify & Fetch Failure Logs (If Failed)
If the pipeline fails, execute this sequence to pinpoint the error without drowning in logs.

```bash
# A. Get the Run ID of the latest run
RUN_ID=$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')

# B. Find the specific failed job (specifically looking for 'e2e-preview' or 'build-and-push')
# This extracts the Job ID of the failed step
JOB_ID=$(gh run view $RUN_ID --json jobs --jq '.jobs[] | select(.conclusion=="failure") | .databaseId')

# C. Fetch logs ONLY for that specific job
if [ -n "$JOB_ID" ]; then
  echo "Fetching logs for Job ID: $JOB_ID"
  gh run view --job $JOB_ID --log
else
  echo "Pipeline failed but could not identify specific job ID. Fetching run summary."
  gh run view $RUN_ID
fi
```

## 3. Analysis Strategy
- Infrastructure: Look for "Pod Pending", "Context Deadline Exceeded" (K3s/ARM64 issues).
- Application: Look for Playwright timeouts or assertion errors.