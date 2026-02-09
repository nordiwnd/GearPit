---
name: check_arm64_compat
description: Verifies that Docker builds are compatible with ARM64 architecture (Raspberry Pi).
tags: [ops, docker, arm64]
---

# Skill: Verify ARM64 Compatibility

## Context
CRITICAL: All production code runs on Raspberry Pi 5 (ARM64).
Run this skill to ensure no x86_64 dependencies were accidentally introduced.

## Commands
Run from the repository root:

```bash
# Verify Backend Build
docker buildx build --platform linux/arm64 -t gearpit-core:dry-run ./apps/gearpit-core

# Verify Frontend Build
docker buildx build --platform linux/arm64 -t gearpit-web:dry-run ./apps/gearpit-web
```