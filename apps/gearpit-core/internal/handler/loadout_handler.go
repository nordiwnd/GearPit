package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
)

type LoadoutHandler struct {
	service domain.LoadoutService
}

func NewLoadoutHandler(s domain.LoadoutService) *LoadoutHandler {
	return &LoadoutHandler{service: s}
}

type LoadoutRequest struct {
	Name         string   `json:"name"`
	ActivityType string   `json:"activityType"`
	KitIDs       []string `json:"kitIds"`
	ItemIDs      []string `json:"itemIds"`
}

// LoadoutResponse extends the domain model to include calculated data like total weight
type LoadoutResponse struct {
	*domain.Loadout
	TotalWeightGram int `json:"totalWeightGram"`
}

func (h *LoadoutHandler) CreateLoadout(w http.ResponseWriter, r *http.Request) {
	var req LoadoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	loadout, err := h.service.CreateLoadout(r.Context(), req.Name, req.ActivityType, req.KitIDs, req.ItemIDs)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(toLoadoutResponse(loadout))
}

func (h *LoadoutHandler) ListLoadouts(w http.ResponseWriter, r *http.Request) {
	loadouts, err := h.service.ListLoadouts(r.Context())
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	responses := make([]LoadoutResponse, len(loadouts))
	for i := range loadouts {
		responses[i] = toLoadoutResponse(&loadouts[i])
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responses)
}

func (h *LoadoutHandler) GetLoadout(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/loadouts/")

	loadout, err := h.service.GetLoadout(r.Context(), id)
	if err != nil {
		http.Error(w, "Internal server error or Not found", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(toLoadoutResponse(loadout))
}

// toLoadoutResponse calculates the total weight dynamically.
func toLoadoutResponse(l *domain.Loadout) LoadoutResponse {
	totalWeight := 0
	// 1. Add weights of direct items
	for _, item := range l.Items {
		totalWeight += item.WeightGram
	}
	// 2. Add weights of items inside kits
	for _, kit := range l.Kits {
		for _, item := range kit.Items {
			totalWeight += item.WeightGram
		}
	}

	return LoadoutResponse{
		Loadout:         l,
		TotalWeightGram: totalWeight,
	}
}
