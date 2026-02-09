package domain

import (
	"context"
	"time"
)

// --- Existing Gear & Inventory ---

type GearRepository interface {
	Create(ctx context.Context, item *Item) error
	GetByID(ctx context.Context, id string) (*Item, error)
	List(ctx context.Context) ([]Item, error)
	Update(ctx context.Context, item *Item) error
	Delete(ctx context.Context, id string) error
	Search(ctx context.Context, query string) ([]Item, error)

	// Transaction helper
	DoInTransaction(ctx context.Context, fn func(txRepo GearRepository) error) error
	// Maintenance
	AddMaintenanceLog(ctx context.Context, log *MaintenanceLog) error
}

type GearService interface {
	CreateItem(ctx context.Context, name, description, manufacturer string, weight int, weightType WeightType, category, brand string, usageCount, maintenanceInterval int) (*Item, error)
	GetItem(ctx context.Context, id string) (*Item, error)
	ListItems(ctx context.Context) ([]Item, error)
	UpdateItem(ctx context.Context, id, name, description, manufacturer string, weight int, weightType WeightType, category, brand string, usageCount, maintenanceInterval int) (*Item, error)
	DeleteItem(ctx context.Context, id string) error
	SearchItems(ctx context.Context, query string) ([]Item, error)
}

// --- Kits / Containers ---

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

type MaintenanceRepository interface {
	Create(ctx context.Context, log *MaintenanceLog) error
	GetByItemID(ctx context.Context, itemID string) ([]MaintenanceLog, error)
	Update(ctx context.Context, log *MaintenanceLog) error
	Delete(ctx context.Context, id string) error
}

type MaintenanceService interface {
	AddLog(ctx context.Context, itemID, logType, description string, cost int, performedAt time.Time) (*MaintenanceLog, error)
	GetItemLogs(ctx context.Context, itemID string) ([]MaintenanceLog, error)
	UpdateLog(ctx context.Context, id, logType, description string, cost int, performedAt time.Time) (*MaintenanceLog, error)
	DeleteLog(ctx context.Context, id string) error
}

// --- Dashboard ---

type DashboardRepository interface {
	GetStats(ctx context.Context) (*DashboardStats, error)
}

type DashboardService interface {
	GetDashboardStats(ctx context.Context) (*DashboardStats, error)
}

// --- User Profile ---

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

// --- Trip ---

type TripRepository interface {
	Create(ctx context.Context, trip *Trip) error
	GetByID(ctx context.Context, id string) (*Trip, error)
	List(ctx context.Context) ([]Trip, error)
	Update(ctx context.Context, trip *Trip) error
	Delete(ctx context.Context, id string) error

	// Quantity対応版
	UpsertItem(ctx context.Context, tripID string, itemID string, quantity int) error
	RemoveItem(ctx context.Context, tripID string, itemID string) error

	// Transaction helper
	DoInTransaction(ctx context.Context, fn func(txRepo TripRepository) error) error
	IncrementItemUsages(ctx context.Context, tripID string, increment int) error
}

type TripService interface {
	CreateTrip(ctx context.Context, name, description, location string, startDate, endDate time.Time, userProfileID *string, durationDays int) (*Trip, error)
	GetTrip(ctx context.Context, id string) (*Trip, error)
	ListTrips(ctx context.Context) ([]Trip, error)
	UpdateTrip(ctx context.Context, id, name, description, location string, startDate, endDate time.Time, userProfileID *string, durationDays int) (*Trip, error)
	DeleteTrip(ctx context.Context, id string) error
	CompleteTrip(ctx context.Context, id string) error

	AddOrUpdateItem(ctx context.Context, tripID string, itemID string, quantity int) error
	RemoveItemFromTrip(ctx context.Context, tripID string, itemID string) error
}
