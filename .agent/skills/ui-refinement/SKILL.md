# UI Visual Refinement Skill

## Goal
Transform visual reference images into production-ready Next.js code using the existing component library.

## Workflow
1. **Component Decomposition:**
   - Analyze the image. Identify repeating patterns.
   - **Check Existing:** Search `apps/gearpit-web/components/` first.
     - Example: If the image shows a list of items, check `components/inventory/gear-list.tsx`.
     - Example: If the image shows a progress bar, check `components/ui/progress.tsx` or `components/loadout/weight-budget-bar.tsx`.
   
2. **Layout Implementation:**
   - Use `grid` or `flex` layouts compatible with mobile-first breakpoints (`md:`, `lg:`).
   - Use `gap-*` utilities for spacing consistency.

3. **Styling Adjustment:**
   - Apply the visual style from the image using **only** Tailwind utility classes.
   - Ensure Dark Mode compatibility by using `dark:` variants or CSS variables.