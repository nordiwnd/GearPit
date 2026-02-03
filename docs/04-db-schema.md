# 04. DB Schema & Migration Guidelines (PostgreSQL 16)

## 1. Core Stack

- **Database**: PostgreSQL 16-alpine
- **ORM**: GORM (Go)
- **Deployment**: Kubernetes `StatefulSet` with Persistent Volumes.

## 2. Core Entities & Data Modeling

The application domain relies heavily on PostgreSQL-specific features for performance and flexibility.

<entities>
  <entity name="Item (Gear)">
    <description>The fundamental unit of gear (e.g., "Tent", "Ski Boots").</description>
    <key_features>
      - Uses `jsonb` column for dynamic, polymorphic attributes (e.g., ski_length, tent_capacity) indexed with GIN.
      - Uses `text[]` (Postgres Array) for tags.
    </key_features>
  </entity>
  <entity name="Kit">
    <description>A reusable collection of Items (e.g., "Backcountry Safety Kit").</description>
  </entity>
  <entity name="Loadout">
    <description>The final packing list for a specific activity. Composed of Kits and standalone Items.</description>
  </entity>
  <entity name="MaintenanceLog">
    <description>1:N relation to Items. Tracks repairs, tune-ups, and inspections.</description>
  </entity>
</entities>

## 3. PostgreSQL Best Practices for AI Agents

When designing schemas or writing queries, you **MUST** adhere to the following:

1. **Primary Keys**: Always use **UUID v7** (time-ordered UUID) for primary keys to ensure optimal B-Tree index performance. Do not use standard auto-increment integers.
2. **Flexible Schemas**: Use `jsonb` for dynamic properties instead of creating overly normalized tables for gear specs. Always define GIN indexes for JSONB fields.
3. **Soft Deletes**: Use GORM's `DeletedAt` for logical deletion, preserving maintenance history.

### ✅ GOOD: GORM Model Example

```go
type Item struct {
    ID         string         `gorm:"primaryKey;type:uuid"` // UUID v7
    Name       string         `gorm:"not null"`
    Properties map[string]any `gorm:"type:jsonb;index:type:gin"` // Flexible specs
    Tags       pq.StringArray `gorm:"type:text[]"` // Postgres Array
    CreatedAt  time.Time
}
```

## 4. Migration Strategy

- Phase 2 (Current): Using GORM's AutoMigrate(&domain.Item{}, ...) on application startup for rapid development.
- Phase 3 (Production Ready): Transition to explicitly versioned SQL migrations (e.g., golang-migrate/migrate).
  - Rule for AI: When modifying existing models, DO NOT perform destructive operations (e.g., dropping columns) that would cause data loss in production.

## 5. GitOps & Infrastructure Rules

- StatefulSet Requirement: PostgreSQL MUST be deployed as a StatefulSet with a volumeClaimTemplate. Never use a simple Deployment.
- Preview Environments: In PR preview environments (managed by ArgoCD), the Postgres PVC size MUST be minimized (e.g., 1Gi or 512Mi) via Kustomize patches to save disk space on the Raspberry Pi cluster.
