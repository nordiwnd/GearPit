package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"gorm.io/gorm"
)

type GearHandler struct {
	DB *gorm.DB
}

func NewGearHandler(db *gorm.DB) *GearHandler {
	return &GearHandler{DB: db}
}

// CreateItem: 新しいギアを登録
func (h *GearHandler) CreateItem(w http.ResponseWriter, r *http.Request) {
	var item domain.Item
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(w, "Invalid input format", http.StatusBadRequest)
		return
	}

	// バリデーション (簡易)
	if item.Name == "" || item.Category == "" {
		http.Error(w, "Name and Category are required", http.StatusBadRequest)
		return
	}

	if err := h.DB.Create(&item).Error; err != nil {
		http.Error(w, fmt.Sprintf("Failed to create item: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(item)
}

// ListItems: 検索と一覧取得
// Query Params:
// - category: カテゴリ完全一致 (例: "ski")
// - q: 名前またはブランドの部分一致
// - p_*: JSONBプロパティ検索 (例: "p_sub_category=boots")
func (h *GearHandler) ListItems(w http.ResponseWriter, r *http.Request) {
	var items []domain.Item
	query := h.DB.Model(&domain.Item{})

	// 1. 標準カラムのフィルタ
	qName := r.URL.Query().Get("q")
	if qName != "" {
		like := "%" + qName + "%"
		query = query.Where("name ILIKE ? OR brand ILIKE ?", like, like)
	}

	category := r.URL.Query().Get("category")
	if category != "" {
		query = query.Where("category = ?", category)
	}

	// 2. JSONBプロパティの動的フィルタ (p_ 接頭辞)
	// 例: ?p_sub_category=boots -> properties ->> 'sub_category' = 'boots'
	for key, values := range r.URL.Query() {
		if strings.HasPrefix(key, "p_") && len(values) > 0 {
			jsonKey := strings.TrimPrefix(key, "p_")
			val := values[0]

			// SQLインジェクション対策: keyは固定文字列に近いが、念のためプレースホルダは使えない箇所(->>)なので注意が必要
			// ここではGORMのWhere引数で値をバインドすることで安全性を確保
			// クエリ: properties ->> 'jsonKey' = 'val'
			condition := fmt.Sprintf("properties ->> '%s' = ?", jsonKey)
			query = query.Where(condition, val)
		}
	}

	// ソート: 新しい順
	query = query.Order("created_at DESC")

	if err := query.Find(&items).Error; err != nil {
		http.Error(w, "Failed to fetch items", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

// GetItem: 詳細取得
func (h *GearHandler) GetItem(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id") // Go 1.22+ routing
	if id == "" {
		// 互換性: chiやgorillaを使わず標準muxの場合、URL解析が必要な場合があるが
		// 今回はGo 1.22の `ServeMux` パターンを想定
		id = strings.TrimPrefix(r.URL.Path, "/items/")
	}

	var item domain.Item
	if err := h.DB.First(&item, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Item not found", http.StatusNotFound)
		} else {
			http.Error(w, "Database error", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}

// UpdateItem: 更新 (PUT/PATCH)
func (h *GearHandler) UpdateItem(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		id = strings.TrimPrefix(r.URL.Path, "/items/")
	}

	var existing domain.Item
	if err := h.DB.First(&existing, "id = ?", id).Error; err != nil {
		http.Error(w, "Item not found", http.StatusNotFound)
		return
	}

	// リクエストボディをパース
	var updateData domain.Item
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// 更新処理
	// 注意: Map(Properties)の更新は、GORMのUpdatesでは「全置換」または「マージ」の挙動に注意が必要。
	// ここではシンプルに、指定されたフィールドを上書きする。
	existing.Name = updateData.Name
	existing.Brand = updateData.Brand
	existing.WeightGram = updateData.WeightGram
	existing.Category = updateData.Category
	existing.Properties = updateData.Properties // フロントエンドは常に全プロパティを送る前提とする
	existing.Tags = updateData.Tags

	if err := h.DB.Save(&existing).Error; err != nil {
		http.Error(w, "Failed to update item", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(existing)
}

// DeleteItem: 削除
func (h *GearHandler) DeleteItem(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		id = strings.TrimPrefix(r.URL.Path, "/items/")
	}

	if err := h.DB.Delete(&domain.Item{}, "id = ?", id).Error; err != nil {
		http.Error(w, "Failed to delete item", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
