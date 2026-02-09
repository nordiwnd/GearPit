package service

import (
	"context"
	"time"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
)

type maintenanceService struct {
	repo     domain.MaintenanceRepository
	gearRepo domain.GearRepository // Add GearRepository
}

func NewMaintenanceService(repo domain.MaintenanceRepository, gearRepo domain.GearRepository) domain.MaintenanceService {
	return &maintenanceService{repo: repo, gearRepo: gearRepo}
}

func (s *maintenanceService) AddLog(ctx context.Context, itemID, logType, description string, cost int, performedAt time.Time) (*domain.MaintenanceLog, error) {
	var log *domain.MaintenanceLog

	// Use GearRepository transaction because we need to update Item and create Log
	err := s.gearRepo.DoInTransaction(ctx, func(txRepo domain.GearRepository) error {
		// 1. Get Item to snapshot usage
		item, err := txRepo.GetByID(ctx, itemID)
		if err != nil {
			return err
		}

		// 2. Create Log
		log = &domain.MaintenanceLog{
			ItemID:        itemID,
			Type:          logType,
			Description:   description,
			Cost:          cost,
			PerformedAt:   performedAt,
			SnapshotUsage: item.UsageCount,
		}
		if err := txRepo.AddMaintenanceLog(ctx, log); err != nil {
			return err
		}

		// 3. Reset Item Usage
		item.UsageCount = 0
		if err := txRepo.Update(ctx, item); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return log, nil
}

func (s *maintenanceService) GetItemLogs(ctx context.Context, itemID string) ([]domain.MaintenanceLog, error) {
	return s.repo.GetByItemID(ctx, itemID)
}

func (s *maintenanceService) UpdateLog(ctx context.Context, id, logType, description string, cost int, performedAt time.Time) (*domain.MaintenanceLog, error) {
	// 更新用。GetByIDがないので、ログIDから取得するメソッドがRepositoryに必要だが、
	// 簡易的に構築してSaveを呼ぶ（Repositoryの実装依存）
	// 正しくは GetByID をRepositoryに追加すべき
	log := &domain.MaintenanceLog{
		ID:          id,
		Type:        logType,
		Description: description,
		Cost:        cost,
		PerformedAt: performedAt,
	}
	if err := s.repo.Update(ctx, log); err != nil {
		return nil, err
	}
	return log, nil
}

func (s *maintenanceService) DeleteLog(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
