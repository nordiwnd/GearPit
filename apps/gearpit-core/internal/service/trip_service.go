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

func (s *tripService) CreateTrip(ctx context.Context, name, description, location string, startDate, endDate time.Time) (*domain.Trip, error) {
	trip := &domain.Trip{
		Name:        name,
		Description: description,
		Location:    location,
		StartDate:   startDate,
		EndDate:     endDate,
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

func (s *tripService) UpdateTrip(ctx context.Context, id, name, description, location string, startDate, endDate time.Time) (*domain.Trip, error) {
	trip, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	trip.Name = name
	trip.Description = description
	trip.Location = location
	trip.StartDate = startDate
	trip.EndDate = endDate

	if err := s.repo.Update(ctx, trip); err != nil {
		return nil, err
	}
	return trip, nil
}

func (s *tripService) DeleteTrip(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func (s *tripService) AddItemsToTrip(ctx context.Context, tripID string, itemIDs []string) error {
	return s.repo.AddItems(ctx, tripID, itemIDs)
}

func (s *tripService) RemoveItemsFromTrip(ctx context.Context, tripID string, itemIDs []string) error {
	return s.repo.RemoveItems(ctx, tripID, itemIDs)
}
