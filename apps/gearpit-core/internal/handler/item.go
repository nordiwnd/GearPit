package handler

import (
	"encoding/json"
	"net/http"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/model"
	"gorm.io/gorm"
)

type ItemHandler struct {
	db *gorm.DB
}

func NewItemHandler(db *gorm.DB) *ItemHandler {
	return &ItemHandler{db: db}
}

// CreateItem handles POST /items
func (h *ItemHandler) CreateItem(w http.ResponseWriter, r *http.Request) {
	var item model.Item
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// 初期バリデーションやデフォルト値設定はここで行う
	// 例: 購入日が空なら現在時刻を入れるなど

	if err := h.db.Create(&item).Error; err != nil {
		http.Error(w, "Failed to create item", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(item)
}

// ListItems handles GET /items
func (h *ItemHandler) ListItems(w http.ResponseWriter, r *http.Request) {
	var items []model.Item
	// カテゴリフィルタやTags検索は後ほど実装
	// 今は全件取得
	if err := h.db.Find(&items).Error; err != nil {
		http.Error(w, "Failed to fetch items", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}
