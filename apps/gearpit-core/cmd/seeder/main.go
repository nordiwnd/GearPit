package main

import (
	"log/slog"
	"os"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/infrastructure"
)

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=gearpit port=5432 sslmode=disable TimeZone=Asia/Tokyo"
	}

	// 修正: NewDB -> InitDB
	db, err := infrastructure.InitDB(dsn)
	if err != nil {
		slog.Error("Failed to init DB", "error", err)
		return
	}

	// 修正: Brand, CategoryをProperties (JSONB) に統合
	items := []domain.Item{
		{
			Name:        "Atomic Bent Chetler 100",
			Description: "All-mountain freeride ski",
			WeightGram:  1700,
			Tags:        []string{"ski", "winter", "freeride"},
			Properties: map[string]any{
				"brand":    "Atomic",
				"category": "Ski",
				"length":   180,
			},
		},
		{
			Name:        "Salomon Shift MNC 13",
			Description: "Hybrid touring binding",
			WeightGram:  880,
			Tags:        []string{"ski", "binding", "touring"},
			Properties: map[string]any{
				"brand":    "Salomon",
				"category": "Binding",
				"din":      13,
			},
		},
	}

	for _, item := range items {
		if err := db.Create(&item).Error; err != nil {
			slog.Error("Failed to seed item", "name", item.Name, "error", err)
		} else {
			slog.Info("Seeded item", "name", item.Name, "brand", item.Properties["brand"])
		}
	}
}
