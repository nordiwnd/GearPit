package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"gorm.io/gorm"
)

type KitHandler struct {
	DB *gorm.DB
}

func NewKitHandler(db *gorm.DB) *KitHandler {
	return &KitHandler{DB: db}
}

func (h *KitHandler) CreateKit(w http.ResponseWriter, r *http.Request) {
	var kit domain.Kit
	if err := json.NewDecoder(r.Body).Decode(&kit); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if kit.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}

	// 追加: ItemIDsがnilなら空配列で初期化
	if kit.ItemIDs == nil {
		kit.ItemIDs = []string{}
	}

	if err := h.DB.Create(&kit).Error; err != nil {
		// エラーログを出力して原因を特定しやすくする
		log.Printf("Failed to create kit: %v", err)
		http.Error(w, "Failed to create kit", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(kit)
}

func (h *KitHandler) ListKits(w http.ResponseWriter, r *http.Request) {
	var kits []domain.Kit
	if err := h.DB.Order("created_at DESC").Find(&kits).Error; err != nil {
		http.Error(w, "Failed to fetch kits", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(kits)
}

func (h *KitHandler) GetKit(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		id = strings.TrimPrefix(r.URL.Path, "/kits/")
	}

	var kit domain.Kit
	if err := h.DB.First(&kit, "id = ?", id).Error; err != nil {
		http.Error(w, "Kit not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(kit)
}

func (h *KitHandler) UpdateKit(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		id = strings.TrimPrefix(r.URL.Path, "/kits/")
	}

	var existing domain.Kit
	if err := h.DB.First(&existing, "id = ?", id).Error; err != nil {
		http.Error(w, "Kit not found", http.StatusNotFound)
		return
	}

	var updateData domain.Kit
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	existing.Name = updateData.Name
	existing.ItemIDs = updateData.ItemIDs // 全置換

	if err := h.DB.Save(&existing).Error; err != nil {
		http.Error(w, "Failed to update kit", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(existing)
}

func (h *KitHandler) DeleteKit(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		id = strings.TrimPrefix(r.URL.Path, "/kits/")
	}

	if err := h.DB.Delete(&domain.Kit{}, "id = ?", id).Error; err != nil {
		http.Error(w, "Failed to delete kit", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
