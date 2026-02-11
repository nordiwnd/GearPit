---
name: github-actions-monitoring
description: Essential commands for monitoring GitHub Actions workflows and Pull Requests using the GitHub CLI.
---

# GitHub Actions & PR Monitoring

This skill documents useful `gh` CLI commands for tracking the status of Pull Requests and CI/CD pipelines.

## Pull Requests

### List Open PRs
```bash
gh pr list --state open
```

### View Specific PR
```bash
gh pr view <PR_NUMBER>
```

## GitHub Actions Runs

### List Runs for a Branch
To see the status of workflows for a specific branch:
```bash
gh run list --branch <BRANCH_NAME>
```

### Watch a Run
To wait for a run to complete (updates in real-time):
```bash
gh run watch <RUN_ID>
```
*Note: If no run is in progress, this command will exit with an error.*

### View Run Logs
To view the logs of a specific run:
```bash
gh run view --log <RUN_ID>
```
*Note: Logs are only available after the run completes or for steps that have finished.*

### Get Latest Run Status
To quickly check the status of the most recent run:
```bash
gh run list --limit 1
```

## Common Issues

- **CLI Timeout**: `gh` commands might timeout or hang during network issues or high load on GitHub. In such cases, use `gh run list` to verify status asynchronously instead of waiting for `gh pr create` response.
- **"Found no in progress runs to watch"**: This means all recent runs have completed (success or failure). Check `gh run list` for the final status.
