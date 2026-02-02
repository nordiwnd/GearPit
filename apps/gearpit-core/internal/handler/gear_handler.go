package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"gorm.io/gorm"
)

type GearHandler struct {
	DB *gorm.DB
}

// NewGearHandler creates a new instance of GearHandler
func NewGearHandler(db *gorm.DB) *GearHandler {
	return &GearHandler{DB: db}
}

// CreateItem handles the creation of a new gear item
func (h *GearHandler) CreateItem(w http.ResponseWriter, r *http.Request) {
	var item domain.Item

	// Request Body -> Struct
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		slog.Warn("Invalid request payload", "error", err)
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Insert into DB
	if result := h.DB.Create(&item); result.Error != nil {
		// 【修正】エラー詳細はログに出力し、レスポンスには含めない
		slog.Error("Failed to insert item into DB", "error", result.Error.Error())
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Return created item
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(item); err != nil {
		slog.Error("Failed to encode response", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}

// ListItems returns all gear items
func (h *GearHandler) ListItems(w http.ResponseWriter, r *http.Request) {
	var items []domain.Item

	// Select * from items
	if result := h.DB.Find(&items); result.Error != nil {
		// 【修正】DBエラーの原因特定用ログ
		slog.Error("Failed to fetch gears from DB", "error", result.Error.Error())
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(map[string]any{"items": items}); err != nil {
		slog.Error("Failed to encode response", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}
