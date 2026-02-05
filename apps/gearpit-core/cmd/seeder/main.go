package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/infrastructure"
	"gorm.io/datatypes"
)

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=gearpit port=5432 sslmode=disable TimeZone=Asia/Tokyo"
	}

	db, err := infrastructure.InitDB(dsn)
	if err != nil {
		log.Fatal(err)
	}

	// Create generic properties
	propsMap := map[string]string{"brand": "Montbell", "category": "Clothing"}
	propsBytes, _ := json.Marshal(propsMap)
	props := datatypes.JSON(propsBytes)

	items := []domain.Item{
		{
			Name:         "Storm Cruiser Jacket",
			Description:  "Gore-Tex Rain Jacket",
			Manufacturer: "Montbell",
			WeightGram:   254,
			Unit:         "g",
			Properties:   props, // Tags -> Properties に変更
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
		{
			Name:         "Alpine Light Down",
			Description:  "Warm down jacket",
			Manufacturer: "Montbell",
			WeightGram:   380,
			Unit:         "g",
			Properties:   props, // Tags -> Properties に変更
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
	}

	for _, item := range items {
		if err := db.Create(&item).Error; err != nil {
			fmt.Printf("Failed to seed item %s: %v\n", item.Name, err)
		} else {
			fmt.Printf("Seeded item: %s\n", item.Name)
		}
	}
}
