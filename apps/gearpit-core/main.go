package main

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"strings"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
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
		host := os.Getenv("DB_HOST")
		if host == "" {
			host = "localhost" // ローカル開発用フォールバック
		}
		user := os.Getenv("DB_USER")
		if user == "" {
			user = "postgres"
		}
		password := os.Getenv("DB_PASSWORD")
		if password == "" {
			password = "postgres"
		}
		dbname := os.Getenv("DB_NAME")
		if dbname == "" {
			dbname = "gearpit"
		}
		port := os.Getenv("DB_PORT")
		if port == "" {
			port = "5432"
		}

		dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Tokyo",
			host, user, password, dbname, port)
	}

	// 1. Connect to DB (Moved before AutoMigrate)
	db, err := infrastructure.InitDB(dsn)
	if err != nil {
		slog.Error("Failed to connect to database", "error", err)
		os.Exit(1)
	}

	// 2. Migration (Now db is defined)
	db.AutoMigrate(
		&domain.Item{},
		&domain.Kit{},
		&domain.Loadout{},
		&domain.MaintenanceLog{},
		&domain.Trip{},
		&domain.TripItem{},
		&domain.UserProfile{},
	)
	// Dependency Injection (DI) Setup
	gearRepo := repository.NewGearRepository(db)
	gearService := service.NewGearService(gearRepo)
	gearHandler := handler.NewGearHandler(gearService)
	kitRepo := repository.NewKitRepository(db)
	kitService := service.NewKitService(kitRepo)
	kitHandler := handler.NewKitHandler(kitService)

	loadoutRepo := repository.NewLoadoutRepository(db)
	loadoutService := service.NewLoadoutService(loadoutRepo)
	loadoutHandler := handler.NewLoadoutHandler(loadoutService)

	maintenanceRepo := repository.NewMaintenanceRepository(db)
	maintenanceService := service.NewMaintenanceService(maintenanceRepo)
	maintenanceHandler := handler.NewMaintenanceHandler(maintenanceService)

	dashboardRepo := repository.NewDashboardRepository(db)
	dashboardService := service.NewDashboardService(dashboardRepo)
	dashboardHandler := handler.NewDashboardHandler(dashboardService)

	tripRepo := repository.NewTripRepository(db)
	tripService := service.NewTripService(tripRepo)
	tripHandler := handler.NewTripHandler(tripService)

	profileRepo := repository.NewProfileRepository(db)
	profileService := service.NewProfileService(profileRepo)
	profileHandler := handler.NewProfileHandler(profileService)

	// Router setup
	mux := http.NewServeMux()

	// 1. Collection routes: /api/v1/gears
	mux.HandleFunc("/api/v1/gears", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			gearHandler.SearchItems(w, r)
		case http.MethodPost:
			gearHandler.CreateItem(w, r)
		case http.MethodOptions:
			w.WriteHeader(http.StatusOK)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// 2. Item routes: /api/v1/gears/{id}
	mux.HandleFunc("/api/v1/gears/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPut:
			gearHandler.UpdateItem(w, r)
		case http.MethodDelete:
			gearHandler.DeleteItem(w, r)
		case http.MethodOptions:
			w.WriteHeader(http.StatusOK)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Kit Routes
	mux.HandleFunc("/api/v1/kits", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			kitHandler.ListKits(w, r)
		case http.MethodPost:
			kitHandler.CreateKit(w, r)
		case http.MethodOptions:
			w.WriteHeader(http.StatusOK)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
	mux.HandleFunc("/api/v1/kits/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			kitHandler.GetKit(w, r)
		case http.MethodOptions:
			w.WriteHeader(http.StatusOK)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Loadout Routes
	mux.HandleFunc("/api/v1/loadouts", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			loadoutHandler.ListLoadouts(w, r)
		case http.MethodPost:
			loadoutHandler.CreateLoadout(w, r)
		case http.MethodOptions:
			w.WriteHeader(http.StatusOK)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/v1/loadouts/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			loadoutHandler.GetLoadout(w, r)
		case http.MethodPut:
			loadoutHandler.UpdateLoadout(w, r)
		case http.MethodDelete:
			loadoutHandler.DeleteLoadout(w, r)
		case http.MethodOptions:
			w.WriteHeader(http.StatusOK)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Maintenance Logs Routes
	mux.HandleFunc("/api/v1/maintenance", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			maintenanceHandler.AddLog(w, r)
		case http.MethodOptions:
			w.WriteHeader(http.StatusOK)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
	mux.HandleFunc("/api/v1/maintenance/item/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			maintenanceHandler.GetItemLogs(w, r)
		case http.MethodOptions:
			w.WriteHeader(http.StatusOK)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
	mux.HandleFunc("/api/v1/maintenance/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPut:
			maintenanceHandler.UpdateLog(w, r)
		case http.MethodDelete:
			maintenanceHandler.DeleteLog(w, r)
		case http.MethodOptions:
			w.WriteHeader(http.StatusOK)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Dashboard Routes
	mux.HandleFunc("/api/v1/dashboard/stats", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			dashboardHandler.GetStats(w, r)
		case http.MethodOptions:
			w.WriteHeader(http.StatusOK)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Trips Routes
	mux.HandleFunc("/api/v1/trips", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			tripHandler.ListTrips(w, r)
		case http.MethodPost:
			tripHandler.CreateTrip(w, r)
		case http.MethodOptions:
			w.WriteHeader(http.StatusOK)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/v1/trips/", func(w http.ResponseWriter, r *http.Request) {
		// /api/v1/trips/{id}/items の判定
		if strings.Contains(r.URL.Path, "/items") {
			tripHandler.HandleTripItems(w, r)
			return
		}

		switch r.Method {
		case http.MethodGet:
			tripHandler.GetTrip(w, r)
		case http.MethodDelete:
			tripHandler.DeleteTrip(w, r)
		// PUT (Update) は省略しましたが実装済みならここに追加
		case http.MethodOptions:
			w.WriteHeader(http.StatusOK)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Profile Routes
	mux.HandleFunc("/api/v1/profiles", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			profileHandler.ListProfiles(w, r)
		case http.MethodPost:
			profileHandler.CreateProfile(w, r)
		case http.MethodOptions:
			w.WriteHeader(http.StatusOK)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/v1/profiles/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet, http.MethodPut, http.MethodDelete:
			profileHandler.HandleProfile(w, r)
		case http.MethodOptions:
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

	if err := http.ListenAndServe(":"+port, enableCORS(mux)); err != nil {
		slog.Error("Server failed", "error", err)
		os.Exit(1)
	}
}

// enableCORS is a middleware to allow cross-origin requests from the frontend.
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
