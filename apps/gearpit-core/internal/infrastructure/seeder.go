package infrastructure

import (
	"log/slog"
	"time"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// SeedDB inserts initial data for E2E testing
func SeedDB(db *gorm.DB) {
	slog.Info("Starting database seeding...")

	items := []domain.Item{
		{
			Name:         "Storm Cruiser Jacket",
			Description:  "Gore-Tex Rain Jacket",
			Manufacturer: "Montbell",
			WeightGram:   254,
			WeightType:   domain.WeightTypeWorn,
			Unit:         "g",
			Properties:   datatypes.JSON(`{"brand": "Montbell", "category": "Clothing"}`),
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
		{
			Name:         "Sawyer Squeeze",
			Description:  "Water Filter",
			Manufacturer: "Sawyer",
			WeightGram:   85,
			WeightType:   domain.WeightTypeAccessory,
			Unit:         "g",
			Properties:   datatypes.JSON(`{"brand": "Sawyer", "category": "Electronics"}`),
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
		{
			Name:         "Atomic Bent 100",
			Description:  "Freeride skis",
			Manufacturer: "Atomic",
			WeightGram:   3400,
			WeightType:   domain.WeightTypeLong,
			Unit:         "g",
			Properties:   datatypes.JSON(`{"brand": "Atomic", "category": "Skis"}`),
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
		{
			Name:         "Alpine Light Down",
			Description:  "Warm down jacket",
			Manufacturer: "Montbell",
			WeightGram:   380,
			WeightType:   domain.WeightTypeBase,
			Unit:         "g",
			Properties:   datatypes.JSON(`{"brand": "Montbell", "category": "Clothing"}`),
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
	}

	for _, item := range items {
		// Use FirstOrCreate to avoid duplicates if seeding runs multiple times
		// Checking by Name for simplicity in this smoke test context
		var existing domain.Item
		if err := db.Where("name = ?", item.Name).First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := db.Create(&item).Error; err != nil {
					slog.Error("Failed to seed item", "name", item.Name, "error", err)
				} else {
					slog.Info("Seeded item", "name", item.Name)
				}
			} else {
				slog.Error("Failed to check existing item", "name", item.Name, "error", err)
			}
		} else {
			slog.Info("Item already exists, skipping", "name", item.Name)
		}
	}

	slog.Info("Database seeding completed.")
}
