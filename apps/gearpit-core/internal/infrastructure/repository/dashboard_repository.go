package repository

import (
	"context"
	"fmt"

	"github.com/nordiwnd/gearpit/apps/gearpit-core/internal/domain"
	"gorm.io/gorm"
)

type dashboardRepository struct {
	db *gorm.DB
}

func NewDashboardRepository(db *gorm.DB) domain.DashboardRepository {
	return &dashboardRepository{db: db}
}

func (r *dashboardRepository) GetStats(ctx context.Context) (*domain.DashboardStats, error) {
	stats := &domain.DashboardStats{}
	db := r.db.WithContext(ctx)

	// 1. Total Items
	if err := db.Model(&domain.Item{}).Count(&stats.TotalItems).Error; err != nil {
		return nil, fmt.Errorf("failed to count items: %w", err)
	}

	// 2. Total Weight (Sum of all items)
	var totalWeight int64
	if err := db.Model(&domain.Item{}).Select("COALESCE(SUM(weight_gram), 0)").Scan(&totalWeight).Error; err != nil {
		return nil, fmt.Errorf("failed to sum weight: %w", err)
	}
	stats.TotalWeight = int(totalWeight)

	// 2.1 Long Gear (Skis/Poles/Accessories) Weight (Sum where weight_type = 'long' or 'accessory')
	var longWeight int64
	if err := db.Model(&domain.Item{}).Where("weight_type IN ?", []domain.WeightType{domain.WeightTypeLong, domain.WeightTypeAccessory}).Select("COALESCE(SUM(weight_gram), 0)").Scan(&longWeight).Error; err != nil {
		return nil, fmt.Errorf("failed to sum long weight: %w", err)
	}
	stats.LongWeight = int(longWeight)

	// 3. Total Loadouts
	if err := db.Model(&domain.Loadout{}).Count(&stats.TotalLoadouts).Error; err != nil {
		return nil, fmt.Errorf("failed to count loadouts: %w", err)
	}

	// 4. Total Maintenance Cost
	var totalCost int64
	if err := db.Model(&domain.MaintenanceLog{}).Select("COALESCE(SUM(cost), 0)").Scan(&totalCost).Error; err != nil {
		return nil, fmt.Errorf("failed to sum maintenance cost: %w", err)
	}
	stats.TotalCost = int(totalCost)

	// 5. Category Stats (Group by JSON property)
	// PostgreSQL specific syntax for JSONB
	rows, err := db.Model(&domain.Item{}).
		Select("properties->>'category' as category, COUNT(*) as count, SUM(weight_gram) as total_weight").
		Group("properties->>'category'").
		Order("total_weight DESC").
		Rows()
	if err != nil {
		return nil, fmt.Errorf("failed to aggregate categories: %w", err)
	}
	defer func() {
		// Explicitly ignore close error
		_ = rows.Close()
	}()

	for rows.Next() {
		var catStat domain.CategoryStat
		var categoryName *string // Handle null/empty
		if err := rows.Scan(&categoryName, &catStat.Count, &catStat.TotalWeight); err != nil {
			continue
		}
		if categoryName == nil || *categoryName == "" {
			catStat.Category = "Uncategorized"
		} else {
			catStat.Category = *categoryName
		}
		stats.CategoryStats = append(stats.CategoryStats, catStat)
	}

	return stats, nil
}
