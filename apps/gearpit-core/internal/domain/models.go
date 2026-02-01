package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

// Item: ギア単体
type Item struct {
	ID           string `json:"id" gorm:"primaryKey;type:uuid"`
	Name         string `json:"name" gorm:"not null"`
	Brand        string `json:"brand" gorm:"not null"`
	WeightGram   int    `json:"weightGram"`   // 0 = Unknown
	IsConsumable bool   `json:"isConsumable"` // 食品、燃料など

	// カテゴリ (Top Level Filtering用)
	// ex: "ski", "mountaineering", "camp"
	Category string `json:"category" gorm:"index;not null"`

	// 柔軟なスペック格納用 (Polymorphic Properties)
	// GIN Indexにより、JSON内部のキー("sub_category", "length_cm"等)で高速検索可能
	Properties map[string]any `json:"properties,omitempty" gorm:"type:jsonb;serializer:json;index:type:gin"`

	Tags pq.StringArray `json:"tags" gorm:"type:text[]"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// Kit: 持ち物セット (例: "バックカントリー基本セット")
type Kit struct {
	ID   string `json:"id" gorm:"primaryKey;type:uuid"`
	Name string `json:"name" gorm:"not null"`

	ItemIDs pq.StringArray `json:"itemIds" gorm:"type:text[]"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// Loadout: 実際の登山計画ごとのパッキングリスト (Kit + 追加アイテム)
type Loadout struct {
	ID          string        `json:"id" gorm:"primaryKey;type:uuid"`
	Name        string        `json:"name" gorm:"not null"`
	Items       []LoadoutItem `json:"items" gorm:"serializer:json"`
	TotalWeight int           `json:"totalWeightGram"`
	CreatedAt   time.Time     `json:"createdAt"`
	UpdatedAt   time.Time     `json:"updatedAt"`
}

type LoadoutItem struct {
	ItemID    string `json:"itemId"`
	Quantity  int    `json:"quantity"`
	IsChecked bool   `json:"isChecked"`
}

// --- Hooks (UUID v7 Generation) ---

func (i *Item) BeforeCreate(tx *gorm.DB) (err error) {
	if i.ID == "" {
		v7, err := uuid.NewV7()
		if err != nil {
			return err
		}
		i.ID = v7.String()
	}
	return
}

func (k *Kit) BeforeCreate(tx *gorm.DB) (err error) {
	if k.ID == "" {
		v7, err := uuid.NewV7()
		if err != nil {
			return err
		}
		k.ID = v7.String()
	}
	return
}

func (l *Loadout) BeforeCreate(tx *gorm.DB) (err error) {
	if l.ID == "" {
		v7, err := uuid.NewV7()
		if err != nil {
			return err
		}
		l.ID = v7.String()
	}
	return
}
