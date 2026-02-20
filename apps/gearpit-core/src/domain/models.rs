use serde::{Deserialize, Serialize};
use sqlx::types::Json;
use uuid::Uuid;
use chrono::{DateTime, Utc};

// NewTypes for type safety
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(transparent)]
pub struct Grams(pub i32);

impl From<i32> for Grams {
    fn from(v: i32) -> Self {
        Self(v)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(transparent)]
pub struct Millimeters(pub i32);

impl From<i32> for Millimeters {
    fn from(v: i32) -> Self {
        Self(v)
    }
}

// Gear Entity
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Gear {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    #[sqlx(try_from = "i32")]
    pub weight_g: Grams,
    pub price: i32,
    pub manufacturer: String,
    pub category: String,
    pub default_packing_category: Option<PackingCategory>,
    pub properties: Json<GearProperties>, // Flexible JSONB
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text", rename_all = "PascalCase")]
pub enum PackingCategory {
    Worn,
    InPack,
    External,
    SmallStuff,
    Consumable,
    Other,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type", content = "data")]
pub enum GearProperties {
    Ski(SkiProps),
    Backpack(BackpackProps),
    Tent(TentProps),
    Pole(PoleProps),
    Boots(BootsProps),
    IceAxe(IceAxeProps),
    Crampons(CramponsProps),
    HardShell(HardShellProps),
    Other(serde_json::Value),
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SkiProps {
    pub length_mm: i32,
    pub radius_m: f64,
    pub dimensions_mm: Dimensions,
    pub binding_type: String,
    pub is_preloaded_binding: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Dimensions {
    pub tip: i32,
    pub waist: i32,
    pub tail: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct BackpackProps {
    pub capacity_liters: i32,
    pub back_length_size: String,
    pub has_frame: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TentProps {
    pub capacity_persons: i32,
    pub water_resistance_mm: i32,
    pub shape: String,
    pub is_double_wall: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PoleProps {
    pub is_adjustable: bool,
    pub adjustment_stages: i32,
    pub length_range_mm: LengthRange,
    pub packed_length_mm: i32,
    pub material: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct LengthRange {
    pub min: i32,
    pub max: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct BootsProps {
    pub size_cm: f64,
    pub sole_type: String,
    pub welt_compatibility: WeltCompatibility,
    pub stiffness: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WeltCompatibility {
    pub front: String,
    pub rear: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct IceAxeProps {
    pub shaft_shape: String,
    pub length_mm: i32,
    pub weight_balance: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CramponsProps {
    pub attachment_type: String,
    pub points_count: i32,
    pub material: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct HardShellProps {
    pub water_resistance_mm: i32,
    pub moisture_permeability_g: i32,
    pub has_ventilation: bool,
    pub material_tech: String,
}

// Kit Entity
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Kit {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// Trip Entity
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Trip {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub target_date: DateTime<Utc>,
    pub description: Option<String>,
    pub base_loadout_id: Option<Uuid>,
    pub planned_duration_minutes: i32,
    pub elevation_gain_m: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct TripItem {
    pub id: Uuid,
    pub trip_id: Uuid,
    pub gear_id: Uuid,
    pub quantity: i32,
    pub packing_category: Option<PackingCategory>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}


// Loadout Entity
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Loadout {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct LoadoutItem {
    pub id: Uuid,
    pub loadout_id: Uuid,
    pub gear_id: Uuid,
    pub quantity: i32,
    pub packing_category: Option<PackingCategory>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// Domain Logic Traits (Ports)
#[async_trait::async_trait]
pub trait GearRepository {
    async fn create(&self, user_id: Uuid, name: String, weight_g: i32, price: i32, manufacturer: String, category: String, default_packing_category: Option<PackingCategory>, properties: GearProperties) -> anyhow::Result<Gear>;
    async fn find_by_id(&self, id: Uuid) -> anyhow::Result<Option<Gear>>;
    async fn list_by_user(&self, user_id: Uuid) -> anyhow::Result<Vec<Gear>>;
}

// Join Structs for API responses
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KitItem {
    pub gear: Gear,
    pub quantity: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KitDetails {
    pub kit: Kit,
    pub items: Vec<KitItem>,
    pub total_weight_g: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TripItemWithGear {
    pub item: TripItem,
    pub gear: Gear,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TripCategorySummary {
    pub packing_category: Option<PackingCategory>,
    pub items: Vec<TripItemWithGear>,
    pub subtotal_weight_g: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TripDetails {
    pub trip: Trip,
    pub categories: Vec<TripCategorySummary>,
    pub total_weight_g: i32,
    pub total_calories: i32,
    pub water_ml: i32,
}

// User Profile Entity
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct UserProfile {
    pub user_id: Uuid,
    pub height_cm: Option<i32>,
    pub weight_g: Option<i32>,
    pub water_ratio: Option<f32>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
