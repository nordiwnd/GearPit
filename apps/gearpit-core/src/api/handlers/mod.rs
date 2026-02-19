use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
    Router,
    routing::{get, post},
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::infrastructure::kit_repository::KitRepository;
use crate::infrastructure::trip_repository::TripRepository;
use std::sync::Arc;
use sqlx::PgPool;

use crate::infrastructure::gear_repository::GearRepository;

pub mod loadout;

// App State
#[derive(Clone)]
pub struct AppState {
    pub kit_repo: Arc<KitRepository>,
    pub trip_repo: Arc<TripRepository>,
    pub gear_repo: Arc<GearRepository>,
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
    pub start_date: chrono::DateTime<chrono::Utc>,
    pub duration_hours: f64,
}

#[derive(Deserialize)]
pub struct AddTripKitRequest {
    pub kit_id: Uuid,
    pub duration_multiplier: Option<f64>, // Maybe useful later
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
    let trip = state.trip_repo.create(payload.user_id, payload.name, payload.start_date, payload.duration_hours).await.unwrap();
    Json(trip)
}

pub async fn get_trip(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    let details = state.trip_repo.get_details(id).await.unwrap();
    Json(details)
}

pub async fn add_trip_kit(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(payload): Json<AddTripKitRequest>, // Changed type to match struct name, was AddTripKitRequest in original code?
) -> impl IntoResponse {
    // Original code used AddTripKitRequest which was defined above.
    state.trip_repo.add_kit(id, payload.kit_id).await.unwrap();
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
    
    let state = AppState { kit_repo, trip_repo, gear_repo, pool };

    Router::new()
        .route("/gears", post(create_gear).get(list_gears))
        .route("/gears/:id", get(get_gear))
        .route("/kits", post(create_kit))
        .route("/kits/:id", get(get_kit))
        .route("/kits/:id/items", post(add_kit_item))
        .route("/trips", post(create_trip))
        .route("/trips/:id", get(get_trip))
        // .route("/trips/:id/kits", post(add_trip_kit)) // Original code had this? Wait, original code:
        // .route("/trips/:id/kits", post(add_trip_kit))
        .route("/trips/:id/kits", post(add_trip_kit))
        // Loadout routes
        .route("/loadouts", get(loadout::list_loadouts).post(loadout::create_loadout))
        .route("/loadouts/:id", get(loadout::get_loadout))
        .with_state(state)
}
