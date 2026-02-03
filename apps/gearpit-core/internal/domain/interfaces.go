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

// --- Kit Interfaces ---

type KitRepository interface {
	Create(ctx context.Context, kit *Kit) error
	GetByID(ctx context.Context, id string) (*Kit, error)
	ListAll(ctx context.Context) ([]Kit, error)
	// Association operations
	AddItemsToKit(ctx context.Context, kitID string, itemIDs []string) error
}

type KitService interface {
	CreateKit(ctx context.Context, name, description string, itemIDs []string) (*Kit, error)
	GetKit(ctx context.Context, id string) (*Kit, error)
	ListKits(ctx context.Context) ([]Kit, error)
}

// --- Loadout Interfaces ---

type LoadoutRepository interface {
	Create(ctx context.Context, loadout *Loadout) error
	GetByID(ctx context.Context, id string) (*Loadout, error)
	ListAll(ctx context.Context) ([]Loadout, error)
	SetAssociations(ctx context.Context, loadoutID string, kitIDs, itemIDs []string) error
	Update(ctx context.Context, loadout *Loadout) error
	Delete(ctx context.Context, id string) error
}

type LoadoutService interface {
	CreateLoadout(ctx context.Context, name, activityType string, kitIDs, itemIDs []string) (*Loadout, error)
	GetLoadout(ctx context.Context, id string) (*Loadout, error)
	ListLoadouts(ctx context.Context) ([]Loadout, error)
	UpdateLoadout(ctx context.Context, id string, name, activityType string, kitIDs, itemIDs []string) (*Loadout, error)
	DeleteLoadout(ctx context.Context, id string) error
}

// --- MaintenanceLog Interfaces ---

type MaintenanceLogRepository interface {
	Create(ctx context.Context, log *MaintenanceLog) error
	GetByID(ctx context.Context, id string) (*MaintenanceLog, error)
	GetByItemID(ctx context.Context, itemID string) ([]MaintenanceLog, error)
	Update(ctx context.Context, log *MaintenanceLog) error
	Delete(ctx context.Context, id string) error
}

type MaintenanceLogService interface {
	AddLog(ctx context.Context, itemID string, logDateStr, actionTaken string, cost int) (*MaintenanceLog, error)
	GetLogsForItem(ctx context.Context, itemID string) ([]MaintenanceLog, error)
	UpdateLog(ctx context.Context, id, logDateStr, actionTaken string, cost int) (*MaintenanceLog, error)
	DeleteLog(ctx context.Context, id string) error
}
