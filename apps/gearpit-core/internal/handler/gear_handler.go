package handler

import (
	"encoding/json"
	"net/http"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"gorm.io/gorm"
)

type GearHandler struct {
	DB *gorm.DB
}

// DB
func NewGearHandler(db *gorm.DB) *GearHandler {
	return &GearHandler{DB: db}
}

// CreateItem
func (h *GearHandler) CreateItem(w http.ResponseWriter, r *http.Request) {
	var item domain.Item

	// Request Body -> Struct
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Insert into DB
	if result := h.DB.Create(&item); result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Return created item
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(item)
}

// ListItems:
func (h *GearHandler) ListItems(w http.ResponseWriter, r *http.Request) {
	var items []domain.Item

	// Select * from items
	if result := h.DB.Find(&items); result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"items": items})
}
