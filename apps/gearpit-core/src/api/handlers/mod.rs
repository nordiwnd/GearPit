use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
    Router,
    routing::{get, post, delete},
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::infrastructure::kit_repository::KitRepository;
use crate::infrastructure::trip_repository::TripRepository;
use std::sync::Arc;
use sqlx::PgPool;

use crate::infrastructure::gear_repository::GearRepository;
use crate::infrastructure::user_profile_repository::UserProfileRepository;

pub mod loadout;
pub mod user_profile;

// App State
#[derive(Clone)]
pub struct AppState {
    pub kit_repo: Arc<KitRepository>,
    pub trip_repo: Arc<TripRepository>,
    pub gear_repo: Arc<GearRepository>,
    pub user_profile_repo: Arc<UserProfileRepository>,
    pub pool: PgPool, // Added for direct access in loadout handlers
}

// Request DTOs
#[derive(Deserialize)]
pub struct CreateKitRequest {
    pub user_id: Uuid,
    pub name: String,
}

#[derive(Deserialize)]
pub struct AddKitItemRequest {
    pub gear_id: Uuid,
    pub quantity: i32,
    pub packing_category: Option<crate::domain::models::PackingCategory>, // Optional addition for consistency? No, kit items don't have packing category yet in DB.
    // Actually kit usage of items is different. Focusing on Loadouts.
}

#[derive(Deserialize)]
pub struct CreateTripRequest {
    pub user_id: Uuid,
    pub name: String,
    pub target_date: chrono::DateTime<chrono::Utc>,
    pub description: Option<String>,
    pub base_loadout_id: Option<Uuid>,
    pub planned_duration_minutes: i32,
    pub elevation_gain_m: i32,
}

#[derive(Deserialize)]
pub struct AddTripItemRequest {
    pub gear_id: Uuid,
    pub quantity: i32,
    pub packing_category: Option<crate::domain::models::PackingCategory>,
}

#[derive(Deserialize)]
pub struct CreateGearRequest {
    pub user_id: Uuid,
    pub name: String,
    pub weight_g: i32,
    pub price: i32,
    pub manufacturer: String,
    pub category: String,
    pub default_packing_category: Option<crate::domain::models::PackingCategory>,
    pub properties: crate::domain::models::GearProperties,
}

// Handlers
pub async fn create_gear(
    State(state): State<AppState>,
    Json(payload): Json<CreateGearRequest>,
) -> impl IntoResponse {
    let gear = state.gear_repo.create(payload.user_id, payload.name, payload.weight_g, payload.price, payload.manufacturer, payload.category, payload.default_packing_category, payload.properties).await.unwrap();
    // Note: repository trait doesn't accept default_packing_category yet. Need to update repo.
    Json(gear)
}

pub async fn get_gear(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    let gear = state.gear_repo.get(id).await.unwrap();
    Json(gear)
}

pub async fn create_kit(
    State(state): State<AppState>,
    Json(payload): Json<CreateKitRequest>,
) -> impl IntoResponse {
    let kit = state.kit_repo.create(payload.user_id, payload.name).await.unwrap();
    Json(kit)
}

pub async fn get_kit(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    let details = state.kit_repo.get_details(id).await.unwrap();
    Json(details)
}

pub async fn add_kit_item(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(payload): Json<AddKitItemRequest>,
) -> impl IntoResponse {
    state.kit_repo.add_item(id, payload.gear_id, payload.quantity).await.unwrap();
    Json(serde_json::json!({"status": "ok"}))
}

pub async fn create_trip(
    State(state): State<AppState>,
    Json(payload): Json<CreateTripRequest>,
) -> impl IntoResponse {
    let trip = state.trip_repo.create(payload.user_id, payload.name, payload.target_date, payload.description, payload.base_loadout_id, payload.planned_duration_minutes, payload.elevation_gain_m).await.unwrap();
    Json(trip)
}

pub async fn get_trip(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    let details = state.trip_repo.get_details(id).await.unwrap();
    Json(details)
}

pub async fn add_trip_item(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(payload): Json<AddTripItemRequest>,
) -> impl IntoResponse {
    state.trip_repo.add_item(id, payload.gear_id, payload.quantity, payload.packing_category).await.unwrap();
    Json(serde_json::json!({"status": "ok"}))
}

pub async fn remove_trip_item(
    State(state): State<AppState>,
    Path((id, gear_id)): Path<(Uuid, Uuid)>,
) -> impl IntoResponse {
    state.trip_repo.remove_item(id, gear_id).await.unwrap();
    Json(serde_json::json!({"status": "ok"}))
}

pub async fn list_gears(
    State(state): State<AppState>,
    // Query param for user_id later, defaulting to test user for now
) -> impl IntoResponse {
    let user_id = Uuid::parse_str("00000000-0000-0000-0000-000000000001").unwrap();
    let gears = state.gear_repo.list_by_user(user_id).await.unwrap();
    Json(gears)
}

pub fn api_routes(pool: PgPool) -> Router {
    let kit_repo = Arc::new(KitRepository::new(pool.clone()));
    let trip_repo = Arc::new(TripRepository::new(pool.clone()));
    let gear_repo = Arc::new(GearRepository::new(pool.clone()));
    let user_profile_repo = Arc::new(UserProfileRepository::new(pool.clone()));
    
    let state = AppState { kit_repo, trip_repo, gear_repo, user_profile_repo, pool };

    Router::new()
        .route("/gears", post(create_gear).get(list_gears))
        .route("/gears/:id", get(get_gear))
        .route("/kits", post(create_kit))
        .route("/kits/:id", get(get_kit))
        .route("/kits/:id/items", post(add_kit_item))
        .route("/trips", post(create_trip))
        .route("/trips/:id", get(get_trip))
        .route("/trips/:id/items", post(add_trip_item))
        .route("/trips/:id/items/:gear_id", delete(remove_trip_item))
        // Loadout routes
        .route("/loadouts", get(loadout::list_loadouts).post(loadout::create_loadout))
        .route("/loadouts/:id", get(loadout::get_loadout))
        // User Profile routes
        .route("/user_profiles", post(user_profile::upsert_user_profile))
        .route("/user_profiles/:id", get(user_profile::get_user_profile))
        .with_state(state)
}
