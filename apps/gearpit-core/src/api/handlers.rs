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

// App State
#[derive(Clone)]
pub struct AppState {
    pub kit_repo: Arc<KitRepository>,
    pub trip_repo: Arc<TripRepository>,
    pub gear_repo: Arc<GearRepository>,
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
}

#[derive(Deserialize)]
pub struct CreateGearRequest {
    pub user_id: Uuid,
    pub name: String,
    pub weight_g: i32,
    pub price: i32,
    pub manufacturer: String,
    pub category: String,
    pub properties: crate::domain::models::GearProperties,
}

// Handlers
pub async fn create_gear(
    State(state): State<AppState>,
    Json(payload): Json<CreateGearRequest>,
) -> impl IntoResponse {
    let gear = state.gear_repo.create(payload.user_id, payload.name, payload.weight_g, payload.price, payload.manufacturer, payload.category, payload.properties).await.unwrap();
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
    Json(payload): Json<AddTripKitRequest>,
) -> impl IntoResponse {
    state.trip_repo.add_kit(id, payload.kit_id).await.unwrap();
    Json(serde_json::json!({"status": "ok"}))
}

pub fn api_routes(pool: PgPool) -> Router {
    let kit_repo = Arc::new(KitRepository::new(pool.clone()));
    let trip_repo = Arc::new(TripRepository::new(pool.clone()));
    let gear_repo = Arc::new(GearRepository::new(pool));
    
    let state = AppState { kit_repo, trip_repo, gear_repo };

    Router::new()
        .route("/gears", post(create_gear))
        .route("/gears/:id", get(get_gear))
        .route("/kits", post(create_kit))
        .route("/kits/:id", get(get_kit))
        .route("/kits/:id/items", post(add_kit_item))
        .route("/trips", post(create_trip))
        .route("/trips/:id", get(get_trip))
        .route("/trips/:id/kits", post(add_trip_kit))
        .with_state(state)
}
