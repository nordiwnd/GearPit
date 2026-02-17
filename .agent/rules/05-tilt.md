---
trigger: always_on
description: When running tests locally with tilt
---

# 05-tilt.md: Local Dev Experience

* **Tool:** Tilt
* **Resources:**
    * `gearpit-web`: Next.js (Hot Reload)
    * `gearpit-core`: **Rust** (managed via `cargo-watch` inside the container or locally).
    * `postgres`: Dev database.
* **Scripts:**
    * `scripts/seed-dev.sh`: Populates the DB with "Rich" dummy data (100+ items) for testing the high-density UI.