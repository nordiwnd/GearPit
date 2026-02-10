---
name: verify_frontend_quality
description: Runs static analysis (lint), type checking, and build verification for the Next.js frontend.
tags: [frontend, nextjs, quality]
---

# Skill: Frontend Verification (Next.js)

## 1. Dev Server (Tilt)
- **Primary Method:** Always use **Tilt**.
- **Command:** `tilt up` (Root directory)
- **Access:**
  - Web UI: `http://localhost:3000` (via k3d Ingress or Port Forward)
  - Tilt UI: `http://localhost:10350`
- **Note:** Do not run `npm run dev` manually unless you are debugging a specific UI component in isolation without backend dependency.

## 2. Lint & Type Check
- **Command:**
  - `npm run lint`
  - `tsc --noEmit`
- **Timing:** Must pass before every commit.