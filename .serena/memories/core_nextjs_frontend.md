# Next.js Frontend Architecture (The Cockpit)

## Core Philosophy: "The Command Center"
This application is NOT a typical mobile-friendly website. It is a **professional desktop console**.
* **Target Resolution:** 1920x1080 and above.
* **Interaction:** Keyboard-first (Cmd+K, Arrow keys). Minimal mouse travel.
* **Density:** High. Show 50+ rows of gear without scrolling. Use `text-sm` or `text-xs`.

## Tech Stack
* **Framework:** Next.js 15 (App Router)
* **Language:** TypeScript (Strict)
* **State Management:**
    * **URL State (Truth):** `nuqs`. All filter/sort/tab states must be reflected in the URL.
    * **Server State:** `TanStack Query` (React Query).
* **API Client:** **Connect-ES** (`@connectrpc/connect`).
    * Strictly typed against `.proto` definitions. No manual `fetch`.
* **Components:**
    * **Data Grid:** `TanStack Table` (Headless).
    * **UI Lib:** Radix UI + Tailwind CSS (shadcn/ui).
    * **Motion:** Framer Motion (for layout transitions).

## Implementation Rules

### 1. State as URL (`nuqs`)
Do not use `useState` for page-level state.
```tsx
// ❌ BAD
const [search, setSearch] = useState("");

// ✅ GOOD (The Command Center Way)
import { useQueryState } from 'nuqs'
const [search, setSearch] = useQueryState('q', { defaultValue: '' })
```

### 2. API Communication (Connect)
Use the generated Connect client hooks.
- Proto definition: api/proto/gearpit/v1/gear_service.proto
- Client usage:

```TypeScript
const { data } = useQuery({
  queryKey: ['gears'],
  queryFn: () => client.listGears({})
});
```

### 3. High-Density Layouts
- Layout: Always use a Split Pane or Sidebar layout.
- Modals: Avoid modals for simple edits. Use Inline Editing in tables.
- Theme: Dark mode by default (class="dark").