package repository

import (
	"context"
	"fmt"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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
	if err := r.db.WithContext(ctx).
		Preload("TripItems").
		Preload("TripItems.Item"). // アイテム詳細
		Preload("UserProfile").    // ユーザー情報
		First(&trip, "id = ?", id).Error; err != nil {
		return nil, fmt.Errorf("trip not found: %w", err)
	}
	return &trip, nil
}

func (r *tripRepository) List(ctx context.Context) ([]domain.Trip, error) {
	var trips []domain.Trip
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
	// 中間テーブル (trip_items) は GORM の外部キー制約 (OnDelete:CASCADE) で消えるのが理想だが、
	// 安全のため明示的に消去、または Association モードでクリアする
	// ここでは TripItem 自体を削除するクエリを発行
	if err := r.db.WithContext(ctx).Where("trip_id = ?", id).Delete(&domain.TripItem{}).Error; err != nil {
		return fmt.Errorf("failed to delete trip items: %w", err)
	}

	if err := r.db.WithContext(ctx).Delete(&domain.Trip{ID: id}).Error; err != nil {
		return fmt.Errorf("failed to delete trip: %w", err)
	}
	return nil
}

// ★ UpsertItem: 個数を指定してアイテムを追加・更新する
func (r *tripRepository) UpsertItem(ctx context.Context, tripID string, itemID string, quantity int) error {
	tripItem := domain.TripItem{
		TripID:   tripID,
		ItemID:   itemID,
		Quantity: quantity,
	}

	// PostgreSQL の ON CONFLICT (trip_id, item_id) DO UPDATE SET quantity = ... を実行
	if err := r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "trip_id"}, {Name: "item_id"}}, // 複合主キー
		DoUpdates: clause.AssignmentColumns([]string{"quantity"}),        // 更新するカラム
	}).Create(&tripItem).Error; err != nil {
		return fmt.Errorf("failed to upsert trip item: %w", err)
	}

	return nil
}

// ★ RemoveItem: 中間テーブルから削除
func (r *tripRepository) RemoveItem(ctx context.Context, tripID string, itemID string) error {
	if err := r.db.WithContext(ctx).
		Where("trip_id = ? AND item_id = ?", tripID, itemID).
		Delete(&domain.TripItem{}).Error; err != nil {
		return fmt.Errorf("failed to remove item from trip: %w", err)
	}
	return nil
}

func (r *tripRepository) DoInTransaction(ctx context.Context, fn func(txRepo domain.TripRepository) error) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		txRepo := &tripRepository{db: tx}
		return fn(txRepo)
	})
}

func (r *tripRepository) IncrementItemUsages(ctx context.Context, tripID string, increment int) error {
	// 1. Get List of ItemIDs associated with this trip
	var tripItems []domain.TripItem
	if err := r.db.WithContext(ctx).Where("trip_id = ?", tripID).Find(&tripItems).Error; err != nil {
		return err
	}

	if len(tripItems) == 0 {
		return nil
	}

	itemIDs := make([]string, 0, len(tripItems))
	for _, ti := range tripItems {
		itemIDs = append(itemIDs, ti.ItemID)
	}

	// 2. Increment usage_count for these Items
	// usage_count = usage_count + increment
	return r.db.WithContext(ctx).Model(&domain.Item{}).
		Where("id IN ?", itemIDs).
		UpdateColumn("usage_count", gorm.Expr("usage_count + ?", increment)).Error
}
