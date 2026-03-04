---
trigger: always_on
description: Implementation and testing using CICD pipeline
---

# 04-ops.md: Operations & Quality Assurance

## 1. The "Ephemeral" Testing Strategy
* **Philosophy:** Tests run on a clean slate.
* **Mechanism:**
    * `scripts/test-e2e.sh`: Starts a fresh DB container, runs migrations, seeds minimal admin user.
    * Playwright tests execute against this fresh environment.
    * Container is torn down after tests.

## 2. E2E Guidelines (Playwright)
* **The "Golden Path":** Create `tests/golden-path.spec.ts`.
    1.  **Bulk Import:** Add 20 items via the Grid UI.
    2.  **Kit Creation:** Create a "Winter Kit".
    3.  **Trip Planning:** Create a Trip, assign the Kit.
    4.  **Verification:** Assert that `Total Weight` displayed matches the sum of individual items perfectly.
* **Resilience:** Use `await expect(...).toBeVisible()` to handle async UI updates.

## 3. Local Development (Tilt)
* **Cargo Watch:** Use `tilt` to run `cargo watch -x run` for hot reloading the Rust backend.