package service

import (
	"context"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
)

type profileService struct {
	repo domain.ProfileRepository
}

func NewProfileService(repo domain.ProfileRepository) domain.ProfileService {
	return &profileService{repo: repo}
}

func (s *profileService) CreateProfile(ctx context.Context, name string, height, weight float64, age int, gender string) (*domain.UserProfile, error) {
	profile := &domain.UserProfile{
		Name:     name,
		HeightCm: height,
		WeightKg: weight,
		Age:      age,
		Gender:   gender,
	}
	if err := s.repo.Create(ctx, profile); err != nil {
		return nil, err
	}
	return profile, nil
}

func (s *profileService) GetProfile(ctx context.Context, id string) (*domain.UserProfile, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *profileService) ListProfiles(ctx context.Context) ([]domain.UserProfile, error) {
	return s.repo.List(ctx)
}

func (s *profileService) UpdateProfile(ctx context.Context, id, name string, height, weight float64, age int, gender string) (*domain.UserProfile, error) {
	profile, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	profile.Name = name
	profile.HeightCm = height
	profile.WeightKg = weight
	profile.Age = age
	profile.Gender = gender

	if err := s.repo.Update(ctx, profile); err != nil {
		return nil, err
	}
	return profile, nil
}

func (s *profileService) DeleteProfile(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
