package main

import (
	"log"
	"net/http"
	"os"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/handler"
	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/infrastructure"
)

func main() {
	// 1. Database Connection
	db, err := infrastructure.NewDBConnection()
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}

	// 2. Auto Migration
	// アプリ起動時にテーブル構造を自動同期
	infrastructure.RunMigrations(db)

	// 3. Setup Handlers
	itemHandler := handler.NewItemHandler(db)

	// 4. Router Setup (Go 1.22+)
	mux := http.NewServeMux()

	// Health Check
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// API Routes
	mux.HandleFunc("POST /items", itemHandler.CreateItem)
	mux.HandleFunc("GET /items", itemHandler.ListItems)

	// 5. Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s...", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
