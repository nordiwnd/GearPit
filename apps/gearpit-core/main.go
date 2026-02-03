package main

import (
	"log/slog"
	"net/http"
	"os"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/handler"
	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/infrastructure"
	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/infrastructure/repository"
	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/service"
)

func main() {
	// Logger setup
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	// Database initialization
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		// Fallback for local development
		dsn = "host=localhost user=postgres password=postgres dbname=gearpit port=5432 sslmode=disable TimeZone=Asia/Tokyo"
	}

	// 修正: NewDB -> InitDB
	db, err := infrastructure.InitDB(dsn)
	if err != nil {
		slog.Error("Failed to connect to database", "error", err)
		os.Exit(1)
	}

	// Dependency Injection (DI) Setup
	gearRepo := repository.NewGearRepository(db)
	gearService := service.NewGearService(gearRepo)
	gearHandler := handler.NewGearHandler(gearService)

	// Router setup (Standard net/http for now, recommend Chi or Gorilla Mux later)
	mux := http.NewServeMux()
	mux.HandleFunc("/api/v1/gears", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			gearHandler.ListItems(w, r)
		case http.MethodPost:
			gearHandler.CreateItem(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	slog.Info("Starting server", "port", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		slog.Error("Server failed", "error", err)
		os.Exit(1)
	}
}
