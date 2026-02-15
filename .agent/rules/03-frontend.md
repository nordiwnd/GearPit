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


## Development Workflow
* **Reflect Changes:** Rely on Tilt's live update. Do not manually restart development servers.
* **Logs:** Check `k3d` logs for build errors if changes don't appear.

## Architecture
* **Server Components (RSC):** Default choice.
* **Client Components:** Use `"use client"` ONLY for interactive elements (buttons, forms, hooks).
* **Data Fetching:** Fetch data in RSC, pass to Client Components as props.

## API Interaction
* **Base URL:** Ensure API calls work both SSR (internal k8s network) and CSR (ingress/localhost).
* *Note:* In Dev (Tilt), `gearpit-web` container talks to `gearpit-core` service directly.