package service

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
)

type gearService struct {
	repo domain.GearRepository
}

// NewGearService initializes the service with a repository interface.
func NewGearService(repo domain.GearRepository) domain.GearService {
	return &gearService{repo: repo}
}

func (s *gearService) CreateItem(ctx context.Context, name, description string, weight int, tags []string, properties map[string]any) (*domain.Item, error) {
	slog.Info("Creating new gear item", "name", name)

	// In the future, domain validation logic goes here.
	item := &domain.Item{
		Name:        name,
		Description: description,
		WeightGram:  weight,
		Tags:        tags,
		Properties:  properties,
	}

	if err := s.repo.Create(ctx, item); err != nil {
		slog.Error("Service failed to create item", "error", err.Error())
		return nil, fmt.Errorf("service failed to create item: %w", err)
	}

	return item, nil
}

func (s *gearService) GetItem(ctx context.Context, id string) (*domain.Item, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *gearService) ListItems(ctx context.Context) ([]domain.Item, error) {
	return s.repo.ListAll(ctx)
}
