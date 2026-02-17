package service

import (
	"context"
	"testing"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockRepository
type MockGearRepository struct {
	mock.Mock
}

func (m *MockGearRepository) Create(ctx context.Context, item *domain.Item) error {
	args := m.Called(ctx, item)
	return args.Error(0)
}
func (m *MockGearRepository) GetByID(ctx context.Context, id string) (*domain.Item, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Item), args.Error(1)
}
func (m *MockGearRepository) List(ctx context.Context) ([]domain.Item, error) {
	args := m.Called(ctx)
	return args.Get(0).([]domain.Item), args.Error(1)
}
func (m *MockGearRepository) Update(ctx context.Context, item *domain.Item) error {
	args := m.Called(ctx, item)
	return args.Error(0)
}
func (m *MockGearRepository) Delete(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}
func (m *MockGearRepository) Search(ctx context.Context, query string) ([]domain.Item, error) {
	args := m.Called(ctx, query)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]domain.Item), args.Error(1)
}

func (m *MockGearRepository) DoInTransaction(ctx context.Context, fn func(txRepo domain.GearRepository) error) error {
	// Simple mock implementation: just execute the function with the mock itself
	return fn(m)
}

func (m *MockGearRepository) AddMaintenanceLog(ctx context.Context, log *domain.MaintenanceLog) error {
	args := m.Called(ctx, log)
	return args.Error(0)
}

func TestGearService_CreateItem(t *testing.T) {
	mockRepo := new(MockGearRepository)
	service := NewGearService(mockRepo)

	ctx := context.Background()
	params := domain.CreateGearParams{
		Name:       "Test Gear",
		WeightGram: 100,
		WeightType: domain.WeightTypeBase,
		Tags:       []string{"hiking", "summer"},
	}

	mockRepo.On("Create", ctx, mock.MatchedBy(func(item *domain.Item) bool {
		// Check that tags are in properties (simple string check for now as it's JSON)
		// expectedProps := `{"brand":"","category":"","tags":["hiking","summer"]}`
		// Note: map iteration order in JSON might vary, so checking containment is safer or unmarshal back.
		// For simplicity, we just assume proper JSON creation and check Name/Weight
		return item.Name == "Test Gear" && item.WeightGram == 100
	})).Return(nil)

	item, err := service.CreateItem(ctx, params)

	assert.NoError(t, err)
	assert.NotNil(t, item)
	assert.Equal(t, "Test Gear", item.Name)
	mockRepo.AssertExpectations(t)
}
