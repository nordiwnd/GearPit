package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

// Item:
type Item struct {
	ID           string `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name         string `json:"name" gorm:"not null"`
	Brand        string `json:"brand"`
	WeightGram   int    `json:"weightGram"`
	IsConsumable bool   `json:"isConsumable"`

	Properties map[string]any `json:"properties,omitempty" gorm:"type:jsonb;serializer:json"`

	Tags pq.StringArray `json:"tags" gorm:"type:text[]"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// Kit:
type Kit struct {
	ID   string `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name string `json:"name" gorm:"not null"`

	ItemIDs pq.StringArray `json:"itemIds" gorm:"type:text[]"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// Loadout
type Loadout struct {
	ID          string        `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
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

func (i *Item) BeforeCreate(tx *gorm.DB) (err error) {
	if i.ID == "" {
		i.ID = uuid.New().String()
	}
	return
}

func (k *Kit) BeforeCreate(tx *gorm.DB) (err error) {
	if k.ID == "" {
		k.ID = uuid.New().String()
	}
	return
}

func (l *Loadout) BeforeCreate(tx *gorm.DB) (err error) {
	if l.ID == "" {
		l.ID = uuid.New().String()
	}
	return
}
