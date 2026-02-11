---
name: verify_frontend_quality
description: Runs static analysis (lint), type checking, and build verification for the Next.js frontend.
tags: [frontend, nextjs, quality]
---

# Skill: Frontend Verification (Next.js)

## 1. Dev Server (Tilt)
- **Primary Method:** Always use **Tilt**.
- **Command:** `tilt ci` (Root directory)
- **Access:**
  - Web UI: `http://localhost:3000` (via k3d Ingress or Port Forward)
  - Tilt UI: `http://localhost:10350`
- **Note:** Do not run `npm run dev` manually unless you are debugging a specific UI component in isolation without backend dependency.

## 2. Lint & Type Check
- **Context:** `apps/gearpit-web`
- **Command:**
  - `npm run lint`
  - `tsc --noEmit`
- **Timing:** Must pass before every commit.

## 3. Build Verification (CRITICAL)
Next.js App Router relies heavily on static analysis. Code that passes `tsc` might still fail `next build` (e.g., specific edge runtime constraints or detailed type mismatches).

- **Command:** `npm run build`
- **Why:** Ensures the app can actually be deployed.
- **Timing:** Run before pushing any PR.

## 4. Full Verification Script

```bash
set -e
cd apps/gearpit-web

echo ">>> Running Type Check..."
tsc --noEmit

echo ">>> Running Linter..."
npm run lint

echo ">>> Verifying Build..."
npm run build

echo "✅ Frontend Verification Passed!"
```