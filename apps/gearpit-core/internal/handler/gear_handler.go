package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"gorm.io/gorm"
)

// GearHandler handles HTTP requests for Gear management.
type GearHandler struct {
	service domain.GearService
}

// NewGearHandler creates a handler injected with GearService.
func NewGearHandler(s domain.GearService) *GearHandler {
	return &GearHandler{service: s}
}

// CreateRequest defines the expected JSON payload for creating an item.
type CreateRequest struct {
	Name        string         `json:"name"`
	Description string         `json:"description"`
	WeightGram  int            `json:"weightGram"`
	Tags        []string       `json:"tags"`
	Properties  map[string]any `json:"properties"`
}

func (h *GearHandler) CreateItem(w http.ResponseWriter, r *http.Request) {
	var req CreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if req.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
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

func (h *GearHandler) ListItems(w http.ResponseWriter, r *http.Request) {
	items, err := h.service.ListItems(r.Context())
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

func (h *GearHandler) GetItem(w http.ResponseWriter, r *http.Request) {
	// Assume routing logic (e.g. chi or gorilla/mux) extracts ID from URL.
	// For standard net/http without router, this is simplified.
	id := r.URL.Path[len("/api/v1/gears/"):]

	item, err := h.service.GetItem(r.Context(), id)
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
