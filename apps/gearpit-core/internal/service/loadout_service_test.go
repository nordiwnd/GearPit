package service

import (
	"context"
	"testing"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockLoadoutRepo
type MockLoadoutRepo struct {
	mock.Mock
}

func (m *MockLoadoutRepo) Create(ctx context.Context, loadout *domain.Loadout) error {
	args := m.Called(ctx, loadout)
	return args.Error(0)
}
func (m *MockLoadoutRepo) GetByID(ctx context.Context, id string) (*domain.Loadout, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*domain.Loadout), args.Error(1)
}
func (m *MockLoadoutRepo) List(ctx context.Context) ([]domain.Loadout, error) {
	args := m.Called(ctx)
	return args.Get(0).([]domain.Loadout), args.Error(1)
}
func (m *MockLoadoutRepo) Update(ctx context.Context, loadout *domain.Loadout) error {
	args := m.Called(ctx, loadout)
	return args.Error(0)
}
func (m *MockLoadoutRepo) Delete(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func TestGetLoadout_CalculatesWeights(t *testing.T) {
	mockRepo := new(MockLoadoutRepo)
	service := NewLoadoutService(mockRepo)

	// dummy items
	items := []domain.Item{
		{Name: "Tent", WeightGram: 1000, WeightType: domain.WeightTypeBase},
		{Name: "Water", WeightGram: 500, WeightType: domain.WeightTypeConsumable},
		{Name: "Shoes", WeightGram: 300, WeightType: domain.WeightTypeWorn},
		{Name: "Pack", WeightGram: 800, WeightType: domain.WeightTypeBase},
	}

	loadout := &domain.Loadout{
		ID:    "1",
		Name:  "Test Loadout",
		Items: items,
	}

	mockRepo.On("GetByID", mock.Anything, "1").Return(loadout, nil)

	result, err := service.GetLoadout(context.Background(), "1")

	assert.NoError(t, err)
	assert.NotNil(t, result)

	// Total: 1000 + 500 + 300 + 800 = 2600
	assert.Equal(t, 2600, result.TotalWeightGram)
	// Base: 1000 (Tent) + 800 (Pack) = 1800
	assert.Equal(t, 1800, result.BaseWeightGram)
	// Consumable: 500 (Water)
	assert.Equal(t, 500, result.ConsumableWeightGram)
	// Worn: 300 (Shoes)
	assert.Equal(t, 300, result.WornWeightGram)

	mockRepo.AssertExpectations(t)
}
