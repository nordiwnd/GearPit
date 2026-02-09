---
name: verify_frontend_quality
description: Runs static analysis (lint), type checking, and build verification for the Next.js frontend.
tags: [frontend, nextjs, quality]
---

# Skill: Verify Frontend Quality

## Context
Mandatory check before committing changes to `apps/gearpit-web`.

## Commands
Run from the repository root:

```bash
cd apps/gearpit-web

# 1. Linting (Static Analysis)
npm run lint

# 2. Type Checking (TypeScript)
# Using tsc directly is faster than building for type checks
npx tsc --noEmit

# 3. Build Verification (Production Build)
# Ensures code can actually compile for production
npm run build
```