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

// 修正: userProfileID 引数を追加, durationDaysを追加, plannedHikingHoursを追加
func (s *tripService) CreateTrip(ctx context.Context, name, description, location string, startDate, endDate time.Time, userProfileID *string, durationDays int, plannedHikingHours float64) (*domain.Trip, error) {
	trip := &domain.Trip{
		Name:               name,
		Description:        description,
		Location:           location,
		StartDate:          startDate,
		EndDate:            endDate,
		UserProfileID:      userProfileID,
		DurationDays:       durationDays,
		PlannedHikingHours: plannedHikingHours,
		Status:             "planned",
	}
	if err := s.repo.Create(ctx, trip); err != nil {
		return nil, err
	}
	return trip, nil
}

func (s *tripService) GetTrip(ctx context.Context, id string) (*domain.Trip, error) {
	trip, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Calculate Stats
	var bodyWeightKg float64
	if trip.UserProfile != nil {
		bodyWeightKg = trip.UserProfile.WeightKg
	}

	var packWeightKg float64
	for _, ti := range trip.TripItems {
		itemWeightKg := float64(ti.Item.WeightGram*ti.Quantity) / 1000.0
		packWeightKg += itemWeightKg
	}

	trip.PredictedHydrationML = domain.CalculateHydration(bodyWeightKg, packWeightKg, trip.PlannedHikingHours)
	trip.PredictedCalories = domain.CalculateCalories(bodyWeightKg, packWeightKg, trip.PlannedHikingHours)

	return trip, nil
}

func (s *tripService) ListTrips(ctx context.Context) ([]domain.Trip, error) {
	return s.repo.List(ctx)
}

// 修正: userProfileID 引数を追加, durationDaysを追加, plannedHikingHoursを追加
func (s *tripService) UpdateTrip(ctx context.Context, id, name, description, location string, startDate, endDate time.Time, userProfileID *string, durationDays int, plannedHikingHours float64) (*domain.Trip, error) {
	trip, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	trip.Name = name
	trip.Description = description
	trip.Location = location
	trip.StartDate = startDate
	trip.EndDate = endDate
	trip.UserProfileID = userProfileID
	trip.DurationDays = durationDays
	trip.PlannedHikingHours = plannedHikingHours

	if err := s.repo.Update(ctx, trip); err != nil {
		return nil, err
	}

	// Recalculate stats for response
	var bodyWeightKg float64
	if trip.UserProfile != nil {
		bodyWeightKg = trip.UserProfile.WeightKg
	}

	var packWeightKg float64
	for _, ti := range trip.TripItems {
		itemWeightKg := float64(ti.Item.WeightGram*ti.Quantity) / 1000.0
		packWeightKg += itemWeightKg
	}

	trip.PredictedHydrationML = domain.CalculateHydration(bodyWeightKg, packWeightKg, trip.PlannedHikingHours)
	trip.PredictedCalories = domain.CalculateCalories(bodyWeightKg, packWeightKg, trip.PlannedHikingHours)

	return trip, nil
}

func (s *tripService) CompleteTrip(ctx context.Context, id string) error {
	return s.repo.DoInTransaction(ctx, func(txRepo domain.TripRepository) error {
		// 1. Fetch trip to check status
		trip, err := txRepo.GetByID(ctx, id)
		if err != nil {
			return err
		}

		// Idempotency check
		if trip.Status == "completed" {
			return nil
		}

		// 2. Calculate increment
		increment := trip.DurationDays
		if increment < 1 {
			increment = 1
		}

		// 3. Increment usage for all items in the trip
		if err := txRepo.IncrementItemUsages(ctx, id, increment); err != nil {
			return err
		}

		// 4. Update Trip Status
		trip.Status = "completed"
		if err := txRepo.Update(ctx, trip); err != nil {
			return err
		}

		return nil
	})
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
