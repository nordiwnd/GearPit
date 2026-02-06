package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
)

type ProfileHandler struct {
	service domain.ProfileService
}

func NewProfileHandler(s domain.ProfileService) *ProfileHandler {
	return &ProfileHandler{service: s}
}

type ProfileRequest struct {
	Name     string  `json:"name"`
	HeightCm float64 `json:"heightCm"`
	WeightKg float64 `json:"weightKg"`
	Age      int     `json:"age"`
	Gender   string  `json:"gender"`
}

func (h *ProfileHandler) ListProfiles(w http.ResponseWriter, r *http.Request) {
	profiles, err := h.service.ListProfiles(r.Context())
	if err != nil {
		http.Error(w, "Failed to list profiles", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profiles)
}

func (h *ProfileHandler) CreateProfile(w http.ResponseWriter, r *http.Request) {
	var req ProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	profile, err := h.service.CreateProfile(r.Context(), req.Name, req.HeightCm, req.WeightKg, req.Age, req.Gender)
	if err != nil {
		http.Error(w, "Failed to create profile", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}

func (h *ProfileHandler) HandleProfile(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/profiles/")

	switch r.Method {
	case http.MethodGet:
		profile, err := h.service.GetProfile(r.Context(), id)
		if err != nil {
			http.Error(w, "Profile not found", http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(profile)

	case http.MethodPut:
		var req ProfileRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid payload", http.StatusBadRequest)
			return
		}
		profile, err := h.service.UpdateProfile(r.Context(), id, req.Name, req.HeightCm, req.WeightKg, req.Age, req.Gender)
		if err != nil {
			http.Error(w, "Failed to update profile", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(profile)

	case http.MethodDelete:
		if err := h.service.DeleteProfile(r.Context(), id); err != nil {
			http.Error(w, "Failed to delete profile", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)

	case http.MethodOptions:
		w.WriteHeader(http.StatusOK)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
