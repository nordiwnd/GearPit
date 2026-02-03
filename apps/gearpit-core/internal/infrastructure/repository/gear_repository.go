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

// NewGearRepository injects GORM DB into the repository.
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

func (r *gearRepository) ListAll(ctx context.Context) ([]domain.Item, error) {
	var items []domain.Item
	// Preload tags/properties is automatic due to model definition.
	if err := r.db.WithContext(ctx).Order("created_at desc").Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to list items: %w", err)
	}
	return items, nil
}
