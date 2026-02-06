package service

import (
	"context"
	"time"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
)

type tripService struct {
	repo domain.TripRepository
}

func NewTripService(repo domain.TripRepository) domain.TripService {
	return &tripService{repo: repo}
}

// 修正: userProfileID 引数を追加
func (s *tripService) CreateTrip(ctx context.Context, name, description, location string, startDate, endDate time.Time, userProfileID *string) (*domain.Trip, error) {
	trip := &domain.Trip{
		Name:          name,
		Description:   description,
		Location:      location,
		StartDate:     startDate,
		EndDate:       endDate,
		UserProfileID: userProfileID, // 追加
	}
	if err := s.repo.Create(ctx, trip); err != nil {
		return nil, err
	}
	return trip, nil
}

func (s *tripService) GetTrip(ctx context.Context, id string) (*domain.Trip, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *tripService) ListTrips(ctx context.Context) ([]domain.Trip, error) {
	return s.repo.List(ctx)
}

// 修正: userProfileID 引数を追加
func (s *tripService) UpdateTrip(ctx context.Context, id, name, description, location string, startDate, endDate time.Time, userProfileID *string) (*domain.Trip, error) {
	trip, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	trip.Name = name
	trip.Description = description
	trip.Location = location
	trip.StartDate = startDate
	trip.EndDate = endDate
	trip.UserProfileID = userProfileID // 追加

	if err := s.repo.Update(ctx, trip); err != nil {
		return nil, err
	}
	return trip, nil
}

func (s *tripService) DeleteTrip(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

// 追加: 個数更新用
func (s *tripService) AddOrUpdateItem(ctx context.Context, tripID string, itemID string, quantity int) error {
	return s.repo.UpsertItem(ctx, tripID, itemID, quantity)
}

func (s *tripService) RemoveItemFromTrip(ctx context.Context, tripID string, itemID string) error {
	// リポジトリに RemoveItem 単体削除メソッドがあればそれを呼ぶが、
	// 現在のインターフェースでは RemoveItems (複数) しかない場合がある。
	// 先ほどのステップで RemoveItem(単体) を追加したのでそれを呼ぶ。
	return s.repo.RemoveItem(ctx, tripID, itemID)
}
