package domain

import "context"

// GearRepository defines data access rules for Items.
type GearRepository interface {
	Create(ctx context.Context, item *Item) error
	GetByID(ctx context.Context, id string) (*Item, error)
	ListAll(ctx context.Context) ([]Item, error)
}

// GearService defines the business logic operations for Items.
type GearService interface {
	CreateItem(ctx context.Context, name, description string, weight int, tags []string, properties map[string]any) (*Item, error)
	GetItem(ctx context.Context, id string) (*Item, error)
	ListItems(ctx context.Context) ([]Item, error)
}
