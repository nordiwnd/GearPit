package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
)

type MaintenanceHandler struct {
	service domain.MaintenanceLogService
}

func NewMaintenanceHandler(s domain.MaintenanceLogService) *MaintenanceHandler {
	return &MaintenanceHandler{service: s}
}

type MaintenanceRequest struct {
	ItemID      string `json:"itemId"`
	LogDate     string `json:"logDate"` // Format: YYYY-MM-DD
	ActionTaken string `json:"actionTaken"`
	Cost        int    `json:"cost"`
}

func (h *MaintenanceHandler) AddLog(w http.ResponseWriter, r *http.Request) {
	var req MaintenanceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	log, err := h.service.AddLog(r.Context(), req.ItemID, req.LogDate, req.ActionTaken, req.Cost)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(log)
}

func (h *MaintenanceHandler) GetItemLogs(w http.ResponseWriter, r *http.Request) {
	// URL: /api/v1/maintenance/item/{id}
	itemID := strings.TrimPrefix(r.URL.Path, "/api/v1/maintenance/item/")

	logs, err := h.service.GetLogsForItem(r.Context(), itemID)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(logs)
}

func (h *MaintenanceHandler) DeleteLog(w http.ResponseWriter, r *http.Request) {
	// URL: /api/v1/maintenance/{id}
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/maintenance/")

	if err := h.service.DeleteLog(r.Context(), id); err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
