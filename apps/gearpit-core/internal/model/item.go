// apps/gearpit-core/internal/model/item.go
package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ItemCategory string

const (
	CategorySki            ItemCategory = "ski"
	CategorySnowboard      ItemCategory = "snowboard"
	CategoryMountaineering ItemCategory = "mountaineering"
	CategoryCamping        ItemCategory = "camping"
	CategoryClimbing       ItemCategory = "climbing"
	CategoryOther          ItemCategory = "other"
)

// ItemSpecs handles JSONB for DB storage
type ItemSpecs map[string]interface{}

func (s ItemSpecs) Value() (driver.Value, error) {
	return json.Marshal(s)
}

func (s *ItemSpecs) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(b, &s)
}

// StringTags handles []string storage as JSONB
// (Postgres Array型を使う手もありますが、JSONBの方がGORMでの扱いが簡単で移植性が高いです)
type StringTags []string

func (t StringTags) Value() (driver.Value, error) {
	return json.Marshal(t)
}

func (t *StringTags) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(b, &t)
}

type Item struct {
	ID       string       `json:"id" gorm:"primaryKey;type:uuid"`
	Name     string       `json:"name"`
	Brand    string       `json:"brand"`
	Category ItemCategory `json:"category"`

	// Tags for context (e.g., "winter", "bc")
	Tags StringTags `json:"tags" gorm:"type:jsonb"`

	// Lifecycle
	PurchaseDate   time.Time `json:"purchase_date"`
	LifespanMonths int       `json:"lifespan_months"`

	// Physical
	Weight int `json:"weight"` // grams

	// Flexible Specs
	Specs ItemSpecs `json:"specs" gorm:"type:jsonb"`

	Note     string `json:"note"`
	ImageURL string `json:"image_url"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// BeforeCreate generates UUID automatically
func (i *Item) BeforeCreate(tx *gorm.DB) (err error) {
	if i.ID == "" {
		i.ID = uuid.New().String()
	}
	return
}
