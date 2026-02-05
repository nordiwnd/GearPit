package repository

import (
	"context"
	"fmt"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"gorm.io/gorm"
)

type tripRepository struct {
	db *gorm.DB
}

func NewTripRepository(db *gorm.DB) domain.TripRepository {
	return &tripRepository{db: db}
}

func (r *tripRepository) Create(ctx context.Context, trip *domain.Trip) error {
	if err := r.db.WithContext(ctx).Create(trip).Error; err != nil {
		return fmt.Errorf("failed to create trip: %w", err)
	}
	return nil
}

func (r *tripRepository) GetByID(ctx context.Context, id string) (*domain.Trip, error) {
	var trip domain.Trip
	// Itemsも一緒に取得 (Preload)
	if err := r.db.WithContext(ctx).Preload("Items").First(&trip, "id = ?", id).Error; err != nil {
		return nil, fmt.Errorf("trip not found: %w", err)
	}
	return &trip, nil
}

func (r *tripRepository) List(ctx context.Context) ([]domain.Trip, error) {
	var trips []domain.Trip
	// 一覧ではアイテム詳細までは取らない（軽量化）
	if err := r.db.WithContext(ctx).Order("start_date DESC").Find(&trips).Error; err != nil {
		return nil, fmt.Errorf("failed to list trips: %w", err)
	}
	return trips, nil
}

func (r *tripRepository) Update(ctx context.Context, trip *domain.Trip) error {
	if err := r.db.WithContext(ctx).Save(trip).Error; err != nil {
		return fmt.Errorf("failed to update trip: %w", err)
	}
	return nil
}

func (r *tripRepository) Delete(ctx context.Context, id string) error {
	var trip domain.Trip
	if err := r.db.WithContext(ctx).First(&trip, "id = ?", id).Error; err != nil {
		return err
	}
	// 中間テーブルの関連を削除
	r.db.WithContext(ctx).Model(&trip).Association("Items").Clear()

	if err := r.db.WithContext(ctx).Delete(&trip).Error; err != nil {
		return fmt.Errorf("failed to delete trip: %w", err)
	}
	return nil
}

func (r *tripRepository) AddItems(ctx context.Context, tripID string, itemIDs []string) error {
	var trip domain.Trip
	trip.ID = tripID

	var items []domain.Item
	for _, id := range itemIDs {
		// 修正: 埋め込みフィールドの可能性があるため、リテラルではなく代入を使用
		var item domain.Item
		item.ID = id
		items = append(items, item)
	}

	if err := r.db.WithContext(ctx).Model(&trip).Association("Items").Append(items); err != nil {
		return fmt.Errorf("failed to add items to trip: %w", err)
	}
	return nil
}

func (r *tripRepository) RemoveItems(ctx context.Context, tripID string, itemIDs []string) error {
	var trip domain.Trip
	trip.ID = tripID

	var items []domain.Item
	for _, id := range itemIDs {
		// 修正: 埋め込みフィールドの可能性があるため、リテラルではなく代入を使用
		var item domain.Item
		item.ID = id
		items = append(items, item)
	}

	if err := r.db.WithContext(ctx).Model(&trip).Association("Items").Delete(items); err != nil {
		return fmt.Errorf("failed to remove items from trip: %w", err)
	}
	return nil
}
