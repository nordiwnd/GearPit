package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"gorm.io/gorm"
)

type GearHandler struct {
	service domain.GearService
}

func NewGearHandler(s domain.GearService) *GearHandler {
	return &GearHandler{service: s}
}

type GearRequest struct {
	Name        string         `json:"name"`
	Description string         `json:"description"`
	WeightGram  int            `json:"weightGram"`
	Tags        []string       `json:"tags"`
	Properties  map[string]any `json:"properties"`
}

func (h *GearHandler) CreateItem(w http.ResponseWriter, r *http.Request) {
	var req GearRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	item, err := h.service.CreateItem(r.Context(), req.Name, req.Description, req.WeightGram, req.Tags, req.Properties)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(item)
}

func (h *GearHandler) SearchItems(w http.ResponseWriter, r *http.Request) {
	filter := domain.GearFilter{
		Tag:      r.URL.Query().Get("tag"),
		Category: r.URL.Query().Get("category"),
		Brand:    r.URL.Query().Get("brand"),
	}

	items, err := h.service.SearchItems(r.Context(), filter)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

func (h *GearHandler) UpdateItem(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/gears/")
	var req GearRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	item, err := h.service.UpdateItem(r.Context(), id, req.Name, req.Description, req.WeightGram, req.Tags, req.Properties)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			http.Error(w, "Item not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}

func (h *GearHandler) DeleteItem(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/gears/")

	if err := h.service.DeleteItem(r.Context(), id); err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
