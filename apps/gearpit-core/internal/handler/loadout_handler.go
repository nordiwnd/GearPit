package handler

import (
	"net/http"
)

// LoadoutHandler handles HTTP requests for Loadout management.
type LoadoutHandler struct {
	// TODO: Phase 2.2で domain.LoadoutService をここに注入します
}

// NewLoadoutHandler creates a new LoadoutHandler.
func NewLoadoutHandler() *LoadoutHandler {
	return &LoadoutHandler{}
}

// ListLoadouts handles GET /api/v1/loadouts
func (h *LoadoutHandler) ListLoadouts(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "Loadout feature is not implemented yet in this phase", http.StatusNotImplemented)
}

// CreateLoadout handles POST /api/v1/loadouts
func (h *LoadoutHandler) CreateLoadout(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "Loadout feature is not implemented yet in this phase", http.StatusNotImplemented)
}

// GetLoadout handles GET /api/v1/loadouts/{id}
func (h *LoadoutHandler) GetLoadout(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "Loadout feature is not implemented yet in this phase", http.StatusNotImplemented)
}
