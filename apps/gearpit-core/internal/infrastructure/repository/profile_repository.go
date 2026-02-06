package repository

import (
	"context"
	"fmt"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"gorm.io/gorm"
)

type profileRepository struct {
	db *gorm.DB
}

func NewProfileRepository(db *gorm.DB) domain.ProfileRepository {
	return &profileRepository{db: db}
}

func (r *profileRepository) Create(ctx context.Context, profile *domain.UserProfile) error {
	if err := r.db.WithContext(ctx).Create(profile).Error; err != nil {
		return fmt.Errorf("failed to create profile: %w", err)
	}
	return nil
}

func (r *profileRepository) GetByID(ctx context.Context, id string) (*domain.UserProfile, error) {
	var profile domain.UserProfile
	if err := r.db.WithContext(ctx).First(&profile, "id = ?", id).Error; err != nil {
		return nil, fmt.Errorf("profile not found: %w", err)
	}
	return &profile, nil
}

func (r *profileRepository) List(ctx context.Context) ([]domain.UserProfile, error) {
	var profiles []domain.UserProfile
	if err := r.db.WithContext(ctx).Order("created_at DESC").Find(&profiles).Error; err != nil {
		return nil, fmt.Errorf("failed to list profiles: %w", err)
	}
	return profiles, nil
}

func (r *profileRepository) Update(ctx context.Context, profile *domain.UserProfile) error {
	if err := r.db.WithContext(ctx).Save(profile).Error; err != nil {
		return fmt.Errorf("failed to update profile: %w", err)
	}
	return nil
}

func (r *profileRepository) Delete(ctx context.Context, id string) error {
	if err := r.db.WithContext(ctx).Delete(&domain.UserProfile{ID: id}).Error; err != nil {
		return fmt.Errorf("failed to delete profile: %w", err)
	}
	return nil
}
