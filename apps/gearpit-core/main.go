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
		dsn = "host=localhost user=postgres password=postgres dbname=gearpit port=5432 sslmode=disable TimeZone=Asia/Tokyo"
	}

	db, err := infrastructure.InitDB(dsn)
	if err != nil {
		slog.Error("Failed to connect to database", "error", err)
		os.Exit(1)
	}

	// Dependency Injection (DI) Setup
	gearRepo := repository.NewGearRepository(db)
	gearService := service.NewGearService(gearRepo)
	gearHandler := handler.NewGearHandler(gearService)

	// Router setup
	mux := http.NewServeMux()
	mux.HandleFunc("/api/v1/gears", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			gearHandler.ListItems(w, r)
		case http.MethodPost:
			gearHandler.CreateItem(w, r)
		case http.MethodOptions:
			// Preflight request response for /api/v1/gears
			w.WriteHeader(http.StatusOK)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Start server with CORS middleware
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	slog.Info("Starting server", "port", port)

	// 修正: muxをCORSミドルウェアでラップして起動
	if err := http.ListenAndServe(":"+port, enableCORS(mux)); err != nil {
		slog.Error("Server failed", "error", err)
		os.Exit(1)
	}
}

// enableCORS is a middleware to allow cross-origin requests from the frontend.
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 開発環境用に localhost:3000 を許可 (本番では環境変数で制御推奨)
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// OPTIONSメソッド（プリフライトリクエスト）の場合はここで終了
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
