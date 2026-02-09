package domain

import (
	"time"

	"gorm.io/datatypes"
)

// --- Enums & Value Types ---

type WeightType string

const (
	WeightTypeBase       WeightType = "base"
	WeightTypeConsumable WeightType = "consumable"
	WeightTypeWorn       WeightType = "worn"
)

// --- Core Entities ---

type Item struct {
	ID           string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name         string         `gorm:"not null" json:"name"`
	Description  string         `json:"description"`
	Manufacturer string         `json:"manufacturer"`
	WeightGram   int            `json:"weightGram"`
	WeightType   WeightType     `gorm:"default:'base';not null" json:"weightType"` // "base", "consumable", "worn"
	Unit         string         `json:"unit"`                                      // "g", "kg", "oz"
	Properties   datatypes.JSON `json:"properties"`                                // Flexible fields (color, size, category, brand, etc.)

	// Maintenance Tracking
	UsageCount          int `gorm:"default:0" json:"usageCount"`
	MaintenanceInterval int `gorm:"default:0" json:"maintenanceInterval"` // 0 means no tracking

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Kit struct {
	ID          string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `json:"description"`
	Items       []Item    `gorm:"many2many:kit_items;" json:"items"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type Loadout struct {
	ID                   string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name                 string    `gorm:"not null" json:"name"`
	ActivityType         string    `json:"activityType"` // hiking, camping, climbing
	Kits                 []Kit     `gorm:"many2many:loadout_kits;" json:"kits"`
	Items                []Item    `gorm:"many2many:loadout_items;" json:"items"`
	TargetWeightGram     *int      `json:"targetWeightGram"`              // User defined budget (nullable)
	TotalWeightGram      int       `json:"totalWeightGram"`               // Computed
	BaseWeightGram       int       `json:"baseWeightGram" gorm:"-"`       // Computed
	ConsumableWeightGram int       `json:"consumableWeightGram" gorm:"-"` // Computed
	WornWeightGram       int       `json:"wornWeightGram" gorm:"-"`       // Computed
	CreatedAt            time.Time `json:"createdAt"`
	UpdatedAt            time.Time `json:"updatedAt"`
}

type MaintenanceLog struct {
	ID          string `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ItemID      string `gorm:"type:uuid;index;not null" json:"itemId"`
	Type        string `json:"type"` // "cleaning", "repair", "inspection"
	Description string `json:"description"`
	Cost        int    `json:"cost"`

	PerformedAt   time.Time `gorm:"not null" json:"performedAt"`
	SnapshotUsage int       `json:"snapshotUsage"` // Records usage_count at the time of maintenance

	CreatedAt time.Time `json:"createdAt"`
}

type UserProfile struct {
	ID        string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	HeightCm  float64   `json:"heightCm"`
	WeightKg  float64   `json:"weightKg"`
	Age       int       `json:"age"`
	Gender    string    `json:"gender"` // "male", "female", "other"
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Trip struct {
	ID          string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `json:"description"`
	StartDate   time.Time `json:"startDate"`
	EndDate     time.Time `json:"endDate"`
	Location    string    `json:"location"`

	Status       string `gorm:"default:'planned'" json:"status"` // 'planned' | 'completed'
	DurationDays int    `gorm:"default:1" json:"durationDays"`

	// User Profile Link
	UserProfileID *string      `gorm:"type:uuid" json:"userProfileId,omitempty"` // Nullable
	UserProfile   *UserProfile `gorm:"foreignKey:UserProfileID" json:"userProfile,omitempty"`

	// Many-to-Many via Join Table
	Items     []Item     `gorm:"many2many:trip_items;" json:"-"`
	TripItems []TripItem `gorm:"foreignKey:TripID" json:"tripItems,omitempty"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// GORM Join Table
type TripItem struct {
	TripID   string `gorm:"type:uuid;primaryKey" json:"tripId"`
	ItemID   string `gorm:"type:uuid;primaryKey" json:"itemId"`
	Quantity int    `gorm:"default:1" json:"quantity"`

	// Relationships
	Trip Trip `gorm:"foreignKey:TripID" json:"-"`
	Item Item `gorm:"foreignKey:ItemID" json:"item"`
}

func (TripItem) TableName() string {
	return "trip_items"
}

// --- Dashboard Stats ---

type CategoryStat struct {
	Category    string `json:"category"`
	Count       int    `json:"count"`
	TotalWeight int    `json:"totalWeight"`
}

type DashboardStats struct {
	TotalItems    int64          `json:"totalItems"`
	TotalWeight   int            `json:"totalWeight"`
	TotalLoadouts int64          `json:"totalLoadouts"`
	TotalCost     int            `json:"totalCost"`
	CategoryStats []CategoryStat `json:"categoryStats"`
}
