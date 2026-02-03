package domain

import "context"

// GearFilter defines search criteria for items.
type GearFilter struct {
	Tag      string
	Category string
	Brand    string
}

type GearRepository interface {
	Create(ctx context.Context, item *Item) error
	GetByID(ctx context.Context, id string) (*Item, error)
	// 修正: フィルタリング検索に対応
	Search(ctx context.Context, filter GearFilter) ([]Item, error)
	// 追加: 更新と削除
	Update(ctx context.Context, item *Item) error
	Delete(ctx context.Context, id string) error
}

type GearService interface {
	CreateItem(ctx context.Context, name, description string, weight int, tags []string, properties map[string]any) (*Item, error)
	GetItem(ctx context.Context, id string) (*Item, error)
	// 修正: フィルタリング検索に対応
	SearchItems(ctx context.Context, filter GearFilter) ([]Item, error)
	// 追加: 更新と削除
	UpdateItem(ctx context.Context, id string, name, description string, weight int, tags []string, properties map[string]any) (*Item, error)
	DeleteItem(ctx context.Context, id string) error
}
