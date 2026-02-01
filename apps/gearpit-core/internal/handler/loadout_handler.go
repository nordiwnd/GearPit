// apps/gearpit-core/internal/handler/loadout_handler.go
package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"gorm.io/gorm"
)

type LoadoutHandler struct {
	DB *gorm.DB
}

func NewLoadoutHandler(db *gorm.DB) *LoadoutHandler {
	return &LoadoutHandler{DB: db}
}

// CreateLoadout: 作成
func (h *LoadoutHandler) CreateLoadout(w http.ResponseWriter, r *http.Request) {
	var loadout domain.Loadout
	if err := json.NewDecoder(r.Body).Decode(&loadout); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if loadout.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}

	if err := h.DB.Create(&loadout).Error; err != nil {
		http.Error(w, "Failed to create loadout", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(loadout)
}

// ListLoadouts: 一覧取得
func (h *LoadoutHandler) ListLoadouts(w http.ResponseWriter, r *http.Request) {
	var loadouts []domain.Loadout
	// 新しい順に取得
	if err := h.DB.Order("created_at DESC").Find(&loadouts).Error; err != nil {
		http.Error(w, "Failed to fetch loadouts", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(loadouts)
}

// GetLoadout: 詳細取得
func (h *LoadoutHandler) GetLoadout(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		id = strings.TrimPrefix(r.URL.Path, "/loadouts/")
	}

	var loadout domain.Loadout
	if err := h.DB.First(&loadout, "id = ?", id).Error; err != nil {
		http.Error(w, "Loadout not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(loadout)
}

// UpdateLoadout: 更新
func (h *LoadoutHandler) UpdateLoadout(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		id = strings.TrimPrefix(r.URL.Path, "/loadouts/")
	}

	var existing domain.Loadout
	if err := h.DB.First(&existing, "id = ?", id).Error; err != nil {
		http.Error(w, "Loadout not found", http.StatusNotFound)
		return
	}

	var updateData domain.Loadout
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// 更新処理 (Name, Items, TotalWeight)
	existing.Name = updateData.Name
	existing.Items = updateData.Items
	existing.TotalWeight = updateData.TotalWeight

	if err := h.DB.Save(&existing).Error; err != nil {
		http.Error(w, "Failed to update loadout", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(existing)
}

// DeleteLoadout: 削除
func (h *LoadoutHandler) DeleteLoadout(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		id = strings.TrimPrefix(r.URL.Path, "/loadouts/")
	}

	if err := h.DB.Delete(&domain.Loadout{}, "id = ?", id).Error; err != nil {
		http.Error(w, "Failed to delete loadout", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
