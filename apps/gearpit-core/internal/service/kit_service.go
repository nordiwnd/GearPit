package service

import (
	"context"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
)

type kitService struct {
	repo domain.KitRepository
}

func NewKitService(repo domain.KitRepository) domain.KitService {
	return &kitService{repo: repo}
}

func (s *kitService) CreateKit(ctx context.Context, name, description string) (*domain.Kit, error) {
	kit := &domain.Kit{
		Name:        name,
		Description: description,
	}
	if err := s.repo.Create(ctx, kit); err != nil {
		return nil, err
	}
	return kit, nil
}

func (s *kitService) GetKit(ctx context.Context, id string) (*domain.Kit, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *kitService) ListKits(ctx context.Context) ([]domain.Kit, error) {
	// ListAll ではなく List を呼ぶ
	return s.repo.List(ctx)
}

func (s *kitService) AddItemToKit(ctx context.Context, kitID, itemID string) error {
	// AddItemToKit ではなく AddItem を呼ぶ
	return s.repo.AddItem(ctx, kitID, itemID)
}

func (s *kitService) RemoveItemFromKit(ctx context.Context, kitID, itemID string) error {
	return s.repo.RemoveItem(ctx, kitID, itemID)
}
