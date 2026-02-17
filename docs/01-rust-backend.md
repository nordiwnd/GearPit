# Rust Backend Architecture

## Directory Structure
```plaintext
apps/gearpit-core/
├── Cargo.toml
├── migrations/          # SQL migrations
└── src/
├── main.rs          # Entry point
├── api/             # Axum handlers & routes
├── domain/          # Pure logic (Structs, Enums, Traits)
└── infrastructure/  # SQLx repositories, external APIs
```

## Domain Modeling
* **Gear:** Represented by a struct with a `details: GearDetails` enum.
    ```rust
    pub struct Gear {
        pub id: Uuid,
        pub name: String,
        pub weight: Grams, // NewType
        pub details: GearDetails, // Enum (Hiking, PC, Moto, etc.)
    }
    ```

## Database Access
* Use **SQLx** for type-checked queries.
* Avoid ORMs. Write explicit SQL to utilize PostgreSQL features like `jsonb_path_query`.

## Testing
* **Unit:** Test logic in `domain/` (e.g., `calc_total_weight`).
* **Integration:** Test repositories using `sqlx::test` with a real DB.