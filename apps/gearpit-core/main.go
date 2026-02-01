package main

import (
	"log"
	"net/http"
	"os"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/handler"
	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/infrastructure"
	"github.com/rs/cors"
)

func main() {
	// 1. DB接続
	db, err := infrastructure.NewDB()
	if err != nil {
		log.Fatalf("failed to initialize database: %v", err)
	}

	// 2. Handler初期化
	gearHandler := handler.NewGearHandler(db)
	// kitHandler := handler.NewKitHandler(db)     // 後ほど実装
	// loadoutHandler := handler.NewLoadoutHandler(db) // 後ほど実装

	// 3. ルーティング (Go 1.22 ServeMux)
	mux := http.NewServeMux()

	// Health Check
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Items Routes
	mux.HandleFunc("GET /items", gearHandler.ListItems)
	mux.HandleFunc("POST /items", gearHandler.CreateItem)
	mux.HandleFunc("GET /items/{id}", gearHandler.GetItem)
	mux.HandleFunc("PUT /items/{id}", gearHandler.UpdateItem)
	mux.HandleFunc("DELETE /items/{id}", gearHandler.DeleteItem)

	// 4. Middleware (CORS)
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"}, // 開発中は全許可、本番では環境変数で制御推奨
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})
	handler := c.Handler(mux)

	// 5. サーバー起動
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server starting on port %s...", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
