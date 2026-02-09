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

## Technology Choices (MANDATORY)
- **Router:** `github.com/go-chi/chi/v5`
- **Database:** `github.com/jackc/pgx/v5` (Raw SQL or stdlib wrapper. NO complex ORMs like GORM unless specified).
- **Logging:** `log/slog` (Structured).
- **Validation:** `github.com/go-playground/validator/v10`

## Database & Schema
- **Primary Keys:** ALWAYS use UUID v7.
- **Reference:** Check `docs/04-db-schema.md` for current table definitions before modifying queries.

## Testing
- **Style:** Table-driven tests.
- **Scope:** Unit tests for Service layer; Integration tests for Repository layer.