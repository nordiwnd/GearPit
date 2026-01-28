// apps/gearpit-core/internal/handler/loadout_handler.go
package handler

import (
	"encoding/json"
	"net/http"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"gorm.io/gorm"
)

type LoadoutHandler struct {
	DB *gorm.DB
}

func NewLoadoutHandler(db *gorm.DB) *LoadoutHandler {
	return &LoadoutHandler{DB: db}
}

type CreateLoadoutRequest struct {
	Name   string               `json:"name"`
	Items  []domain.LoadoutItem `json:"items"`
	KitIDs []string             `json:"kitIds"`
}

func (h *LoadoutHandler) CreateLoadout(w http.ResponseWriter, r *http.Request) {
	var req CreateLoadoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	finalItems := req.Items

	// Expand Kits
	if len(req.KitIDs) > 0 {
		var kits []domain.Kit
		if err := h.DB.Where("id IN ?", req.KitIDs).Find(&kits).Error; err == nil {
			for _, kit := range kits {
				for _, itemId := range kit.ItemIDs {
					finalItems = append(finalItems, domain.LoadoutItem{
						ItemID:    itemId,
						Quantity:  1,
						IsChecked: false,
					})
				}
			}
		}
	}

	// Calculate Total Weight
	totalWeight := 0
	for _, loadoutItem := range finalItems {
		var item domain.Item
		if err := h.DB.First(&item, "id = ?", loadoutItem.ItemID).Error; err == nil {
			qty := loadoutItem.Quantity
			if qty <= 0 {
				qty = 1
			}
			totalWeight += item.WeightGram * qty
		}
	}

	// Build & Save
	loadout := domain.Loadout{
		Name:        req.Name,
		Items:       finalItems,
		TotalWeight: totalWeight,
	}

	if result := h.DB.Create(&loadout); result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(loadout)
}

// ListLoadouts
func (h *LoadoutHandler) ListLoadouts(w http.ResponseWriter, r *http.Request) {
	var loadouts []domain.Loadout
	if result := h.DB.Find(&loadouts); result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"loadouts": loadouts})
}
