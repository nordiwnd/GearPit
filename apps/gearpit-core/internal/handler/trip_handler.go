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

type TripRequest struct {
	Name          string  `json:"name"`
	Description   string  `json:"description"`
	Location      string  `json:"location"`
	StartDate     string  `json:"startDate"`
	EndDate       string  `json:"endDate"`
	UserProfileID *string `json:"userProfileId"` // 追加
}

// 既存の一括追加用（数量指定なし）
type TripItemsRequest struct {
	ItemIDs []string `json:"itemIds"`
}

// 新規: 単体追加・数量更新用
type TripItemUpsertRequest struct {
	ItemID   string `json:"itemId"`
	Quantity int    `json:"quantity"`
}

func (h *TripHandler) CreateTrip(w http.ResponseWriter, r *http.Request) {
	var req TripRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	start, _ := time.Parse("2006-01-02", req.StartDate)
	end, _ := time.Parse("2006-01-02", req.EndDate)

	trip, err := h.service.CreateTrip(r.Context(), req.Name, req.Description, req.Location, start, end, req.UserProfileID)
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

// 既存: 一括追加/削除 (互換性維持)
func (h *TripHandler) HandleTripItems(w http.ResponseWriter, r *http.Request) {
	// Path: /api/v1/trips/{id}/items
	parts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/v1/trips/"), "/")
	tripID := parts[0]

	switch r.Method {
	case http.MethodPut:
		// 数量指定更新 (Upsert)
		var req TripItemUpsertRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid payload", http.StatusBadRequest)
			return
		}
		if req.Quantity < 1 {
			req.Quantity = 1
		}
		if err := h.service.AddOrUpdateItem(r.Context(), tripID, req.ItemID, req.Quantity); err != nil {
			http.Error(w, "Failed to update item quantity", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)

	case http.MethodPost:
		// 一括追加 (Quantity=1)
		var req TripItemsRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid payload", http.StatusBadRequest)
			return
		}
		for _, itemID := range req.ItemIDs {
			// 一括追加時は個数1で登録
			_ = h.service.AddOrUpdateItem(r.Context(), tripID, itemID, 1)
		}
		w.WriteHeader(http.StatusOK)

	case http.MethodDelete:
		// 一括削除
		var req TripItemsRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid payload", http.StatusBadRequest)
			return
		}
		for _, itemID := range req.ItemIDs {
			if err := h.service.RemoveItemFromTrip(r.Context(), tripID, itemID); err != nil {
				http.Error(w, "Failed to remove items", http.StatusInternalServerError)
				return
			}
		}
		w.WriteHeader(http.StatusOK)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
