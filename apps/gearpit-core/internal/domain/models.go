package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

// BaseModel provides UUID v7 PK and standard timestamps for all entities.
type BaseModel struct {
	ID        string         `gorm:"primaryKey;type:uuid" json:"id"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// BeforeCreate is a GORM hook to generate UUID v7 automatically.
func (b *BaseModel) BeforeCreate(tx *gorm.DB) (err error) {
	if b.ID == "" {
		// UUID v7 is time-ordered, excellent for Postgres B-Tree indexes.
		id, err := uuid.NewV7()
		if err != nil {
			return err
		}
		b.ID = id.String()
	}
	return nil
}

// Item represents a single piece of gear.
type Item struct {
	BaseModel
	Name        string `gorm:"type:varchar(255);not null" json:"name"`
	Description string `gorm:"type:text" json:"description"`
	WeightGram  int    `gorm:"not null;default:0" json:"weightGram"`
	// Tags uses Postgres text[] array.
	Tags pq.StringArray `gorm:"type:text[]" json:"tags"`
	// Properties uses JSONB with GIN index for schema-less specs (e.g. "size", "capacity").
	Properties map[string]any `gorm:"type:jsonb;serializer:json;index:,type:gin" json:"properties"`

	// Relations
	Kits            []Kit            `gorm:"many2many:kit_items;" json:"kits,omitempty"`
	MaintenanceLogs []MaintenanceLog `json:"maintenanceLogs,omitempty"`
}

// Kit is a reusable collection of Items.
type Kit struct {
	BaseModel
	Name        string `gorm:"type:varchar(255);not null" json:"name"`
	Description string `gorm:"type:text" json:"description"`

	// Relations
	Items []Item `gorm:"many2many:kit_items;" json:"items,omitempty"`
}

// Loadout is the final packing list for a specific activity.
type Loadout struct {
	BaseModel
	Name         string    `gorm:"type:varchar(255);not null" json:"name"`
	ActivityType string    `gorm:"type:varchar(100);not null" json:"activityType"` // e.g., "Skiing", "Camping"
	EventDate    time.Time `json:"eventDate"`

	// Relations
	Kits  []Kit  `gorm:"many2many:loadout_kits;" json:"kits,omitempty"`
	Items []Item `gorm:"many2many:loadout_items;" json:"items,omitempty"`
}

// MaintenanceLog tracks repair and maintenance history for an Item.
type MaintenanceLog struct {
	BaseModel
	ItemID      string    `gorm:"type:uuid;not null;index" json:"itemId"`
	LogDate     time.Time `gorm:"not null" json:"logDate"`
	ActionTaken string    `gorm:"type:text;not null" json:"actionTaken"`
	Cost        int       `json:"cost"` // in base currency (e.g., JPY)
}
