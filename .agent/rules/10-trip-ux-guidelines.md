---
trigger: manual
---

# 10. Trip UX & UI Guidelines

## 1. Design Philosophy (Mobile First Context)
- **Environment:** Users use this app outdoors (ski resorts, campsites). High contrast and large touch targets are mandatory.
- **Information Hierarchy:**
  1. **KPIs:** Total Weight & "Consumable vs Base" breakdown (Must be visible without scrolling).
  2. **Logistics:** Date, Weather, Location.
  3. **Gear List:** The itemized list comes last.

## 2. Component Usage Rules
- **Strictly adhere to shadcn/ui:** Do not create custom CSS classes unless absolutely necessary. Use `apps/gearpit-web/components/ui/` components.
- **Colors:** MUST use semantic colors defined in `globals.css` (e.g., `bg-muted`, `text-primary`, `border-border`) instead of arbitrary hex codes or standard Tailwind colors (e.g., `bg-gray-100`).

## 3. Interaction
- **Lists:** Gear items within a trip are frequently edited. Provide clear "Remove" or "Edit" actions visible on mobile (e.g., large icon buttons).