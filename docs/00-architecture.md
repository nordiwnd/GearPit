# GearPit Architecture

## Vision
A professional-grade "Gear Management Command Center" for serious hobbyists.
Focuses on **High Data Density**, **Type Safety**, and **Calculation Integrity**.

## Tech Stack
* **Frontend:** Next.js 16, TypeScript, Tailwind, Nuqs, TanStack Query/Table.
* **Backend:** **Rust**, Axum, SQLx.
* **Protocol:** HTTP/JSON or Connect (gRPC-compatible).
* **Database:** PostgreSQL (JSONB Schema).
* **Infra:** Kubernetes, ArgoCD.

## Key Concepts
1.  **Universal Gear:** All items (Crampons, GPUs, Oil Filters) are stored in a single table with a polymorphic `properties` JSONB column.
2.  **Pure Logic:** Weight/Water/Calorie calculations are pure Rust functions, fully unit-tested.
3.  **URL State:** The URL is the single source of truth for the UI state.