package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"time"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/infrastructure"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

func main() {
	// Parse CLI flags
	var (
		host     string
		port     string
		user     string
		password string
		dbname   string
		sslmode  string
		prNumber string
	)

	flag.StringVar(&host, "host", "localhost", "Database host")
	flag.StringVar(&port, "port", "5432", "Database port")
	flag.StringVar(&user, "user", "gearpit", "Database user")
	flag.StringVar(&password, "password", "password", "Database password")
	flag.StringVar(&dbname, "dbname", "gearpit", "Database name")
	flag.StringVar(&sslmode, "sslmode", "disable", "SSL mode")
	flag.StringVar(&prNumber, "pr", "", "PR number (optional, for logging context)")
	flag.Parse()

	// Construct DSN
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Tokyo",
		host, user, password, dbname, port, sslmode)

	if prNumber != "" {
		log.Printf("Starting data seeding for PR #%s...", prNumber)
	} else {
		log.Println("Starting data seeding...")
	}

	db, err := infrastructure.InitDB(dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Migrate Schema (Ensure tables exist)
	// infrastructure.InitDB already does AutoMigrate, but it's good to be safe if anything changed
	// Skipping explicit migration call as InitDB handles it.

	seedData(db)
}

func seedData(db *gorm.DB) {
	// 0. Seed User Profile
	user := seedUserProfile(db)

	// 1. Seed Items
	items := seedItems(db)

	// 2. Seed Kits
	kits := seedKits(db, items)

	// 3. Seed Loadouts (Items + Kits)
	_ = seedLoadouts(db, items, kits)

	// 4. Seed Trips
	seedTrips(db, user, items)

	// 5. Seed Maintenance Logs
	seedMaintenanceLogs(db, items)

	log.Println("Seeding completed successfully!")
}

// Helper for JSON properties
func createProps(brand, category string) datatypes.JSON {
	propsMap := map[string]string{"brand": brand, "category": category}
	propsBytes, _ := json.Marshal(propsMap)
	return datatypes.JSON(propsBytes)
}

func seedUserProfile(db *gorm.DB) *domain.UserProfile {
	profile := domain.UserProfile{
		Name:      "Demo User",
		HeightCm:  175.5,
		WeightKg:  70.0,
		Age:       30,
		Gender:    "other",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := db.Where(domain.UserProfile{Name: profile.Name}).FirstOrCreate(&profile).Error; err != nil {
		log.Printf("Failed to seed user profile: %v", err)
		return nil
	}
	log.Printf("Seeded User Profile: %s", profile.Name)
	return &profile
}

func seedItems(db *gorm.DB) map[string]domain.Item {
	items := []domain.Item{
		// Base Weight (Shelter, Sleep System, Pack)
		{Name: "Tent (UL 1P)", Description: "Ultralight tent", Manufacturer: "Zpacks", WeightGram: 500, Unit: "g", WeightType: domain.WeightTypeBase, Properties: createProps("Zpacks", "Shelter")},
		{Name: "Sleeping Bag (-5C)", Description: "Down sleeping bag", Manufacturer: "Cumulus", WeightGram: 800, Unit: "g", WeightType: domain.WeightTypeBase, Properties: createProps("Cumulus", "Sleep System")},
		{Name: "Backpack 40L", Description: "Frameless pack", Manufacturer: "Palante", WeightGram: 450, Unit: "g", WeightType: domain.WeightTypeBase, Properties: createProps("Palante", "Pack")},
		{Name: "Hiking Poles", Description: "Carbon fiber poles", Manufacturer: "Black Diamond", WeightGram: 300, Unit: "g", WeightType: domain.WeightTypeBase, Properties: createProps("Black Diamond", "Trekking Poles")},
		{Name: "Stove", Description: "Tiny canister stove", Manufacturer: "BRS", WeightGram: 25, Unit: "g", WeightType: domain.WeightTypeBase, Properties: createProps("BRS", "Kitchen")},
		{Name: "Pot 750ml", Description: "Titanium pot", Manufacturer: "Toaks", WeightGram: 100, Unit: "g", WeightType: domain.WeightTypeBase, Properties: createProps("Toaks", "Kitchen")},
		{Name: "Headlamp", Description: "Rechargeable", Manufacturer: "Nitecore", WeightGram: 45, Unit: "g", WeightType: domain.WeightTypeBase, Properties: createProps("Nitecore", "Electronics")},
		{Name: "First Aid Kit", Description: "Basic medical supplies", Manufacturer: "DIY", WeightGram: 200, Unit: "g", WeightType: domain.WeightTypeBase, Properties: createProps("DIY", "Safety")},

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
		// Use FirstOrCreate to avoid duplicates, keying off Name
		if err := db.Where(domain.Item{Name: item.Name}).FirstOrCreate(&item).Error; err != nil {
			log.Printf("Failed to seed item %s: %v", item.Name, err)
		} else {
			createdItems[item.Name] = item
			// fmt.Printf("Seeded Item: %s (Type: %s)\n", item.Name, item.WeightType)
		}
	}
	log.Printf("Seeded %d Items", len(createdItems))
	return createdItems
}

func seedKits(db *gorm.DB, items map[string]domain.Item) map[string]domain.Kit {
	kitsDef := []struct {
		Name        string
		Description string
		ItemNames   []string
	}{
		{
			Name:        "Cookset Solo",
			Description: "Minimalist cooking setup",
			ItemNames:   []string{"Stove", "Pot 750ml", "Gas Canister (Small)"},
		},
		{
			Name:        "Safety Essentials",
			Description: "Must-haves for any trip",
			ItemNames:   []string{"First Aid Kit", "Headlamp"},
		},
	}

	createdKits := make(map[string]domain.Kit)

	for _, k := range kitsDef {
		var kitItems []domain.Item
		for _, name := range k.ItemNames {
			if item, exists := items[name]; exists {
				kitItems = append(kitItems, item)
			}
		}

		kit := domain.Kit{
			Name:        k.Name,
			Description: k.Description,
			Items:       kitItems,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		// First check if kit exists
		var existingKit domain.Kit
		if err := db.Where("name = ?", k.Name).First(&existingKit).Error; err == nil {
			// Update items if exists
			if err := db.Model(&existingKit).Association("Items").Replace(kitItems); err != nil {
				log.Printf("Failed to update items for kit %s: %v", k.Name, err)
			}
			createdKits[k.Name] = existingKit
		} else {
			// Create new
			if err := db.Create(&kit).Error; err != nil {
				log.Printf("Failed to seed kit %s: %v", k.Name, err)
			} else {
				createdKits[k.Name] = kit
			}
		}
	}
	log.Printf("Seeded %d Kits", len(createdKits))
	return createdKits
}

func seedLoadouts(db *gorm.DB, items map[string]domain.Item, kits map[string]domain.Kit) map[string]domain.Loadout {
	loadoutsDef := []struct {
		Name         string
		ActivityType string
		ItemNames    []string
		KitNames     []string
	}{
		{
			Name:         "Day Hike (Light)",
			ActivityType: "hiking",
			ItemNames: []string{
				"Backpack 40L", "Water (2L)", "Food (Day 1)", "Hiking Poles",
				"Trail Runners", "Hiking Pants", "Hat", "GPS Watch",
			},
			KitNames: []string{"Safety Essentials"},
		},
		{
			Name:         "Overnight Winter (Heavy)",
			ActivityType: "backpacking",
			ItemNames: []string{
				"Backpack 40L", "Tent (UL 1P)", "Sleeping Bag (-5C)",
				"Water (2L)", "Food (Day 1)", "Whisky Flask",
				"Trail Runners", "Hiking Pants", "Base Layer Top", "GPS Watch",
			},
			KitNames: []string{"Cookset Solo", "Safety Essentials"},
		},
	}

	createdLoadouts := make(map[string]domain.Loadout)

	for _, l := range loadoutsDef {
		var loadoutItems []domain.Item
		for _, name := range l.ItemNames {
			if item, exists := items[name]; exists {
				loadoutItems = append(loadoutItems, item)
			}
		}

		var loadoutKits []domain.Kit
		for _, name := range l.KitNames {
			if kit, exists := kits[name]; exists {
				loadoutKits = append(loadoutKits, kit)
			}
		}

		loadout := domain.Loadout{
			Name:         l.Name,
			ActivityType: l.ActivityType,
			Items:        loadoutItems,
			Kits:         loadoutKits,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}

		var existingLoadout domain.Loadout
		if err := db.Where("name = ?", l.Name).First(&existingLoadout).Error; err == nil {
			// Update associations
			db.Model(&existingLoadout).Association("Items").Replace(loadoutItems)
			db.Model(&existingLoadout).Association("Kits").Replace(loadoutKits)
			createdLoadouts[l.Name] = existingLoadout
		} else {
			if err := db.Create(&loadout).Error; err != nil {
				log.Printf("Failed to seed loadout %s: %v", l.Name, err)
			} else {
				createdLoadouts[l.Name] = loadout
			}
		}
	}
	log.Printf("Seeded %d Loadouts", len(createdLoadouts))
	return createdLoadouts
}

func seedTrips(db *gorm.DB, user *domain.UserProfile, items map[string]domain.Item) {
	trips := []domain.Trip{
		{
			Name:        "Yatsugatake Weekend",
			Description: "Snow hiking in Yatsugatake",
			Location:    "Nagano",
			StartDate:   time.Now().AddDate(0, 0, 7),
			EndDate:     time.Now().AddDate(0, 0, 9),
			Status:      "planned",
		},
		{
			Name:        "Takao Day Hike",
			Description: "Training run",
			Location:    "Tokyo",
			StartDate:   time.Now().AddDate(0, 0, 1),
			EndDate:     time.Now().AddDate(0, 0, 1),
			Status:      "completed",
		},
	}

	for _, trip := range trips {
		if user != nil {
			trip.UserProfileID = &user.ID
		}
		trip.CreatedAt = time.Now()
		trip.UpdatedAt = time.Now()

		if err := db.Where("name = ?", trip.Name).FirstOrCreate(&trip).Error; err != nil {
			log.Printf("Failed to seed trip %s: %v", trip.Name, err)
		} else {
			// Link items using the Join Table (TripItem) logic if needed,
			// currently just linking basic many2many for simplicity in seed
			// but Trip has TripItems struct.
			// Let's add some items to "Yatsugatake Weekend"
			if trip.Name == "Yatsugatake Weekend" {
				// Find ID
				var t domain.Trip
				db.Where("name = ?", trip.Name).First(&t)

				// Add TripItems
				itemNames := []string{"Tent (UL 1P)", "Sleeping Bag (-5C)"}
				for _, name := range itemNames {
					if item, exists := items[name]; exists {
						tripItem := domain.TripItem{
							TripID:   t.ID,
							ItemID:   item.ID,
							Quantity: 1,
						}
						db.FirstOrCreate(&tripItem)
					}
				}
			}
		}
	}
	log.Printf("Seeded Trips")
}

func seedMaintenanceLogs(db *gorm.DB, items map[string]domain.Item) {
	// Maintenance for Tent (UL 1P)
	if tent, exists := items["Tent (UL 1P)"]; exists {
		logs := []domain.MaintenanceLog{
			{
				ItemID:        tent.ID,
				Type:          "inspection",
				Description:   "Checked for holes after trip",
				PerformedAt:   time.Now().AddDate(0, -1, 0),
				Cost:          0,
				SnapshotUsage: 5,
				CreatedAt:     time.Now(),
			},
			{
				ItemID:        tent.ID,
				Type:          "repair",
				Description:   "Patched small hole in mesh",
				PerformedAt:   time.Now().AddDate(0, 0, -5),
				Cost:          500,
				SnapshotUsage: 6,
				CreatedAt:     time.Now(),
			},
		}

		for _, l := range logs {
			// Naive check to avoid infinite explicit duplicates, but logs are usually unique by ID.
			// We can check by properties if strictly needed, but just Create is fine for seed run
			// if we accept more logs on multiple runs.
			// For idempotency, checking by Description + Time
			var existing domain.MaintenanceLog
			if err := db.Where("item_id = ? AND description = ?", l.ItemID, l.Description).First(&existing).Error; err != nil {
				db.Create(&l)
			}
		}
	}
	log.Printf("Seeded Maintenance Logs")
}
