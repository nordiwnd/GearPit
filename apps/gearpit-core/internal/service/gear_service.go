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

func NewGearService(repo domain.GearRepository) domain.GearService {
	return &gearService{repo: repo}
}

func (s *gearService) CreateItem(ctx context.Context, name, description string, weight int, tags []string, properties map[string]any) (*domain.Item, error) {
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

func (s *gearService) SearchItems(ctx context.Context, filter domain.GearFilter) ([]domain.Item, error) {
	return s.repo.Search(ctx, filter)
}

func (s *gearService) UpdateItem(ctx context.Context, id string, name, description string, weight int, tags []string, properties map[string]any) (*domain.Item, error) {
	// 1. Fetch existing item
	item, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// 2. Update fields
	item.Name = name
	item.Description = description
	item.WeightGram = weight
	item.Tags = tags
	item.Properties = properties

	// 3. Save
	if err := s.repo.Update(ctx, item); err != nil {
		slog.Error("Service failed to update item", "id", id, "error", err.Error())
		return nil, fmt.Errorf("service failed to update item: %w", err)
	}

	return item, nil
}

func (s *gearService) DeleteItem(ctx context.Context, id string) error {
	slog.Info("Soft deleting gear item", "id", id)
	return s.repo.Delete(ctx, id)
}
