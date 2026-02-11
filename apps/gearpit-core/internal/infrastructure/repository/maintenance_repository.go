package repository

import (
	"context"
	"fmt"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"gorm.io/gorm"
)

type maintenanceRepository struct {
	db *gorm.DB
}

// 戻り値を domain.MaintenanceRepository に修正
func NewMaintenanceRepository(db *gorm.DB) domain.MaintenanceRepository {
	return &maintenanceRepository{db: db}
}

func (r *maintenanceRepository) Create(ctx context.Context, log *domain.MaintenanceLog) error {
	if err := r.db.WithContext(ctx).Create(log).Error; err != nil {
		return fmt.Errorf("failed to create maintenance log: %w", err)
	}
	return nil
}

func (r *maintenanceRepository) GetByItemID(ctx context.Context, itemID string) ([]domain.MaintenanceLog, error) {
	var logs []domain.MaintenanceLog
	if err := r.db.WithContext(ctx).Where("item_id = ?", itemID).Order("performed_at DESC").Find(&logs).Error; err != nil {
		return nil, fmt.Errorf("failed to get maintenance logs: %w", err)
	}
	return logs, nil
}

func (r *maintenanceRepository) Update(ctx context.Context, log *domain.MaintenanceLog) error {
	if err := r.db.WithContext(ctx).Save(log).Error; err != nil {
		return fmt.Errorf("failed to update maintenance log: %w", err)
	}
	return nil
}

func (r *maintenanceRepository) Delete(ctx context.Context, id string) error {
	if err := r.db.WithContext(ctx).Delete(&domain.MaintenanceLog{ID: id}).Error; err != nil {
		return fmt.Errorf("failed to delete maintenance log: %w", err)
	}
	return nil
}
