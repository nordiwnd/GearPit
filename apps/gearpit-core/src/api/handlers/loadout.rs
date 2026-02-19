use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::domain::models::{Loadout, LoadoutItem, PackingCategory, Gear};
use super::AppState;

#[derive(Deserialize)]
pub struct CreateLoadoutRequest {
    pub name: String,
    pub description: Option<String>,
    pub items: Vec<CreateLoadoutItemRequest>,
}

#[derive(Deserialize)]
pub struct CreateLoadoutItemRequest {
    pub gear_id: Uuid,
    pub quantity: i32,
    pub packing_category: Option<PackingCategory>,
}

#[derive(Serialize)]
pub struct LoadoutResponse {
    pub loadout: Loadout,
    pub items: Vec<LoadoutItemResponse>,
    pub total_weight_g: i32,
    pub pack_weight_g: i32, // InPack
    pub worn_weight_g: i32, // Worn
    pub external_weight_g: i32, // External
    pub consumable_weight_g: i32, // Consumable
    pub other_weight_g: i32, // Other + SmallStuff? Or separate? Let's check PackingCategory
}

#[derive(Serialize)]
pub struct LoadoutItemResponse {
    pub item: LoadoutItem,
    pub gear: Gear,
    pub subtotal_weight_g: i32,
}

pub async fn list_loadouts(
    State(state): State<AppState>,
) -> impl IntoResponse {
    let loadouts = sqlx::query_as::<_, Loadout>(
        "SELECT * FROM loadouts ORDER BY created_at DESC"
    )
    .fetch_all(&state.pool)
    .await;

    match loadouts {
        Ok(l) => (StatusCode::OK, Json(l)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

pub async fn create_loadout(
    State(state): State<AppState>,
    Json(payload): Json<CreateLoadoutRequest>,
) -> impl IntoResponse {
    // Transaction
    let mut tx = match state.pool.begin().await {
        Ok(tx) => tx,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    };

    // 1. Create Loadout
    // Assuming a dummy user_id for now as I don't see auth usage in surrounding code yet
    let user_id = Uuid::nil(); // FIXME: Use real user_id

    let loadout = match sqlx::query_as::<_, Loadout>(
        r#"
        INSERT INTO loadouts (user_id, name, description)
        VALUES ($1, $2, $3)
        RETURNING *
        "#
    )
    .bind(user_id)
    .bind(&payload.name)
    .bind(&payload.description)
    .fetch_one(&mut *tx)
    .await {
        Ok(l) => l,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    };

    // 2. Create Items
    for item in payload.items {
        // TODO: Check if gear exists and belongs to user?
        
        let res = sqlx::query(
            r#"
            INSERT INTO loadout_items (loadout_id, gear_id, quantity, packing_category)
            VALUES ($1, $2, $3, $4)
            "#
        )
        .bind(loadout.id)
        .bind(item.gear_id)
        .bind(item.quantity)
        .bind(item.packing_category)
        .execute(&mut *tx)
        .await;

        if let Err(e) = res {
            return (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response();
        }
    }

    if let Err(e) = tx.commit().await {
        return (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response();
    }

    (StatusCode::CREATED, Json(loadout)).into_response()
}

pub async fn get_loadout(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    // 1. Fetch Loadout
    let loadout = match sqlx::query_as::<_, Loadout>("SELECT * FROM loadouts WHERE id = $1")
        .bind(id)
        .fetch_optional(&state.pool)
        .await
    {
        Ok(Some(l)) => l,
        Ok(None) => return (StatusCode::NOT_FOUND, "Loadout not found").into_response(),
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    };

    // 2. Fetch Items with Gear details
    // We need to join with Gears to get weight
    #[derive(sqlx::FromRow)]
    struct ItemWithGear {
        // LoadoutItem fields
        li_id: Uuid,
        li_loadout_id: Uuid,
        li_gear_id: Uuid,
        li_quantity: i32,
        li_packing_category: Option<PackingCategory>,
        li_created_at: DateTime<Utc>,
        li_updated_at: DateTime<Utc>,
        
        // Gear fields
        g_id: Uuid,
        g_user_id: Uuid,
        g_name: String,
        g_weight_g: i32,
        g_price: i32,
        g_manufacturer: String,
        g_category: String,
        g_default_packing_category: Option<PackingCategory>,
        g_properties: serde_json::Value,
        g_created_at: DateTime<Utc>,
        g_updated_at: DateTime<Utc>,
    }

    let items_with_gear = match sqlx::query_as::<_, ItemWithGear>(
        r#"
        SELECT 
            li.id as li_id, li.loadout_id as li_loadout_id, li.gear_id as li_gear_id, li.quantity as li_quantity, li.packing_category as li_packing_category, li.created_at as li_created_at, li.updated_at as li_updated_at,
            g.id as g_id, g.user_id as g_user_id, g.name as g_name, g.weight_g as g_weight_g, g.price as g_price, g.manufacturer as g_manufacturer, g.category as g_category, g.default_packing_category as g_default_packing_category, g.properties as g_properties, g.created_at as g_created_at, g.updated_at as g_updated_at
        FROM loadout_items li
        JOIN gears g ON li.gear_id = g.id
        WHERE li.loadout_id = $1
        "#
    )
    .bind(id)
    .fetch_all(&state.pool)
    .await {
        Ok(items) => items,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    };

    // 3. Calculate Weights
    let mut total_weight_g = 0;
    let mut pack_weight_g = 0;
    let mut worn_weight_g = 0;
    let mut external_weight_g = 0;
    let mut consumable_weight_g = 0;
    let mut other_weight_g = 0;

    let mut item_responses = Vec::new();

    for row in items_with_gear {
        let gear_weight = row.g_weight_g;
        let quantity = row.li_quantity;
        let subtotal = gear_weight * quantity;

        total_weight_g += subtotal;

        let category = row.li_packing_category.as_ref().or(row.g_default_packing_category.as_ref());
        
        match category {
            Some(PackingCategory::InPack) => pack_weight_g += subtotal,
            Some(PackingCategory::Worn) => worn_weight_g += subtotal,
            Some(PackingCategory::External) => external_weight_g += subtotal,
            Some(PackingCategory::Consumable) => consumable_weight_g += subtotal,
            _ => other_weight_g += subtotal,
        }

        let gear = Gear {
            id: row.g_id,
            user_id: row.g_user_id,
            name: row.g_name,
            weight_g: crate::domain::models::Grams(row.g_weight_g),
            price: row.g_price,
            manufacturer: row.g_manufacturer,
            category: row.g_category,
            default_packing_category: row.g_default_packing_category,
            properties: sqlx::types::Json(serde_json::from_value(row.g_properties).unwrap_or(crate::domain::models::GearProperties::Other(serde_json::Value::Null))),
            created_at: row.g_created_at,
            updated_at: row.g_updated_at,
        };

        let item = LoadoutItem {
            id: row.li_id,
            loadout_id: row.li_loadout_id,
            gear_id: row.li_gear_id,
            quantity: row.li_quantity,
            packing_category: row.li_packing_category,
            created_at: row.li_created_at,
            updated_at: row.li_updated_at,
        };

        item_responses.push(LoadoutItemResponse {
            item,
            gear,
            subtotal_weight_g: subtotal,
        });
    }

    let response = LoadoutResponse {
        loadout,
        items: item_responses,
        total_weight_g,
        pack_weight_g,
        worn_weight_g,
        external_weight_g,
        consumable_weight_g,
        other_weight_g,
    };

    (StatusCode::OK, Json(response)).into_response()
}
