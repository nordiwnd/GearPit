package infrastructure

import (
	"fmt"
	"log/slog"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// InitDB initializes PostgreSQL connection and runs auto-migration.
func InitDB(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		// Optimize for Postgres
		PrepareStmt: true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect database: %w", err)
	}

	// AutoMigrate applies schema changes.
	// NOTE: In Phase 3, this will be replaced by golang-migrate.
	slog.Info("Running auto migration...")
	err = db.AutoMigrate(
		&domain.Item{},
		&domain.Kit{},
		&domain.Loadout{},
		&domain.MaintenanceLog{},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to run auto migrate: %w", err)
	}

	return db, nil
}
