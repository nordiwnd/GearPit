package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
)

type GearHandler struct {
	service  domain.GearService
	validate *validator.Validate
}

func NewGearHandler(s domain.GearService) *GearHandler {
	return &GearHandler{
		service:  s,
		validate: validator.New(),
	}
}

// リクエスト用の構造体を定義
type CreateItemRequest struct {
	Name                string `json:"name" validate:"required"`
	Description         string `json:"description"`
	Manufacturer        string `json:"manufacturer"`
	WeightGram          int    `json:"weightGram" validate:"min=0"`
	WeightType          string `json:"weightType" validate:"oneof=base consumable worn long accessory"`
	Category            string `json:"category"`
	Brand               string `json:"brand"`
	UsageCount          int    `json:"usageCount" validate:"min=0"`
	MaintenanceInterval int    `json:"maintenanceInterval" validate:"min=0"`
}

func (h *GearHandler) CreateItem(w http.ResponseWriter, r *http.Request) {
	var req CreateItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	if err := h.validate.Struct(req); err != nil {
		http.Error(w, "Validation failed: "+err.Error(), http.StatusBadRequest)
		return
	}

	params := domain.CreateGearParams{
		Name:                req.Name,
		Description:         req.Description,
		Manufacturer:        req.Manufacturer,
		WeightGram:          req.WeightGram,
		WeightType:          domain.WeightType(req.WeightType),
		Category:            req.Category,
		Brand:               req.Brand,
		UsageCount:          req.UsageCount,
		MaintenanceInterval: req.MaintenanceInterval,
	}

	item, err := h.service.CreateItem(r.Context(), params)
	if err != nil {
		slog.Error("Failed to create item", "error", err)
		http.Error(w, "Failed to create item", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(item); err != nil {
		slog.Error("Failed to encode item", "error", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func (h *GearHandler) SearchItems(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	items, err := h.service.SearchItems(r.Context(), query)
	if err != nil {
		slog.Error("Failed to search items", "error", err)
		http.Error(w, "Failed to search items", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(items); err != nil {
		slog.Error("Failed to encode items", "error", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func (h *GearHandler) UpdateItem(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/gears/")
	var req CreateItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	if err := h.validate.Struct(req); err != nil {
		http.Error(w, "Validation failed: "+err.Error(), http.StatusBadRequest)
		return
	}

	params := domain.UpdateGearParams{
		Name:                req.Name,
		Description:         req.Description,
		Manufacturer:        req.Manufacturer,
		WeightGram:          req.WeightGram,
		WeightType:          domain.WeightType(req.WeightType),
		Category:            req.Category,
		Brand:               req.Brand,
		UsageCount:          req.UsageCount,
		MaintenanceInterval: req.MaintenanceInterval,
	}

	item, err := h.service.UpdateItem(r.Context(), id, params)

	if err != nil {
		slog.Error("Failed to update item", "error", err)
		http.Error(w, "Failed to update item", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(item); err != nil {
		slog.Error("Failed to encode item", "error", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
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
