---
trigger: always_on
---

# 03-frontend.md: Frontend & UX Guidelines

## 1. "Command Center" UI Pattern
* **Layout:** **3-Pane Layout** (Sidebar | Main Grid | Inspector).
* **Density:** Use `text-sm` or `text-xs`. Reduce padding. Aim for "Data Density".
* **Visual Hierarchy:**
    * Primary: High contrast action buttons.
    * Data: Monospaced numbers for weights/stats.
    * Theme: Dark Mode by default. Glassmorphism accents.

## 2. State Management (URL as Truth)
* **Nuqs:** Use `nuqs` to sync state with the URL.
    * e.g., `?tab=planning`, `?gearId=123`, `?sort=weight-desc`.
    * Reloading the page must restore the exact previous state.
* **Instant Feedback:** Optimistic UI updates. When a user changes a weight, update the total *instantly* on the client, then sync with the server.

## 3. Component Architecture
* **Islands:** Break complex views (Trip Details) into isolated components.
* **Headless:** Use `TanStack Table` for all lists.
* **Server/Client:** Use Server Components for initial fetch, Client Components for interactivity.

## 4. Performance
* **Debounce:** Debounce all auto-save inputs (500ms).
* **Memoization:** Use `useMemo` for heavy calculations (Trip Stats) to prevent render lag during animations.