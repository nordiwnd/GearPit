---
trigger: always_on
---

# 02-backend.md: Rust Backend Guidelines

## 1. Domain Modeling
* **Type Safety:** Use **NewTypes** for units (e.g., `struct Grams(i32)`, `struct Milliliters(i32)`) to prevent unit confusion.
* **Enums for Variants:** Use Rust Enums to model different gear types (e.g., `enum GearProps { Hiking(HikingProps), PC(PCProps) }`).
* **Rich Domain:** Logic should reside in the Domain layer, not in the HTTP Handlers.

## 2. Database (SQLx)
* **Schema First:** Always define the schema in `migrations/` (.sql files) first.
* **Compile-Time Checks:** Use `sqlx::query_as!` macros to ensure SQL queries match the DB schema at compile time.
* **JSONB Handling:** Map PostgreSQL `JSONB` columns to Rust structs deriving `serde::Serialize` and `serde::Deserialize`.

## 3. Project Structure (Clean/Hexagonal)
* `src/domain`: Pure Rust logic, structs, and traits. No external dependencies (except serde/thiserror).
* `src/infrastructure`: Database implementations (SQLx), external APIs.
* `src/api`: Axum handlers, DTOs, routing logic.
* `src/main.rs`: Application wiring and dependency injection.

## 4. Error Handling
* **Libraries:** Use `thiserror` for library/domain errors.
* **Applications:** Use `anyhow` or a custom `AppError` enum that implements `IntoResponse` for Axum handlers.
* **Panic:** NEVER panic in production code (`unwrap()` is forbidden outside of tests). Use `expect("msg")` only at startup.