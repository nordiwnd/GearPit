package service

import (
	"context"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
)

type loadoutService struct {
	repo domain.LoadoutRepository
}

func NewLoadoutService(repo domain.LoadoutRepository) domain.LoadoutService {
	return &loadoutService{repo: repo}
}

func (s *loadoutService) CreateLoadout(ctx context.Context, name, activityType string, kitIds, itemIds []string) (*domain.Loadout, error) {
	// アイテムとキットの関連付けを構築
	var items []domain.Item
	for _, id := range itemIds {
		items = append(items, domain.Item{ID: id})
	}
	var kits []domain.Kit
	for _, id := range kitIds {
		kits = append(kits, domain.Kit{ID: id})
	}

	loadout := &domain.Loadout{
		Name:         name,
		ActivityType: activityType,
		Items:        items,
		Kits:         kits,
	}

	if err := s.repo.Create(ctx, loadout); err != nil {
		return nil, err
	}
	return loadout, nil
}

func (s *loadoutService) GetLoadout(ctx context.Context, id string) (*domain.Loadout, error) {
	// 重量計算などは必要ならここで行う
	return s.repo.GetByID(ctx, id)
}

func (s *loadoutService) ListLoadouts(ctx context.Context) ([]domain.Loadout, error) {
	return s.repo.List(ctx)
}

func (s *loadoutService) UpdateLoadout(ctx context.Context, id, name, activityType string, kitIds, itemIds []string) (*domain.Loadout, error) {
	loadout, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	loadout.Name = name
	loadout.ActivityType = activityType

	// 関連の更新はGORMのAssociation Replaceを使用するべきだが、
	// 簡易的にインスタンスを置き換えてSaveで対応する場合
	// 注意: GORMのSaveで関連が正しく入れ替わるにはFullSaveAssociationsが必要な場合がある
	// ここではRepositoryのUpdate実装に依存するが、
	// Service層で関連付けを再構築して渡す
	var items []domain.Item
	for _, iid := range itemIds {
		items = append(items, domain.Item{ID: iid})
	}
	var kits []domain.Kit
	for _, kid := range kitIds {
		kits = append(kits, domain.Kit{ID: kid})
	}
	loadout.Items = items
	loadout.Kits = kits

	if err := s.repo.Update(ctx, loadout); err != nil {
		return nil, err
	}
	return loadout, nil
}

func (s *loadoutService) DeleteLoadout(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
