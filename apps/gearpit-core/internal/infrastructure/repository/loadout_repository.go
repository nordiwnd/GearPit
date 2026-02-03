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
	// Nested Preload: Fetch Items, Kits, and Items inside those Kits.
	if err := r.db.WithContext(ctx).
		Preload("Items").
		Preload("Kits.Items").
		First(&loadout, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("loadout not found (id: %s): %w", id, err)
		}
		return nil, fmt.Errorf("failed to fetch loadout: %w", err)
	}
	return &loadout, nil
}

func (r *loadoutRepository) ListAll(ctx context.Context) ([]domain.Loadout, error) {
	var loadouts []domain.Loadout
	if err := r.db.WithContext(ctx).Preload("Items").Preload("Kits").Order("created_at desc").Find(&loadouts).Error; err != nil {
		return nil, fmt.Errorf("failed to list loadouts: %w", err)
	}
	return loadouts, nil
}

// SetAssociations links existing items and kits to the loadout using GORM many2many
func (r *loadoutRepository) SetAssociations(ctx context.Context, loadoutID string, kitIDs, itemIDs []string) error {
	var loadout domain.Loadout
	if err := r.db.WithContext(ctx).First(&loadout, "id = ?", loadoutID).Error; err != nil {
		return err
	}

	tx := r.db.WithContext(ctx).Begin()

	// Association 1: Items
	if len(itemIDs) > 0 {
		var items []domain.Item
		tx.Find(&items, "id IN ?", itemIDs)
		if err := tx.Model(&loadout).Association("Items").Replace(&items); err != nil {
			tx.Rollback()
			return err
		}
	}

	// Association 2: Kits
	if len(kitIDs) > 0 {
		var kits []domain.Kit
		tx.Find(&kits, "id IN ?", kitIDs)
		if err := tx.Model(&loadout).Association("Kits").Replace(&kits); err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}
