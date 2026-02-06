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
	if err := r.db.WithContext(ctx).Preload("Items").First(&kit, "id = ?", id).Error; err != nil {
		return nil, fmt.Errorf("kit not found: %w", err)
	}
	return &kit, nil
}

func (r *kitRepository) List(ctx context.Context) ([]domain.Kit, error) {
	var kits []domain.Kit
	if err := r.db.WithContext(ctx).Preload("Items").Find(&kits).Error; err != nil {
		return nil, fmt.Errorf("failed to list kits: %w", err)
	}
	return kits, nil
}

// AddItem メソッドを追加
func (r *kitRepository) AddItem(ctx context.Context, kitID, itemID string) error {
	var kit domain.Kit
	kit.ID = kitID
	// Item構造体を使って関連付け
	if err := r.db.WithContext(ctx).Model(&kit).Association("Items").Append(&domain.Item{ID: itemID}); err != nil {
		return fmt.Errorf("failed to add item to kit: %w", err)
	}
	return nil
}

func (r *kitRepository) RemoveItem(ctx context.Context, kitID, itemID string) error {
	var kit domain.Kit
	kit.ID = kitID
	if err := r.db.WithContext(ctx).Model(&kit).Association("Items").Delete(&domain.Item{ID: itemID}); err != nil {
		return fmt.Errorf("failed to remove item from kit: %w", err)
	}
	return nil
}
