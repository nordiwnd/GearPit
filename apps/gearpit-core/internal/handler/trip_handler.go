package handler

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
)

type TripHandler struct {
	service domain.TripService
}

func NewTripHandler(s domain.TripService) *TripHandler {
	return &TripHandler{service: s}
}

// Request/Response Structs
type TripRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Location    string `json:"location"`
	StartDate   string `json:"startDate"` // YYYY-MM-DD
	EndDate     string `json:"endDate"`   // YYYY-MM-DD
}

type TripItemsRequest struct {
	ItemIDs []string `json:"itemIds"`
}

func (h *TripHandler) CreateTrip(w http.ResponseWriter, r *http.Request) {
	var req TripRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	start, _ := time.Parse("2006-01-02", req.StartDate)
	end, _ := time.Parse("2006-01-02", req.EndDate)

	trip, err := h.service.CreateTrip(r.Context(), req.Name, req.Description, req.Location, start, end)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(trip)
}

func (h *TripHandler) ListTrips(w http.ResponseWriter, r *http.Request) {
	trips, err := h.service.ListTrips(r.Context())
	if err != nil {
		http.Error(w, "Failed to list trips", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(trips)
}

func (h *TripHandler) GetTrip(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/trips/")
	// URLが /api/v1/trips/{id}/items のような場合に対応するためパスをパース
	parts := strings.Split(id, "/")
	if len(parts) > 0 {
		id = parts[0]
	}

	trip, err := h.service.GetTrip(r.Context(), id)
	if err != nil {
		http.Error(w, "Trip not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(trip)
}

func (h *TripHandler) DeleteTrip(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/trips/")
	if err := h.service.DeleteTrip(r.Context(), id); err != nil {
		http.Error(w, "Failed to delete trip", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *TripHandler) HandleTripItems(w http.ResponseWriter, r *http.Request) {
	// Path: /api/v1/trips/{id}/items
	parts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/v1/trips/"), "/")
	if len(parts) < 2 || parts[1] != "items" {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}
	tripID := parts[0]

	var req TripItemsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	var err error
	if r.Method == http.MethodPost {
		err = h.service.AddItemsToTrip(r.Context(), tripID, req.ItemIDs)
	} else if r.Method == http.MethodDelete {
		err = h.service.RemoveItemsFromTrip(r.Context(), tripID, req.ItemIDs)
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if err != nil {
		http.Error(w, "Failed to update trip items", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}
