---
trigger: always_on
---


# 01-stack.md: Technology Stack & Standards

## 1. Frontend (The Cockpit)
* **Framework:** Next.js 16 (App Router)
* **Language:** TypeScript (Strict Mode)
* **Styling:** Tailwind CSS + Radix UI (shadcn/ui)
* **State Management:**
    * **URL State (Truth):** `nuqs` (URL params as the single source of truth).
    * **Server State:** `TanStack Query` (via Connect-Web or REST).
    * **UI State:** `React.useState` (transient only).
* **Data Grid:** `TanStack Table` (Headless, high-performance).
* **Motion:** `Framer Motion` (Micro-interactions, counters).

## 2. Backend (The Engine)
* **Language:** **Rust** (2021 Edition or newer)
* **Framework:** **Axum** (Ergonomic, modular web framework)
* **Database Interface:** **SQLx** (Async, compile-time checked SQL queries). **No ORMs.**
* **API Protocol:** **Connect** (Buf) or REST with strictly typed JSON schemas.
    * *Preference:* Connect-Rust for type-safe interaction with the frontend.
* **Database:** PostgreSQL 18+ (Heavily using `JSONB`).
* **Runtime:** `Tokio`

## 3. Testing (The Guardrails)
* **UI/Interaction:** Storybook (using `@storybook/test` and `play` functions). Serves as an isolated sandbox for testing UI components and as executable specifications.
* **Frontend Integration:** Vitest + Testing Library for data formatting, hooks, and complex logic verification.
* **Backend Unit:** Standard `cargo test`.
* **Backend Integration:** `sqlx::test` with test containers.

## 4. Infrastructure
* **Containerization:** Docker (Multi-stage builds using `cargo-chef` for caching).