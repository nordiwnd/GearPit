package service

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
)

type loadoutService struct {
	repo domain.LoadoutRepository
}

func NewLoadoutService(repo domain.LoadoutRepository) domain.LoadoutService {
	return &loadoutService{repo: repo}
}

func (s *loadoutService) CreateLoadout(ctx context.Context, name, activityType string, kitIDs, itemIDs []string) (*domain.Loadout, error) {
	loadout := &domain.Loadout{
		Name:         name,
		ActivityType: activityType,
	}

	if err := s.repo.Create(ctx, loadout); err != nil {
		slog.Error("Service failed to create loadout", "error", err.Error())
		return nil, fmt.Errorf("service failed to create loadout: %w", err)
	}

	if len(kitIDs) > 0 || len(itemIDs) > 0 {
		if err := s.repo.SetAssociations(ctx, loadout.ID, kitIDs, itemIDs); err != nil {
			slog.Error("Failed to set loadout associations", "loadout_id", loadout.ID, "error", err.Error())
			return nil, fmt.Errorf("failed to set loadout associations: %w", err)
		}
	}

	return s.GetLoadout(ctx, loadout.ID)
}

func (s *loadoutService) GetLoadout(ctx context.Context, id string) (*domain.Loadout, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *loadoutService) ListLoadouts(ctx context.Context) ([]domain.Loadout, error) {
	return s.repo.ListAll(ctx)
}

func (s *loadoutService) UpdateLoadout(ctx context.Context, id string, name, activityType string, kitIDs, itemIDs []string) (*domain.Loadout, error) {
	loadout, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	loadout.Name = name
	loadout.ActivityType = activityType

	if err := s.repo.Update(ctx, loadout); err != nil {
		return nil, fmt.Errorf("service failed to update loadout: %w", err)
	}

	// Update associations
	if err := s.repo.SetAssociations(ctx, id, kitIDs, itemIDs); err != nil {
		return nil, fmt.Errorf("failed to update loadout associations: %w", err)
	}

	return s.GetLoadout(ctx, id)
}

func (s *loadoutService) DeleteLoadout(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
