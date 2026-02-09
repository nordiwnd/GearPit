# Skill: Run Frontend Verification
Description: Verifies frontend code quality via Linting, Type Checking, and Build.

## Usage context
- Use when modifying `apps/gearpit-web`.
- Use before committing frontend code.

## Commands (Local)
```bash
cd apps/gearpit-web

# 1. Type Check (Strict)
npx tsc --noEmit

# 2. Linting (ESLint)
npm run lint

# 3. Production Build
npm run build
```

## Verification Criteria
- **No TypeScript errors:** `npx tsc` must complete with no output.
- **No ESLint warnings/errors:** `npm run lint` must pass.
- **Build Success:** `npm run build` must complete successfully.
- **ARM64 Compatibility:** Ensure no architecture-specific failures during build.
