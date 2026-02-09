package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strings"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
)

type GearHandler struct {
	service domain.GearService
}

func NewGearHandler(s domain.GearService) *GearHandler {
	return &GearHandler{service: s}
}

// リクエスト用の構造体を定義
type CreateItemRequest struct {
	Name         string `json:"name"`
	Description  string `json:"description"`
	Manufacturer string `json:"manufacturer"`
	WeightGram   int    `json:"weightGram"`
	WeightType   string `json:"weightType"`
	Category     string `json:"category"`
	Brand        string `json:"brand"`
}

func (h *GearHandler) CreateItem(w http.ResponseWriter, r *http.Request) {
	var req CreateItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	// Serviceの新しい引数に合わせて呼び出し
	item, err := h.service.CreateItem(r.Context(), req.Name, req.Description, req.Manufacturer, req.WeightGram, domain.WeightType(req.WeightType), req.Category, req.Brand)
	if err != nil {
		slog.Error("Failed to create item", "error", err)
		http.Error(w, "Failed to create item", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}

func (h *GearHandler) SearchItems(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	// GearFilterを使わず、単純なクエリ文字列検索に変更
	items, err := h.service.SearchItems(r.Context(), query)
	if err != nil {
		slog.Error("Failed to search items", "error", err)
		http.Error(w, "Failed to search items", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

func (h *GearHandler) UpdateItem(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/gears/")
	var req CreateItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	// Serviceの新しい引数に合わせて呼び出し
	item, err := h.service.UpdateItem(r.Context(), id, req.Name, req.Description, req.Manufacturer, req.WeightGram, domain.WeightType(req.WeightType), req.Category, req.Brand)

	if err != nil {
		slog.Error("Failed to update item", "error", err)
		http.Error(w, "Failed to update item", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}

func (h *GearHandler) DeleteItem(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/gears/")
	if err := h.service.DeleteItem(r.Context(), id); err != nil {
		slog.Error("Failed to delete item", "error", err)
		http.Error(w, "Failed to delete item", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
