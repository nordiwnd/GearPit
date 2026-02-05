package service

import (
	"context"
	"time"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
)

type maintenanceService struct {
	repo domain.MaintenanceRepository // 修正
}

func NewMaintenanceService(repo domain.MaintenanceRepository) domain.MaintenanceService {
	return &maintenanceService{repo: repo}
}

func (s *maintenanceService) AddLog(ctx context.Context, itemID, logType, description string, cost int, date time.Time) (*domain.MaintenanceLog, error) {
	log := &domain.MaintenanceLog{
		ItemID:      itemID,
		Type:        logType, // ActionTaken -> Type
		Description: description,
		Cost:        cost,
		Date:        date, // LogDate -> Date
	}
	if err := s.repo.Create(ctx, log); err != nil {
		return nil, err
	}
	return log, nil
}

func (s *maintenanceService) GetItemLogs(ctx context.Context, itemID string) ([]domain.MaintenanceLog, error) {
	return s.repo.GetByItemID(ctx, itemID)
}

func (s *maintenanceService) UpdateLog(ctx context.Context, id, logType, description string, cost int, date time.Time) (*domain.MaintenanceLog, error) {
	// 更新用。GetByIDがないので、ログIDから取得するメソッドがRepositoryに必要だが、
	// 簡易的に構築してSaveを呼ぶ（Repositoryの実装依存）
	// 正しくは GetByID をRepositoryに追加すべき
	log := &domain.MaintenanceLog{
		ID:          id,
		Type:        logType,
		Description: description,
		Cost:        cost,
		Date:        date,
	}
	if err := s.repo.Update(ctx, log); err != nil {
		return nil, err
	}
	return log, nil
}

func (s *maintenanceService) DeleteLog(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
