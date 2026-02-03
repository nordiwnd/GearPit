package repository

import (
	"context"
	"fmt"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"gorm.io/gorm"
)

type kitRepository struct {
	db *gorm.DB
}

func NewKitRepository(db *gorm.DB) domain.KitRepository {
	return &kitRepository{db: db}
}

func (r *kitRepository) Create(ctx context.Context, kit *domain.Kit) error {
	if err := r.db.WithContext(ctx).Create(kit).Error; err != nil {
		return fmt.Errorf("failed to create kit: %w", err)
	}
	return nil
}

func (r *kitRepository) GetByID(ctx context.Context, id string) (*domain.Kit, error) {
	var kit domain.Kit
	// Preload associated items
	if err := r.db.WithContext(ctx).Preload("Items").First(&kit, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("kit not found (id: %s): %w", id, err)
		}
		return nil, fmt.Errorf("failed to fetch kit: %w", err)
	}
	return &kit, nil
}

func (r *kitRepository) ListAll(ctx context.Context) ([]domain.Kit, error) {
	var kits []domain.Kit
	// Preload items count or items themselves if needed for UI
	if err := r.db.WithContext(ctx).Preload("Items").Order("created_at desc").Find(&kits).Error; err != nil {
		return nil, fmt.Errorf("failed to list kits: %w", err)
	}
	return kits, nil
}

func (r *kitRepository) AddItemsToKit(ctx context.Context, kitID string, itemIDs []string) error {
	var kit domain.Kit
	if err := r.db.WithContext(ctx).First(&kit, "id = ?", kitID).Error; err != nil {
		return err
	}

	// Fetch items to be associated
	var items []domain.Item
	if err := r.db.WithContext(ctx).Find(&items, "id IN ?", itemIDs).Error; err != nil {
		return err
	}

	// Use GORM association to update many-to-many relationship
	if err := r.db.WithContext(ctx).Model(&kit).Association("Items").Append(&items); err != nil {
		return fmt.Errorf("failed to add items to kit: %w", err)
	}

	return nil
}
