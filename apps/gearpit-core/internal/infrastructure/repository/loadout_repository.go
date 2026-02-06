package repository

import (
	"context"
	"fmt"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"gorm.io/gorm"
)

type loadoutRepository struct {
	db *gorm.DB
}

func NewLoadoutRepository(db *gorm.DB) domain.LoadoutRepository {
	return &loadoutRepository{db: db}
}

func (r *loadoutRepository) Create(ctx context.Context, loadout *domain.Loadout) error {
	if err := r.db.WithContext(ctx).Create(loadout).Error; err != nil {
		return fmt.Errorf("failed to create loadout: %w", err)
	}
	return nil
}

func (r *loadoutRepository) GetByID(ctx context.Context, id string) (*domain.Loadout, error) {
	var loadout domain.Loadout
	if err := r.db.WithContext(ctx).Preload("Items").Preload("Kits").First(&loadout, "id = ?", id).Error; err != nil {
		return nil, fmt.Errorf("loadout not found: %w", err)
	}
	return &loadout, nil
}

func (r *loadoutRepository) List(ctx context.Context) ([]domain.Loadout, error) {
	var loadouts []domain.Loadout
	if err := r.db.WithContext(ctx).Preload("Items").Preload("Kits").Find(&loadouts).Error; err != nil {
		return nil, fmt.Errorf("failed to list loadouts: %w", err)
	}
	return loadouts, nil
}

func (r *loadoutRepository) Update(ctx context.Context, loadout *domain.Loadout) error {
	// Association更新を含む
	if err := r.db.WithContext(ctx).Save(loadout).Error; err != nil {
		return fmt.Errorf("failed to update loadout: %w", err)
	}
	// 中間テーブルの更新が必要な場合はここでAssociation Replaceを行うが、
	// Service側で関連付けのIDリストを受け取って再構築する方が確実。
	// ここでは単純なSaveのみとする
	return nil
}

func (r *loadoutRepository) Delete(ctx context.Context, id string) error {
	if err := r.db.WithContext(ctx).Delete(&domain.Loadout{ID: id}).Error; err != nil {
		return fmt.Errorf("failed to delete loadout: %w", err)
	}
	return nil
}
