package service

import (
	"context"
	"encoding/json"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"gorm.io/datatypes"
)

type gearService struct {
	repo domain.GearRepository
}

func NewGearService(repo domain.GearRepository) domain.GearService {
	return &gearService{repo: repo}
}

func (s *gearService) CreateItem(ctx context.Context, params domain.CreateGearParams) (*domain.Item, error) {
	// プロパティをJSONとして構築
	props := map[string]string{
		"category": params.Category,
		"brand":    params.Brand,
	}
	propsJSON, _ := json.Marshal(props)

	item := &domain.Item{
		Name:                params.Name,
		Description:         params.Description,
		Manufacturer:        params.Manufacturer,
		WeightGram:          params.WeightGram,
		WeightType:          params.WeightType,
		Properties:          datatypes.JSON(propsJSON),
		UsageCount:          params.UsageCount,
		MaintenanceInterval: params.MaintenanceInterval,
	}

	if err := s.repo.Create(ctx, item); err != nil {
		return nil, err
	}
	return item, nil
}

func (s *gearService) GetItem(ctx context.Context, id string) (*domain.Item, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *gearService) ListItems(ctx context.Context) ([]domain.Item, error) {
	return s.repo.List(ctx)
}

func (s *gearService) UpdateItem(ctx context.Context, id string, params domain.UpdateGearParams) (*domain.Item, error) {
	item, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// プロパティ更新
	props := map[string]string{
		"category": params.Category,
		"brand":    params.Brand,
	}
	propsJSON, _ := json.Marshal(props)

	item.Name = params.Name
	item.Description = params.Description
	item.Manufacturer = params.Manufacturer
	item.WeightGram = params.WeightGram
	item.WeightType = params.WeightType
	item.Properties = datatypes.JSON(propsJSON)
	item.UsageCount = params.UsageCount
	item.MaintenanceInterval = params.MaintenanceInterval

	if err := s.repo.Update(ctx, item); err != nil {
		return nil, err
	}
	return item, nil
}

func (s *gearService) DeleteItem(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func (s *gearService) SearchItems(ctx context.Context, query string) ([]domain.Item, error) {
	return s.repo.Search(ctx, query)
}
