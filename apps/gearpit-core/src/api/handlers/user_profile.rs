use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::AppState;
use crate::domain::models::UserProfile;

#[derive(Deserialize)]
pub struct UpsertUserProfileRequest {
    pub user_id: Uuid,
    pub height_cm: Option<i32>,
    pub weight_g: Option<i32>,
    pub water_ratio: f32,
}

pub async fn get_user_profile(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    let profile = state.user_profile_repo.get(id).await.unwrap();
    // If not found, we could return 404, or just a default/empty response.
    // For now we just return the option as JSON (which is null if None).
    Json(profile)
}

pub async fn upsert_user_profile(
    State(state): State<AppState>,
    Json(payload): Json<UpsertUserProfileRequest>,
) -> impl IntoResponse {
    let profile = state
        .user_profile_repo
        .upsert(payload.user_id, payload.height_cm, payload.weight_g, payload.water_ratio)
        .await
        .unwrap();

    Json(profile)
}
