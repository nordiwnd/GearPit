# 01. Go Backend Guidelines (Go 1.25.6)

## 1. Core Stack

- **Language**: Go 1.25.6
- **ORM**: GORM (gorm.io/gorm v1.31.1) with PostgreSQL driver
- **UUID**: Google UUID v7 (Time-ordered UUID for better DB indexing)
- **Logging**: Standard `log/slog` (JSON structured logging)

## 2. Directory Structure & Architecture Rule (Clean Architecture)

Strictly maintain separation of concerns. Do not bypass layers.

<architecture_layers>
<layer name="domain" path="internal/domain/">
<responsibility>Business logic, Models, and Repository Interface definitions.</responsibility>
<rule>MUST NOT depend on infrastructure details. (Note: Currently GORM tags exist here, but we aim to decouple them in future refactoring).</rule>
</layer>
<layer name="handler" path="internal/handler/">
<responsibility>HTTP request parsing, Validation, and JSON response generation.</responsibility>
<rule>MUST NOT directly use `gorm.DB`. Should only call interfaces defined in the domain layer.</rule>
</layer>
<layer name="infrastructure" path="internal/infrastructure/">
<responsibility>Database access (GORM implementation), External APIs.</responsibility>
<rule>Hides ORM details from the rest of the application.</rule>
</layer>
<layer name="cmd" path="cmd/seeder/, main.go">
<responsibility>Entry point, Dependency Injection (DI), and Configuration.</responsibility>
</layer>
</architecture_layers>

## 3. Coding Constraints for AI Agents

When writing Go code for this project, you **MUST** follow these rules:

### A. Error Handling & Logging

- **DO NOT** use `fmt.Println` or `log.Fatal`.
- **DO** use `log/slog` with contextual attributes. Example: `slog.Error("Failed to fetch gears", "error", err.Error())`
- **DO** wrap errors with context using `%w`: `fmt.Errorf("failed to create item: %w", err)`

### B. Database & Models (Postgres Specific)

- **UUID v7**: Always use UUID v7 for Primary Keys. Handled via GORM hooks (`BeforeCreate`).
- **Flexible Schemas**: Use `jsonb` (GORM type: `jsonb`) for dynamic properties. Use `pq.StringArray` for simple string lists (Tags).

### C. Handler Rules

- Handlers MUST respond with appropriate HTTP status codes (200, 201, 400, 500).
- Handlers MUST NOT expose internal DB error strings directly to the client.

### D. Infrastructure & Kubernetes Integration Rules (ADDED)

- **Database Connection**: Do not rely solely on a monolithic `DATABASE_URL`. The app MUST support dynamic DSN construction from Kubernetes-injected variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`).
- **CORS & Preflight**: The HTTP server MUST implement CORS middleware. It MUST handle `OPTIONS` preflight requests by returning `200 OK` and appropriate `Access-Control-Allow-*` headers to support Next.js Client Components.

## 4. Examples (DOs and DON'Ts)

### ❌ BAD: Handler directly accessing GORM (Current State to be fixed)

```go
// internal/handler/gear_handler.go
func (h *GearHandler) CreateItem(w http.ResponseWriter, r *http.Request) {
    var item domain.Item
    // BAD: Handler doing DB operations directly
    if result := h.DB.Create(&item); result.Error != nil { ... }
}
```

### ✅ GOOD: Handler calling Service/Repository Interface

```Go
// internal/handler/gear_handler.go
type GearHandler struct {
    Service domain.GearService // Injected interface
}

func (h *GearHandler) CreateItem(w http.ResponseWriter, r *http.Request) {
    var req CreateGearRequest
    // 1. Validation
    // 2. Call Service
    item, err := h.Service.Create(r.Context(), req)
    // 3. Response
}
```

### ❌ BAD: Domain layer depends on GORM

```Go
import "gorm.io/gorm" // DON'T do this in domain layer
type Gear struct {
    gorm.Model
}
```
