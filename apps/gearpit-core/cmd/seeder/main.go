package main

import (
	"log"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/infrastructure"
	"gorm.io/gorm"
)

// Seeder: 開発用初期データの投入
func main() {
	log.Println("Initializing Seeder...")

	// DB接続 (環境変数は実行時に渡す)
	db, err := infrastructure.NewDB()
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}

	seedItems(db)
}

func seedItems(db *gorm.DB) {
	items := []domain.Item{
		// 1. [Ski/Board] Faction Agent 3.0
		{
			Name:       "Agent 3.0",
			Brand:      "Faction",
			WeightGram: 1800,
			Category:   "ski",
			Properties: map[string]any{
				"sub_category": "board",
				"length_cm":    180,
				"width_mm":     106,
				"profile":      "Camber-Rocker",
			},
			Tags: []string{"freeride", "touring"},
		},
		// 2. [Ski/Boots] Tecnica Cochise 130
		{
			Name:       "Cochise 130",
			Brand:      "Tecnica",
			WeightGram: 1850,
			Category:   "ski",
			Properties: map[string]any{
				"sub_category":   "boots",
				"size":           "26.5",
				"sole_length_mm": 305,
				"system":         "Dynafit/Pin",
			},
			Tags: []string{"hybrid", "freeride"},
		},
		// 3. [Ski/Safety] Mammut Barryvox S
		{
			Name:       "Barryvox S",
			Brand:      "Mammut",
			WeightGram: 210,
			Category:   "ski",
			Properties: map[string]any{
				"sub_category": "safety",
				"spec_detail":  "Digital/Analog 70m range",
				"battery":      "AAA x3",
			},
			Tags: []string{"avalanche", "safety"},
		},
		// 4. [Mountaineering] Black Diamond Raven Pro
		{
			Name:       "Raven Pro",
			Brand:      "Black Diamond",
			WeightGram: 390,
			Category:   "mountaineering",
			Properties: map[string]any{
				"sub_category": "gear",
				"length_cm":    55,
				"material":     "Stainless Steel",
			},
			Tags: []string{"ice_axe", "lightweight"},
		},
		// 5. [Camp/Tent] Hilleberg Soulo
		{
			Name:       "Soulo",
			Brand:      "Hilleberg",
			WeightGram: 2400,
			Category:   "camp",
			Properties: map[string]any{
				"sub_category":    "tent",
				"capacity_person": 1,
				"season_rating":   "4-season",
			},
			Tags: []string{"expedition", "solo"},
		},
	}

	log.Printf("Seeding %d items...\n", len(items))

	for _, item := range items {
		// 名前とブランドで重複チェックし、なければ作成
		var existing domain.Item
		result := db.Where("name = ? AND brand = ?", item.Name, item.Brand).First(&existing)

		if result.Error == gorm.ErrRecordNotFound {
			if err := db.Create(&item).Error; err != nil {
				log.Printf("Failed to create %s: %v", item.Name, err)
			} else {
				log.Printf("Created: %s (ID: %s)", item.Name, item.ID)
			}
		} else {
			log.Printf("Skipped (Already exists): %s", item.Name)
		}
	}
}
