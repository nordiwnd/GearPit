# Skill: Verify ARM64 Build
Description: Simulates the CI environment locally to ensure Raspberry Pi compatibility.

## Usage context
- Run this BEFORE pushing to GitHub.
- Ensures `docker build` will pass on the CI runner.

## Commands
```bash
# Check if Dockerfile builds for arm64 platform
docker buildx build --platform linux/arm64 -t gearpit-core:dry-run ./apps/gearpit-core
```