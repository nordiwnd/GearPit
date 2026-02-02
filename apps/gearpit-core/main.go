package main

import (
	"log/slog"
	"net/http"
	"os"
	"strings"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/handler"
	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/infrastructure"
	"github.com/rs/cors"
)

func main() {
	// Logger初期化
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	setEnvDefault("DB_HOST", "localhost")
	setEnvDefault("DB_USER", "gearpit")
	setEnvDefault("DB_PASSWORD", "password")
	setEnvDefault("DB_NAME", "gearpit")
	setEnvDefault("DB_PORT", "5432")
	setEnvDefault("PORT", "8080")
	// デフォルトでローカルとnip.ioを許可
	setEnvDefault("ALLOWED_ORIGINS", "http://localhost:3000,https://gearpit.io,http://gearpit.192.168.40.100.nip.io")

	// 1. DB Connection
	db, err := infrastructure.NewDB()
	if err != nil {
		slog.Error("Failed to connect to DB", "error", err)
		os.Exit(1)
	}

	// 2. Handlers
	gearHandler := handler.NewGearHandler(db)
	loadoutHandler := handler.NewLoadoutHandler(db)
	kitHandler := handler.NewKitHandler(db)

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// 3. API Routes (省略を復元)
	mux.HandleFunc("POST /api/v1/gears", gearHandler.CreateItem)
	mux.HandleFunc("GET /api/v1/gears", gearHandler.ListItems)

	mux.HandleFunc("POST /api/v1/loadouts", loadoutHandler.CreateLoadout)
	mux.HandleFunc("GET /api/v1/loadouts", loadoutHandler.ListLoadouts)

	mux.HandleFunc("POST /api/v1/kits", kitHandler.CreateKit)
	mux.HandleFunc("GET /api/v1/kits", kitHandler.ListKits)

	// CORS設定
	allowedOrigins := strings.Split(os.Getenv("ALLOWED_ORIGINS"), ",")
	c := cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
		Debug:            false,
	})

	handler := c.Handler(mux)

	slog.Info("Server starting", "port", os.Getenv("PORT"), "origins", allowedOrigins)
	if err := http.ListenAndServe(":"+os.Getenv("PORT"), handler); err != nil {
		slog.Error("Server failed", "error", err)
		os.Exit(1)
	}
}

func setEnvDefault(key, value string) {
	if os.Getenv(key) == "" {
		os.Setenv(key, value)
	}
}
