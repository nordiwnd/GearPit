package main

import (
	"log"
	"net/http"
	"os"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/handler"
	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/infrastructure"
)

func main() {
	setEnvDefault("DB_HOST", "localhost")
	setEnvDefault("DB_USER", "gearpit")
	setEnvDefault("DB_PASSWORD", "password")
	setEnvDefault("DB_NAME", "gearpit")
	setEnvDefault("DB_PORT", "5432")
	setEnvDefault("PORT", "8080")

	// 1. DB Connection
	db, err := infrastructure.NewDB()
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}

	// 2. Handlers
	gearHandler := handler.NewGearHandler(db)
	loadoutHandler := handler.NewLoadoutHandler(db)
	kitHandler := handler.NewKitHandler(db)
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("GearPit API is running"))
	})

	// 3. API Routes
	mux.HandleFunc("POST /api/v1/gears", gearHandler.CreateItem)
	mux.HandleFunc("GET /api/v1/gears", gearHandler.ListItems)
	mux.HandleFunc("POST /api/v1/loadouts", loadoutHandler.CreateLoadout)
	mux.HandleFunc("GET /api/v1/loadouts", loadoutHandler.ListLoadouts)
	// Kit Routes
	mux.HandleFunc("POST /api/v1/kits", kitHandler.CreateKit)
	mux.HandleFunc("GET /api/v1/kits", kitHandler.ListKits)
	log.Printf("Server starting on port %s", os.Getenv("PORT"))
	if err := http.ListenAndServe(":"+os.Getenv("PORT"), mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

func setEnvDefault(key, value string) {
	if os.Getenv(key) == "" {
		os.Setenv(key, value)
	}
}
