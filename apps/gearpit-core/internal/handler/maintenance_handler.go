package handler

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
)

type MaintenanceHandler struct {
	service domain.MaintenanceService // 修正: MaintenanceLogService -> MaintenanceService
}

// 修正: 引数も MaintenanceService に変更
func NewMaintenanceHandler(s domain.MaintenanceService) *MaintenanceHandler {
	return &MaintenanceHandler{service: s}
}

type MaintenanceRequest struct {
	ItemID      string `json:"itemId"`
	Type        string `json:"type"`
	Description string `json:"description"`
	Cost        int    `json:"cost"`
	Date        string `json:"date"` // YYYY-MM-DD
}

func (h *MaintenanceHandler) AddLog(w http.ResponseWriter, r *http.Request) {
	var req MaintenanceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	date, _ := time.Parse("2006-01-02", req.Date)
	if date.IsZero() {
		date = time.Now()
	}

	log, err := h.service.AddLog(r.Context(), req.ItemID, req.Type, req.Description, req.Cost, date)
	if err != nil {
		http.Error(w, "Failed to add maintenance log", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(log)
}

func (h *MaintenanceHandler) GetItemLogs(w http.ResponseWriter, r *http.Request) {
	itemID := strings.TrimPrefix(r.URL.Path, "/api/v1/maintenance/item/")
	logs, err := h.service.GetItemLogs(r.Context(), itemID)
	if err != nil {
		http.Error(w, "Failed to get logs", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(logs)
}

func (h *MaintenanceHandler) UpdateLog(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/maintenance/")
	var req MaintenanceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}
	date, _ := time.Parse("2006-01-02", req.Date)

	log, err := h.service.UpdateLog(r.Context(), id, req.Type, req.Description, req.Cost, date)
	if err != nil {
		http.Error(w, "Failed to update log", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(log)
}

func (h *MaintenanceHandler) DeleteLog(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/maintenance/")
	if err := h.service.DeleteLog(r.Context(), id); err != nil {
		http.Error(w, "Failed to delete log", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
