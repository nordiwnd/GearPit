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
		return fmt.Errorf("failed to create item: %w", err)
	}
	return nil
}

func (r *gearRepository) GetByID(ctx context.Context, id string) (*domain.Item, error) {
	var item domain.Item
	if err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error; err != nil {
		return nil, fmt.Errorf("item not found: %w", err)
	}
	return &item, nil
}

// List メソッドを実装
func (r *gearRepository) List(ctx context.Context) ([]domain.Item, error) {
	var items []domain.Item
	if err := r.db.WithContext(ctx).Order("created_at DESC").Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to list items: %w", err)
	}
	return items, nil
}

func (r *gearRepository) Update(ctx context.Context, item *domain.Item) error {
	if err := r.db.WithContext(ctx).Save(item).Error; err != nil {
		return fmt.Errorf("failed to update item: %w", err)
	}
	return nil
}

func (r *gearRepository) Delete(ctx context.Context, id string) error {
	if err := r.db.WithContext(ctx).Delete(&domain.Item{ID: id}).Error; err != nil {
		return fmt.Errorf("failed to delete item: %w", err)
	}
	return nil
}

func (r *gearRepository) Search(ctx context.Context, query string) ([]domain.Item, error) {
	var items []domain.Item
	likeQuery := "%" + query + "%"
	if err := r.db.WithContext(ctx).
		Where("name ILIKE ? OR description ILIKE ? OR manufacturer ILIKE ?", likeQuery, likeQuery, likeQuery).
		Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to search items: %w", err)
	}
	return items, nil
}

func (r *gearRepository) AddMaintenanceLog(ctx context.Context, log *domain.MaintenanceLog) error {
	return r.db.WithContext(ctx).Create(log).Error
}

func (r *gearRepository) DoInTransaction(ctx context.Context, fn func(txRepo domain.GearRepository) error) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		txRepo := &gearRepository{db: tx}
		return fn(txRepo)
	})
}
