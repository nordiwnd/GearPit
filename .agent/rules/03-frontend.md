---
trigger: always_on
---

# Frontend Guidelines (Next.js)

## Framework Standard
- **Core:** Next.js 15 (App Router).
- **Language:** TypeScript (Strict).
- **State:** React Server Components (RSC) by default. Use `"use client"` sparingly.

## UI Stack (MANDATORY)
- **Styling:** Tailwind CSS.
- **Components:** shadcn/ui (Radix UI based).
- **Icons:** Lucide React.
- **Forms:** React Hook Form + Zod.
- **Data Fetching:** TanStack Query (React Query) or Server Actions.

## Project Structure
- `app/`: Routes and Pages.
- `components/ui/`: Primitive components (shadcn).
- `components/[feature]/`: Feature-specific components.
- `lib/`: Utilities and API clients.

## Reference
- See `docs/02-nextjs-frontend.md` for component usage examples.