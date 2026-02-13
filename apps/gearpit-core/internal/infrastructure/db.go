package infrastructure

import (
	"embed"
	"fmt"
	"log/slog"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	gormpostgres "gorm.io/driver/postgres"
	"gorm.io/gorm"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

// InitDB initializes PostgreSQL connection and runs migrations.
func InitDB(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(gormpostgres.Open(dsn), &gorm.Config{
		// Optimize for Postgres
		PrepareStmt: true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect database: %w", err)
	}

	// Get generic database object sql.DB to use with golang-migrate
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get sql.DB: %w", err)
	}

	// Run migrations using golang-migrate
	driver, err := postgres.WithInstance(sqlDB, &postgres.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to create migrate driver: %w", err)
	}

	d, err := iofs.New(migrationsFS, "migrations")
	if err != nil {
		return nil, fmt.Errorf("failed to create iofs source: %w", err)
	}

	m, err := migrate.NewWithInstance(
		"iofs",
		d,
		"postgres",
		driver,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create migrate instance: %w", err)
	}

	slog.Info("Running database migrations...")
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return nil, fmt.Errorf("failed to run up migrations: %w", err)
	}
	slog.Info("Database migrations completed successfully")

	return db, nil
}
