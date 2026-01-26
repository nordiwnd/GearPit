// apps/gearpit-core/internal/handler/kit_handler.go
package handler

import (
	"encoding/json"
	"net/http"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"gorm.io/gorm"
)

type KitHandler struct {
	DB *gorm.DB
}

func NewKitHandler(db *gorm.DB) *KitHandler {
	return &KitHandler{DB: db}
}

// CreateKit: "Coffee Set" = [Burner, Gas, Mug]
func (h *KitHandler) CreateKit(w http.ResponseWriter, r *http.Request) {
	var kit domain.Kit
	if err := json.NewDecoder(r.Body).Decode(&kit); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if result := h.DB.Create(&kit); result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(kit)
}

func (h *KitHandler) ListKits(w http.ResponseWriter, r *http.Request) {
	var kits []domain.Kit
	if result := h.DB.Find(&kits); result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"kits": kits})
}
