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
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	kit, err := h.service.CreateKit(r.Context(), req.Name, req.Description, req.ItemIDs)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(kit)
}

func (h *KitHandler) ListKits(w http.ResponseWriter, r *http.Request) {
	kits, err := h.service.ListKits(r.Context())
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(kits)
}

func (h *KitHandler) GetKit(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/kits/")

	kit, err := h.service.GetKit(r.Context(), id)
	if err != nil {
		http.Error(w, "Internal server error or Not found", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(kit)
}
