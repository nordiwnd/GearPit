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
    pub category: String,
    pub properties: Json<serde_json::Value>, // Flexible JSONB
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
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
    pub start_date: DateTime<Utc>,
    pub duration_hours: f64,
    pub base_altitude_m: i32,
    pub max_altitude_m: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// Domain Logic Traits (Ports)
#[async_trait::async_trait]
pub trait GearRepository {
    async fn create(&self, gear: Gear) -> anyhow::Result<Gear>;
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
pub struct TripDetails {
    pub trip: Trip,
    pub kits: Vec<KitDetails>,
    pub total_weight_g: i32,
    pub total_calories: i32,
    pub water_ml: i32,
}
