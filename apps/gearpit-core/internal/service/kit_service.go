package service

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
)

type kitService struct {
	repo domain.KitRepository
}

func NewKitService(repo domain.KitRepository) domain.KitService {
	return &kitService{repo: repo}
}

func (s *kitService) CreateKit(ctx context.Context, name, description string, itemIDs []string) (*domain.Kit, error) {
	kit := &domain.Kit{
		Name:        name,
		Description: description,
	}

	if err := s.repo.Create(ctx, kit); err != nil {
		slog.Error("Service failed to create kit", "error", err.Error())
		return nil, fmt.Errorf("service failed to create kit: %w", err)
	}

	// Associate items if provided
	if len(itemIDs) > 0 {
		if err := s.repo.AddItemsToKit(ctx, kit.ID, itemIDs); err != nil {
			slog.Error("Failed to add items to kit", "kit_id", kit.ID, "error", err.Error())
			return nil, fmt.Errorf("failed to add items to kit: %w", err)
		}
	}

	return s.GetKit(ctx, kit.ID) // Return fully loaded kit
}

func (s *kitService) GetKit(ctx context.Context, id string) (*domain.Kit, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *kitService) ListKits(ctx context.Context) ([]domain.Kit, error) {
	return s.repo.ListAll(ctx)
}
