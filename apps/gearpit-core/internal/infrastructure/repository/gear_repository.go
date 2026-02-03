package repository

import (
	"context"
	"fmt"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"gorm.io/gorm"
)

type gearRepository struct {
	db *gorm.DB
}

func NewGearRepository(db *gorm.DB) domain.GearRepository {
	return &gearRepository{db: db}
}

func (r *gearRepository) Create(ctx context.Context, item *domain.Item) error {
	if err := r.db.WithContext(ctx).Create(item).Error; err != nil {
		return fmt.Errorf("failed to insert item into db: %w", err)
	}
	return nil
}

func (r *gearRepository) GetByID(ctx context.Context, id string) (*domain.Item, error) {
	var item domain.Item
	if err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("item not found (id: %s): %w", id, err)
		}
		return nil, fmt.Errorf("failed to fetch item by id: %w", err)
	}
	return &item, nil
}

// Search implements Postgres JSONB and Array querying.
func (r *gearRepository) Search(ctx context.Context, filter domain.GearFilter) ([]domain.Item, error) {
	var items []domain.Item
	query := r.db.WithContext(ctx)

	// Postgres Array query: tags @> '{"tag_name"}'
	if filter.Tag != "" {
		query = query.Where("tags @> ARRAY[?]::text[]", filter.Tag)
	}
	// Postgres JSONB query: properties @> '{"category": "tent"}'
	if filter.Category != "" {
		query = query.Where("properties @> ?", fmt.Sprintf(`{"category": "%s"}`, filter.Category))
	}
	if filter.Brand != "" {
		query = query.Where("properties @> ?", fmt.Sprintf(`{"brand": "%s"}`, filter.Brand))
	}

	if err := query.Order("created_at desc").Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to search items: %w", err)
	}
	return items, nil
}

func (r *gearRepository) Update(ctx context.Context, item *domain.Item) error {
	if err := r.db.WithContext(ctx).Save(item).Error; err != nil {
		return fmt.Errorf("failed to update item: %w", err)
	}
	return nil
}

// Delete performs a Soft Delete because domain.Item embeds gorm.DeletedAt
func (r *gearRepository) Delete(ctx context.Context, id string) error {
	if err := r.db.WithContext(ctx).Delete(&domain.Item{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("failed to soft delete item: %w", err)
	}
	return nil
}
