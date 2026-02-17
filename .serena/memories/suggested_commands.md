# Suggested Commands

## Local Development (Preferred)
- **Start Full Stack**: `tilt up` (Orchestrates k3d, backend, frontend, and db).
  - Backend available at `localhost` (via Ingress/Port-forward).
  - Frontend available at `http://localhost:9000`.
  - DB available at `localhost:5432`.

## Manual Run (Component Level)
### Backend
```bash
cd apps/gearpit-core
go mod download
go run main.go
```
*Requires local PostgreSQL on port 5432.*

### Frontend
```bash
cd apps/gearpit-web
npm install
npm run dev
```
*Accessible at http://localhost:3000.*

## Utilities
- **Lint/Test Backend**: `go test ./...`
