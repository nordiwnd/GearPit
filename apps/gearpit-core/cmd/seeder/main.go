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
		dsn = "host=localhost user=gearpit password=password dbname=gearpit port=5432 sslmode=disable TimeZone=Asia/Tokyo"
	}

	db, err := infrastructure.InitDB(dsn)
	if err != nil {
		log.Fatal(err)
	}

	// Helper for JSON properties
	createProps := func(brand, category string) datatypes.JSON {
		propsMap := map[string]string{"brand": brand, "category": category}
		propsBytes, _ := json.Marshal(propsMap)
		return datatypes.JSON(propsBytes)
	}

	// 1. Seed Items
	items := []domain.Item{
		// Base Weight (Shelter, Sleep System, Pack)
		{Name: "Tent (UL 1P)", Description: "Ultralight tent", Manufacturer: "Zpacks", WeightGram: 500, Unit: "g", WeightType: domain.WeightTypeBase, Properties: createProps("Zpacks", "Shelter")},
		{Name: "Sleeping Bag (-5C)", Description: "Down sleeping bag", Manufacturer: "Cumulus", WeightGram: 800, Unit: "g", WeightType: domain.WeightTypeBase, Properties: createProps("Cumulus", "Sleep System")},
		{Name: "Backpack 40L", Description: "Frameless pack", Manufacturer: "Palante", WeightGram: 450, Unit: "g", WeightType: domain.WeightTypeBase, Properties: createProps("Palante", "Pack")},
		{Name: "Hiking Poles", Description: "Carbon fiber poles", Manufacturer: "Black Diamond", WeightGram: 300, Unit: "g", WeightType: domain.WeightTypeBase, Properties: createProps("Black Diamond", "Trekking Poles")},
		{Name: "Stove", Description: "Tiny canister stove", Manufacturer: "BRS", WeightGram: 25, Unit: "g", WeightType: domain.WeightTypeBase, Properties: createProps("BRS", "Kitchen")},
		{Name: "Pot 750ml", Description: "Titanium pot", Manufacturer: "Toaks", WeightGram: 100, Unit: "g", WeightType: domain.WeightTypeBase, Properties: createProps("Toaks", "Kitchen")},

		// Consumables (Water, Food, Fuel)
		{Name: "Water (2L)", Description: "Carried water", Manufacturer: "Nature", WeightGram: 2000, Unit: "g", WeightType: domain.WeightTypeConsumable, Properties: createProps("Nature", "Water")},
		{Name: "Food (Day 1)", Description: "Snacks and dinner", Manufacturer: "Supermarket", WeightGram: 800, Unit: "g", WeightType: domain.WeightTypeConsumable, Properties: createProps("MyMix", "Food")},
		{Name: "Gas Canister (Small)", Description: "110g fuel", Manufacturer: "Primus", WeightGram: 200, Unit: "g", WeightType: domain.WeightTypeConsumable, Properties: createProps("Primus", "Fuel")},
		{Name: "Whisky Flask", Description: "Essential luxury", Manufacturer: "Generic", WeightGram: 250, Unit: "g", WeightType: domain.WeightTypeConsumable, Properties: createProps("Generic", "Luxury")},

		// Worn Weight (Clothing, Shoes)
		{Name: "Trail Runners", Description: "Altra Lone Peak", Manufacturer: "Altra", WeightGram: 600, Unit: "g", WeightType: domain.WeightTypeWorn, Properties: createProps("Altra", "Footwear")},
		{Name: "Hiking Pants", Description: "Convertible pants", Manufacturer: "Patagonia", WeightGram: 300, Unit: "g", WeightType: domain.WeightTypeWorn, Properties: createProps("Patagonia", "Clothing")},
		{Name: "Base Layer Top", Description: "Merino wool", Manufacturer: "Icebreaker", WeightGram: 150, Unit: "g", WeightType: domain.WeightTypeWorn, Properties: createProps("Icebreaker", "Clothing")},
		{Name: "GPS Watch", Description: "Garmin Fenix", Manufacturer: "Garmin", WeightGram: 80, Unit: "g", WeightType: domain.WeightTypeWorn, Properties: createProps("Garmin", "Electronics")},
		{Name: "Hat", Description: "Sun hat", Manufacturer: "Sunday Afternoons", WeightGram: 70, Unit: "g", WeightType: domain.WeightTypeWorn, Properties: createProps("Sunday Afternoons", "Clothing")},
	}

	createdItems := make(map[string]domain.Item)
	for _, item := range items {
		item.CreatedAt = time.Now()
		item.UpdatedAt = time.Now()
		if err := db.Where(domain.Item{Name: item.Name}).FirstOrCreate(&item).Error; err != nil {
			log.Printf("Failed to seed item %s: %v", item.Name, err)
		} else {
			createdItems[item.Name] = item
			fmt.Printf("Seeded Item: %s (Type: %s)\n", item.Name, item.WeightType)
		}
	}

	// 2. Seed Loadouts
	loadouts := []struct {
		Name         string
		ActivityType string
		ItemNames    []string
	}{
		{
			Name:         "Day Hike (Light)",
			ActivityType: "hiking",
			ItemNames: []string{
				"Backpack 40L", "Water (2L)", "Food (Day 1)", "Hiking Poles",
				"Trail Runners", "Hiking Pants", "Hat", "GPS Watch",
			},
		},
		{
			Name:         "Overnight Winter (Heavy)",
			ActivityType: "backpacking",
			ItemNames: []string{
				"Backpack 40L", "Tent (UL 1P)", "Sleeping Bag (-5C)",
				"Stove", "Pot 750ml", "Gas Canister (Small)",
				"Water (2L)", "Food (Day 1)", "Whisky Flask",
				"Trail Runners", "Hiking Pants", "Base Layer Top", "GPS Watch",
			},
		},
		{
			Name:         "Trail Running (Ultralight)",
			ActivityType: "running",
			ItemNames: []string{
				"Water (2L)", "Food (Day 1)",
				"Trail Runners", "GPS Watch", "Hat",
			},
		},
	}

	for _, l := range loadouts {
		var loadoutItems []domain.Item
		for _, name := range l.ItemNames {
			if item, exists := createdItems[name]; exists {
				loadoutItems = append(loadoutItems, item)
			}
		}

		loadout := domain.Loadout{
			Name:         l.Name,
			ActivityType: l.ActivityType,
			Items:        loadoutItems,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}

		if err := db.Create(&loadout).Error; err != nil {
			log.Printf("Failed to seed loadout %s: %v", l.Name, err)
		} else {
			fmt.Printf("Seeded Loadout: %s with %d items\n", l.Name, len(loadout.Items))
		}
	}

	// 3. Seed Trips
	trips := []domain.Trip{
		{
			Name:        "Yatsugatake Weekend",
			Description: "Snow hiking in Yatsugatake",
			Location:    "Nagano",
			StartDate:   time.Now().AddDate(0, 0, 7),
			EndDate:     time.Now().AddDate(0, 0, 9),
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			Name:        "Takao Day Hike",
			Description: "Training run",
			Location:    "Tokyo",
			StartDate:   time.Now().AddDate(0, 0, 1),
			EndDate:     time.Now().AddDate(0, 0, 1),
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
	}

	for _, trip := range trips {
		if err := db.Create(&trip).Error; err != nil {
			log.Printf("Failed to seed trip %s: %v", trip.Name, err)
		} else {
			fmt.Printf("Seeded Trip: %s\n", trip.Name)
		}
	}
}
