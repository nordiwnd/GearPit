---
trigger: always_on
description: Implementation and testing using CICD pipeline
---

# 04-ops.md: Operations & Quality Assurance

## 1. AI-Driven Validation Pipeline
* **Philosophy:** Fast feedback loops are critical. Eliminate brittle E2E setups to maximize the AI agent's self-healing efficiency.
* **Mechanism:**
    * Create a unified validation script (e.g., `make validate` or `scripts/validate.sh`) that runs static analysis, TypeScript builds, and Storybook tests sequentially.
    * After completing a development phase, explicitly instruct the AI to execute this workflow and autonomously loop through fixes until all checks pass.

## 2. Component Testing Guidelines
* **Storybook Sandboxing:** Create isolated stories for all complex UI components (e.g., Main Grid, Trip Planner).
* **Interaction Tests:** Use the `play` function to simulate the "Golden Path" at the component level (e.g., rendering a row, inputting a new weight, asserting the expected UI state).
* **Actionable Logging:** Ensure assertions provide clear error messages so the AI agent can precisely pinpoint logic failures without noise from the broader environment.

## 3. Local Development (Tilt)
* **Cargo Watch:** Use `tilt` to run `cargo watch -x run` for hot reloading the Rust backend.