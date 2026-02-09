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

func (s *gearService) CreateItem(ctx context.Context, name, description, manufacturer string, weight int, weightType domain.WeightType, category, brand string, usageCount, maintenanceInterval int) (*domain.Item, error) {
	// プロパティをJSONとして構築
	props := map[string]string{
		"category": category,
		"brand":    brand,
	}
	propsJSON, _ := json.Marshal(props)

	item := &domain.Item{
		Name:                name,
		Description:         description,
		Manufacturer:        manufacturer,
		WeightGram:          weight,
		WeightType:          weightType,
		Properties:          datatypes.JSON(propsJSON),
		UsageCount:          usageCount,
		MaintenanceInterval: maintenanceInterval,
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

func (s *gearService) UpdateItem(ctx context.Context, id, name, description, manufacturer string, weight int, weightType domain.WeightType, category, brand string, usageCount, maintenanceInterval int) (*domain.Item, error) {
	item, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// プロパティ更新
	props := map[string]string{
		"category": category,
		"brand":    brand,
	}
	propsJSON, _ := json.Marshal(props)

	item.Name = name
	item.Description = description
	item.Manufacturer = manufacturer
	item.WeightGram = weight
	item.WeightType = weightType
	item.Properties = datatypes.JSON(propsJSON)
	item.UsageCount = usageCount
	item.MaintenanceInterval = maintenanceInterval

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
