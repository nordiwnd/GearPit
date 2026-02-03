package service

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
)

type maintenanceService struct {
	repo domain.MaintenanceLogRepository
}

func NewMaintenanceService(repo domain.MaintenanceLogRepository) domain.MaintenanceLogService {
	return &maintenanceService{repo: repo}
}

func (s *maintenanceService) AddLog(ctx context.Context, itemID string, logDateStr, actionTaken string, cost int) (*domain.MaintenanceLog, error) {
	logDate, err := time.Parse("2006-01-02", logDateStr)
	if err != nil {
		logDate = time.Now() // Fallback to current date
	}

	log := &domain.MaintenanceLog{
		ItemID:      itemID,
		LogDate:     logDate,
		ActionTaken: actionTaken,
		Cost:        cost,
	}

	if err := s.repo.Create(ctx, log); err != nil {
		slog.Error("Service failed to add maintenance log", "error", err.Error())
		return nil, fmt.Errorf("service failed to add maintenance log: %w", err)
	}

	return log, nil
}

func (s *maintenanceService) GetLogsForItem(ctx context.Context, itemID string) ([]domain.MaintenanceLog, error) {
	return s.repo.GetByItemID(ctx, itemID)
}

func (s *maintenanceService) DeleteLog(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func (s *maintenanceService) UpdateLog(ctx context.Context, id, logDateStr, actionTaken string, cost int) (*domain.MaintenanceLog, error) {
	log, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	logDate, err := time.Parse("2006-01-02", logDateStr)
	if err == nil {
		log.LogDate = logDate
	}
	log.ActionTaken = actionTaken
	log.Cost = cost

	if err := s.repo.Update(ctx, log); err != nil {
		return nil, err
	}
	return log, nil
}
