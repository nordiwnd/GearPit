# 02. Next.js Frontend Guidelines (Node 20)

## 1. Core Stack

- **Framework**: Next.js 15 (App Router) running on Node.js 20-alpine
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **UI Components**: `shadcn/ui` (Radix UI primitives)
- **Icons**: `lucide-react`
- **Form & Validation**: `react-hook-form` + `zod`

## 2. Component Hierarchy & Constraints

Strictly maintain the following directory structure inside `apps/gearpit-web/components/`:

<component_structure>
<directory path="ui/">
<description>Generic shadcn/ui components (e.g., Button, Card, Input).</description>
<rule>DO NOT edit these directly unless you need to change the global base style. Reuse existing components to avoid reinventing the wheel.</rule>
</directory>
<directory path="layout/">
<description>SiteHeader, Footer, Navigation.</description>
</directory>
<directory path="inventory/, loadout/, etc.">
<description>Domain-specific components tailored for specific features.</description>
</directory>
</component_structure>

## 3. UI/UX & Design Principles for AI Agents

When generating frontend code, you **MUST** follow these principles:

### 1. **Mobile First Design**

- The app is intended for use in the field (ski resorts, mountains). Mobile usability is top priority.
- Base Tailwind classes MUST be for mobile. Use `md:` and `lg:` prefixes strictly for larger screens.

### 2. **App Router Best Practices**

- **Default to Server Components (RSC)**: Keep components server-side by default for better performance and SEO.
- **Use `"use client"` sparingly**: Only apply this directive at the top of the file when you need React hooks (`useState`, `useEffect`), Event Listeners (`onClick`), or browser APIs.

### 3. **Data Fetching & API Integration**

Due to Kubernetes network isolation (App Pod vs. Web Pod vs. Browser), API fetching URLs MUST be dynamic:

- **Server Components (SSR)**: MUST use Kubernetes Internal DNS (e.g., `http://gearpit-app-svc/api/v1`). Note: Use the Service port (usually `80`), not the container port (`8080`).
- **Client Components (Browser)**: MUST use relative paths (e.g., `/api/v1`) and rely on Next.js `rewrites` in `next.config.ts` to proxy requests to the backend.

## 4. Coding Patterns

### ✅ GOOD: Forms with Zod Validation

```tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  weightGram: z.coerce.number().min(0),
});

export function AddGearForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  // ... render form using shadcn/ui <Form> components
}
```

### ❌ BAD: Inline styles or custom CSS instead of Tailwind

```TypeScript
// DON'T do this. Always use Tailwind utility classes.
<div style={{ display: 'flex', marginTop: '10px' }}>...</div>
```

### ❌ BAD: Creating a new button component

```TypeScript
// DON'T create a new <MyButton>. Use the existing shadcn/ui Button.
import { Button } from "@/components/ui/button"
```

### 5. Deployment Constraints (ADDED)

- **Standalone Mode**: `next.config.ts` MUST include `output: "standalone"` to ensure successful multi-stage Docker builds.