---
trigger: always_on
---

# Backend Guidelines (Go)

## Architecture Standard
- **Pattern:** Clean Architecture (Strict Layering).
- **Layers:**
  1. `cmd/`: Entrypoints.
  2. `internal/handler/`: HTTP transport (Decode -> Service -> Encode).
  3. `internal/service/`: Business Logic.
  4. `internal/repository/`: Data Access (SQL).
  5. `internal/domain/`: Core Models & Interfaces.

## Domain Purity
* **Rule:** `internal/domain` MUST NOT depend on external infrastructure libraries.
    * 🚫 No `gorm`, `gin`, `sqlx`, `k8s.io` imports in domain entities.
    * ✅ Use standard library (`time`, `context`) only.
* **Goal:** Domain logic must be testable without Docker/K8s.

## Database & Schema
- **Primary Keys:** ALWAYS use UUID v7.
- **Reference:** Check `docs/04-db-schema.md` for current table definitions before modifying queries.

## Testing Strategy
* **Priority 1: Domain Unit Tests** (Fast, Host-based)
    * Focus on `_test.go` in `internal/domain`.
    * Use **Table-Driven Tests**.
    * Mock interfaces manually or with `gomock` if strictly necessary, but prefer pure logic tests.
* **Priority 2: Handler/Integration Tests**
    * Only write these if domain logic is stable.

## Error Handling
* Use custom error types defined in `domain/errors.go`.
* Do not return raw DB errors to the handler layer.