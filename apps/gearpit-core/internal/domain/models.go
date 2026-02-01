package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

// Item:
type Item struct {
	ID           string `json:"id" gorm:"primaryKey;type:uuid"`
	Name         string `json:"name" gorm:"not null"`
	Brand        string `json:"brand"`
	WeightGram   int    `json:"weightGram"`
	IsConsumable bool   `json:"isConsumable"`

	// JSONB検索用にGINインデックスを追加
	Properties map[string]any `json:"properties,omitempty" gorm:"type:jsonb;serializer:json;index:type:gin"`

	Tags pq.StringArray `json:"tags" gorm:"type:text[]"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// Kit:
type Kit struct {
	ID   string `json:"id" gorm:"primaryKey;type:uuid"`
	Name string `json:"name" gorm:"not null"`

	ItemIDs pq.StringArray `json:"itemIds" gorm:"type:text[]"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// Loadout
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

// BeforeCreate Hooks: UUID v7への切り替え

func (i *Item) BeforeCreate(tx *gorm.DB) (err error) {
	if i.ID == "" {
		id, err := uuid.NewV7()
		if err != nil {
			return err
		}
		i.ID = id.String()
	}
	return
}

func (k *Kit) BeforeCreate(tx *gorm.DB) (err error) {
	if k.ID == "" {
		id, err := uuid.NewV7()
		if err != nil {
			return err
		}
		k.ID = id.String()
	}
	return
}

func (l *Loadout) BeforeCreate(tx *gorm.DB) (err error) {
	if l.ID == "" {
		id, err := uuid.NewV7()
		if err != nil {
			return err
		}
		l.ID = id.String()
	}
	return
}
