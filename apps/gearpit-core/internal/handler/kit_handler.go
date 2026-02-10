package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
)

type KitHandler struct {
	service domain.KitService
}

func NewKitHandler(s domain.KitService) *KitHandler {
	return &KitHandler{service: s}
}

type KitRequest struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	ItemIDs     []string `json:"itemIds"`
}

func (h *KitHandler) CreateKit(w http.ResponseWriter, r *http.Request) {
	var req KitRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	// 1. Kitを作成 (ItemIDsは渡さない)
	kit, err := h.service.CreateKit(r.Context(), req.Name, req.Description)
	if err != nil {
		http.Error(w, "Failed to create kit", http.StatusInternalServerError)
		return
	}

	// 2. アイテムがある場合は追加 (必要であれば)
	if len(req.ItemIDs) > 0 {
		for _, itemID := range req.ItemIDs {
			_ = h.service.AddItemToKit(r.Context(), kit.ID, itemID)
		}
		// 再取得してアイテムを含める
		kit, _ = h.service.GetKit(r.Context(), kit.ID)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(kit); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func (h *KitHandler) ListKits(w http.ResponseWriter, r *http.Request) {
	kits, err := h.service.ListKits(r.Context())
	if err != nil {
		http.Error(w, "Failed to list kits", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(kits)
}

func (h *KitHandler) GetKit(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/kits/")
	kit, err := h.service.GetKit(r.Context(), id)
	if err != nil {
		http.Error(w, "Kit not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(kit)
}
