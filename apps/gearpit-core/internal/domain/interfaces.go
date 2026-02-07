package domain

import (
	"context"
	"time"

	"gorm.io/datatypes"
)

// --- Existing Gear & Inventory ---
const (
	WeightTypeBase       = "base"
	WeightTypeConsumable = "consumable"
	WeightTypeWorn       = "worn"
)

type Item struct {
	ID           string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name         string         `gorm:"not null" json:"name"`
	Description  string         `json:"description"`
	Manufacturer string         `json:"manufacturer"`
	WeightGram   int            `json:"weightGram"`
	WeightType   string         `json:"weightType"` // "base", "consumable", "worn"
	Unit         string         `json:"unit"`       // "g", "kg", "oz"
	Properties   datatypes.JSON `json:"properties"` // Flexible fields (color, size, category, brand, etc.)
	CreatedAt    time.Time      `json:"createdAt"`
	UpdatedAt    time.Time      `json:"updatedAt"`
}

type GearRepository interface {
	Create(ctx context.Context, item *Item) error
	GetByID(ctx context.Context, id string) (*Item, error)
	List(ctx context.Context) ([]Item, error)
	Update(ctx context.Context, item *Item) error
	Delete(ctx context.Context, id string) error
	Search(ctx context.Context, query string) ([]Item, error)
}

type GearService interface {
	CreateItem(ctx context.Context, name, description, manufacturer string, weight int, weightType, category, brand string) (*Item, error)
	GetItem(ctx context.Context, id string) (*Item, error)
	ListItems(ctx context.Context) ([]Item, error)
	UpdateItem(ctx context.Context, id, name, description, manufacturer string, weight int, weightType, category, brand string) (*Item, error)
	DeleteItem(ctx context.Context, id string) error
	SearchItems(ctx context.Context, query string) ([]Item, error)
}

// --- Kits / Containers ---
// (No changes for Kit/Loadout interfaces, kept for compatibility)
type Kit struct {
	ID          string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `json:"description"`
	Items       []Item    `gorm:"many2many:kit_items;" json:"items"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type KitRepository interface {
	Create(ctx context.Context, kit *Kit) error
	GetByID(ctx context.Context, id string) (*Kit, error)
	List(ctx context.Context) ([]Kit, error)
	AddItem(ctx context.Context, kitID, itemID string) error
	RemoveItem(ctx context.Context, kitID, itemID string) error
}

type KitService interface {
	CreateKit(ctx context.Context, name, description string) (*Kit, error)
	GetKit(ctx context.Context, id string) (*Kit, error)
	ListKits(ctx context.Context) ([]Kit, error)
	AddItemToKit(ctx context.Context, kitID, itemID string) error
	RemoveItemFromKit(ctx context.Context, kitID, itemID string) error
}

// --- Loadout (Template) ---
type Loadout struct {
	ID                   string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name                 string    `gorm:"not null" json:"name"`
	ActivityType         string    `json:"activityType"` // hiking, camping, climbing
	Kits                 []Kit     `gorm:"many2many:loadout_kits;" json:"kits"`
	Items                []Item    `gorm:"many2many:loadout_items;" json:"items"`
	TotalWeightGram      int       `json:"totalWeightGram"`               // Computed
	BaseWeightGram       int       `json:"baseWeightGram" gorm:"-"`       // Computed
	ConsumableWeightGram int       `json:"consumableWeightGram" gorm:"-"` // Computed
	WornWeightGram       int       `json:"wornWeightGram" gorm:"-"`       // Computed
	CreatedAt            time.Time `json:"createdAt"`
	UpdatedAt            time.Time `json:"updatedAt"`
}

type LoadoutRepository interface {
	Create(ctx context.Context, loadout *Loadout) error
	GetByID(ctx context.Context, id string) (*Loadout, error)
	List(ctx context.Context) ([]Loadout, error)
	Update(ctx context.Context, loadout *Loadout) error
	Delete(ctx context.Context, id string) error
}

type LoadoutService interface {
	CreateLoadout(ctx context.Context, name, activityType string, kitIds, itemIds []string) (*Loadout, error)
	GetLoadout(ctx context.Context, id string) (*Loadout, error)
	ListLoadouts(ctx context.Context) ([]Loadout, error)
	UpdateLoadout(ctx context.Context, id, name, activityType string, kitIds, itemIds []string) (*Loadout, error)
	DeleteLoadout(ctx context.Context, id string) error
}

// --- Maintenance ---
type MaintenanceLog struct {
	ID          string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ItemID      string    `gorm:"type:uuid;not null" json:"itemId"`
	Date        time.Time `json:"date"`
	Type        string    `json:"type"` // "cleaning", "repair", "inspection"
	Description string    `json:"description"`
	Cost        int       `json:"cost"`
	CreatedAt   time.Time `json:"createdAt"`
}

type MaintenanceRepository interface {
	Create(ctx context.Context, log *MaintenanceLog) error
	GetByItemID(ctx context.Context, itemID string) ([]MaintenanceLog, error)
	Update(ctx context.Context, log *MaintenanceLog) error
	Delete(ctx context.Context, id string) error
}

type MaintenanceService interface {
	AddLog(ctx context.Context, itemID, logType, description string, cost int, date time.Time) (*MaintenanceLog, error)
	GetItemLogs(ctx context.Context, itemID string) ([]MaintenanceLog, error)
	UpdateLog(ctx context.Context, id, logType, description string, cost int, date time.Time) (*MaintenanceLog, error)
	DeleteLog(ctx context.Context, id string) error
}

// --- Dashboard ---
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

type DashboardRepository interface {
	GetStats(ctx context.Context) (*DashboardStats, error)
}

type DashboardService interface {
	GetDashboardStats(ctx context.Context) (*DashboardStats, error)
}

// --- User Profile (New) ---
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

// --- Trip Item (Join Table with Quantity) ---
// GORMの中間テーブルモデル
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

// --- Trip (Updated) ---
type Trip struct {
	ID          string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `json:"description"`
	StartDate   time.Time `json:"startDate"`
	EndDate     time.Time `json:"endDate"`
	Location    string    `json:"location"`

	// User Profile Link
	UserProfileID *string      `gorm:"type:uuid" json:"userProfileId,omitempty"` // Nullable
	UserProfile   *UserProfile `gorm:"foreignKey:UserProfileID" json:"userProfile,omitempty"`

	// Many-to-Many via Join Table
	// Items自体は取得の利便性のために残すが、操作はTripItems経由で行うことが推奨される
	Items     []Item     `gorm:"many2many:trip_items;" json:"-"`
	TripItems []TripItem `gorm:"foreignKey:TripID" json:"tripItems,omitempty"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type TripRepository interface {
	Create(ctx context.Context, trip *Trip) error
	GetByID(ctx context.Context, id string) (*Trip, error)
	List(ctx context.Context) ([]Trip, error)
	Update(ctx context.Context, trip *Trip) error
	Delete(ctx context.Context, id string) error

	// Quantity対応版
	UpsertItem(ctx context.Context, tripID string, itemID string, quantity int) error
	RemoveItem(ctx context.Context, tripID string, itemID string) error
}

type TripService interface {
	CreateTrip(ctx context.Context, name, description, location string, startDate, endDate time.Time, userProfileID *string) (*Trip, error)
	GetTrip(ctx context.Context, id string) (*Trip, error)
	ListTrips(ctx context.Context) ([]Trip, error)
	UpdateTrip(ctx context.Context, id, name, description, location string, startDate, endDate time.Time, userProfileID *string) (*Trip, error)
	DeleteTrip(ctx context.Context, id string) error

	AddOrUpdateItem(ctx context.Context, tripID string, itemID string, quantity int) error
	RemoveItemFromTrip(ctx context.Context, tripID string, itemID string) error
}

// --- Profile Interfaces ---
type ProfileRepository interface {
	Create(ctx context.Context, profile *UserProfile) error
	GetByID(ctx context.Context, id string) (*UserProfile, error)
	List(ctx context.Context) ([]UserProfile, error)
	Update(ctx context.Context, profile *UserProfile) error
	Delete(ctx context.Context, id string) error
}

type ProfileService interface {
	CreateProfile(ctx context.Context, name string, height, weight float64, age int, gender string) (*UserProfile, error)
	GetProfile(ctx context.Context, id string) (*UserProfile, error)
	ListProfiles(ctx context.Context) ([]UserProfile, error)
	UpdateProfile(ctx context.Context, id, name string, height, weight float64, age int, gender string) (*UserProfile, error)
	DeleteProfile(ctx context.Context, id string) error
}
