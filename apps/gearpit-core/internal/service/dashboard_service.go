package service

import (
	"context"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
)

type dashboardService struct {
	repo domain.DashboardRepository
}

func NewDashboardService(repo domain.DashboardRepository) domain.DashboardService {
	return &dashboardService{repo: repo}
}

func (s *dashboardService) GetDashboardStats(ctx context.Context) (*domain.DashboardStats, error) {
	return s.repo.GetStats(ctx)
}
