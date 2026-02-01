// apps/gearpit-core/main.go
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
	loadoutHandler := handler.NewLoadoutHandler(db) // 有効化
	// kitHandler := handler.NewKitHandler(db)     // Kitはまだコメントアウトのまま

	// 3. ルーティング (Go 1.22 ServeMux)
	mux := http.NewServeMux()

	// Health Check
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// --- Items Routes ---
	mux.HandleFunc("GET /items", gearHandler.ListItems)
	mux.HandleFunc("POST /items", gearHandler.CreateItem)
	mux.HandleFunc("GET /items/{id}", gearHandler.GetItem)
	mux.HandleFunc("PUT /items/{id}", gearHandler.UpdateItem)
	mux.HandleFunc("DELETE /items/{id}", gearHandler.DeleteItem)

	// --- Loadouts Routes (追加) ---
	mux.HandleFunc("GET /loadouts", loadoutHandler.ListLoadouts)
	mux.HandleFunc("POST /loadouts", loadoutHandler.CreateLoadout)
	mux.HandleFunc("GET /loadouts/{id}", loadoutHandler.GetLoadout)
	mux.HandleFunc("PUT /loadouts/{id}", loadoutHandler.UpdateLoadout)
	mux.HandleFunc("DELETE /loadouts/{id}", loadoutHandler.DeleteLoadout)

	// 4. Middleware (CORS)
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
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
