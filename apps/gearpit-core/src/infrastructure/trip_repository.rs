use sqlx::PgPool;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use crate::domain::models::{Trip, TripDetails, TripItem, Gear, TripItemWithGear, TripCategorySummary, PackingCategory};
use crate::domain::pit_logic::PitLogic;
use std::collections::HashMap;

pub struct TripRepository {
    pool: PgPool,
}

impl TripRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create(
        &self, 
        user_id: Uuid, 
        name: String, 
        target_date: DateTime<Utc>, 
        description: Option<String>,
        base_loadout_id: Option<Uuid>,
        planned_duration_minutes: i32,
        elevation_gain_m: i32
    ) -> anyhow::Result<Trip> {
        let mut tx = self.pool.begin().await?;

        let trip = sqlx::query_as!(
            Trip,
            r#"
            INSERT INTO trips (user_id, name, target_date, description, base_loadout_id, planned_duration_minutes, elevation_gain_m)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, user_id, name, target_date, description, base_loadout_id, planned_duration_minutes, elevation_gain_m, created_at, updated_at
            "#,
            user_id,
            name,
            target_date,
            description,
            base_loadout_id,
            planned_duration_minutes,
            elevation_gain_m
        )
        .fetch_one(&mut *tx)
        .await?;

        if let Some(loadout_id) = base_loadout_id {
            sqlx::query!(
                r#"
                INSERT INTO trip_items (trip_id, gear_id, quantity, packing_category)
                SELECT $1, gear_id, quantity, packing_category
                FROM loadout_items
                WHERE loadout_id = $2
                "#,
                trip.id,
                loadout_id
            )
            .execute(&mut *tx)
            .await?;
        }

        tx.commit().await?;

        Ok(trip)
    }

    pub async fn get_details(&self, trip_id: Uuid) -> anyhow::Result<TripDetails> {
        let trip = sqlx::query_as!(
            Trip,
            "SELECT id, user_id, name, target_date, description, base_loadout_id, planned_duration_minutes, elevation_gain_m, created_at, updated_at FROM trips WHERE id = $1",
            trip_id
        )
        .fetch_one(&self.pool)
        .await?;

        #[derive(sqlx::FromRow)]
        struct ItemWithGearRow {
            ti_id: Uuid,
            ti_trip_id: Uuid,
            ti_gear_id: Uuid,
            ti_quantity: i32,
            ti_packing_category: Option<String>,
            ti_created_at: DateTime<Utc>,
            ti_updated_at: DateTime<Utc>,
            g_id: Uuid,
            g_user_id: Uuid,
            g_name: String,
            g_weight_g: i32,
            g_price: i32,
            g_manufacturer: String,
            g_category: String,
            g_default_packing_category: Option<String>,
            g_properties: serde_json::Value,
            g_created_at: DateTime<Utc>,
            g_updated_at: DateTime<Utc>,
        }

        let rows = sqlx::query_as!(
            ItemWithGearRow,
            r#"
            SELECT 
                ti.id as ti_id, ti.trip_id as ti_trip_id, ti.gear_id as ti_gear_id, ti.quantity as ti_quantity, ti.packing_category as ti_packing_category, ti.created_at as ti_created_at, ti.updated_at as ti_updated_at,
                g.id as g_id, g.user_id as g_user_id, g.name as g_name, g.weight_g as g_weight_g, g.price as g_price, g.manufacturer as g_manufacturer, g.category as g_category, g.default_packing_category as g_default_packing_category, g.properties as g_properties, g.created_at as g_created_at, g.updated_at as g_updated_at
            FROM trip_items ti
            JOIN gears g ON ti.gear_id = g.id
            WHERE ti.trip_id = $1
            "#,
            trip_id
        )
        .fetch_all(&self.pool)
        .await?;

        let mut categories_map: HashMap<Option<PackingCategory>, Vec<TripItemWithGear>> = HashMap::new();
        let mut total_trip_weight = 0;

        for row in rows {
            let gear_weight = row.g_weight_g;
            let quantity = row.ti_quantity;
            let subtotal = gear_weight * quantity;

            total_trip_weight += subtotal;

            let row_packing_cat = row.ti_packing_category.as_deref().map(|s| match s {
                "Worn" => PackingCategory::Worn,
                "InPack" => PackingCategory::InPack,
                "External" => PackingCategory::External,
                "SmallStuff" => PackingCategory::SmallStuff,
                "Consumable" => PackingCategory::Consumable,
                "Other" => PackingCategory::Other,
                _ => PackingCategory::Other,
            });

            let gear_default_cat = row.g_default_packing_category.as_deref().map(|s| match s {
                "Worn" => PackingCategory::Worn,
                "InPack" => PackingCategory::InPack,
                "External" => PackingCategory::External,
                "SmallStuff" => PackingCategory::SmallStuff,
                "Consumable" => PackingCategory::Consumable,
                "Other" => PackingCategory::Other,
                _ => PackingCategory::Other,
            });

            let category = row_packing_cat.or(gear_default_cat);

            let gear = Gear {
                id: row.g_id,
                user_id: row.g_user_id,
                name: row.g_name,
                weight_g: crate::domain::models::Grams(row.g_weight_g),
                price: row.g_price,
                manufacturer: row.g_manufacturer,
                category: row.g_category,
                default_packing_category: gear_default_cat,
                properties: sqlx::types::Json(serde_json::from_value(row.g_properties).unwrap_or(crate::domain::models::GearProperties::Other(serde_json::Value::Null))),
                created_at: row.g_created_at,
                updated_at: row.g_updated_at,
            };

            let item = TripItem {
                id: row.ti_id,
                trip_id: row.ti_trip_id,
                gear_id: row.ti_gear_id,
                quantity: row.ti_quantity,
                packing_category: row_packing_cat,
                created_at: row.ti_created_at,
                updated_at: row.ti_updated_at,
            };

            categories_map.entry(category)
                .or_insert_with(Vec::new)
                .push(TripItemWithGear { item, gear });
        }

        let mut categories = Vec::new();
        for (cat, items) in categories_map {
            let subtotal = items.iter().map(|i| i.gear.weight_g.0 * i.item.quantity).sum();
            categories.push(TripCategorySummary {
                packing_category: cat,
                items,
                subtotal_weight_g: subtotal,
            });
        }

        // Fetch UserProfile to calculate metrics accurately
        #[derive(sqlx::FromRow)]
        struct UserProfileRow {
            weight_g: Option<i32>,
            water_ratio: Option<f32>,
        }
        
        let profile = sqlx::query_as!(
            UserProfileRow,
            "SELECT weight_g, water_ratio FROM user_profiles WHERE user_id = $1",
            trip.user_id
        )
        .fetch_optional(&self.pool)
        .await?;

        let body_weight_kg = profile.as_ref().and_then(|p| p.weight_g).unwrap_or(70000) as f64 / 1000.0;
        let water_ratio = profile.as_ref().and_then(|p| p.water_ratio).unwrap_or(0.75);

        let total_weight_kg = total_trip_weight as f64 / 1000.0;
        let duration_hours = trip.planned_duration_minutes as f64 / 60.0;
        let calories = PitLogic::calc_calories(total_weight_kg, body_weight_kg, duration_hours, trip.elevation_gain_m);
        let water_ml = PitLogic::calc_water_ml(total_weight_kg, body_weight_kg, duration_hours, water_ratio);

        Ok(TripDetails {
            trip,
            categories,
            total_weight_g: total_trip_weight,
            total_calories: calories,
            water_ml,
        })
    }

    pub async fn add_item(&self, trip_id: Uuid, gear_id: Uuid, quantity: i32, packing_category: Option<PackingCategory>) -> anyhow::Result<()> {
        let cat_str = packing_category.map(|c| match c {
            PackingCategory::Worn => "Worn",
            PackingCategory::InPack => "InPack",
            PackingCategory::External => "External",
            PackingCategory::SmallStuff => "SmallStuff",
            PackingCategory::Consumable => "Consumable",
            PackingCategory::Other => "Other",
        });

        sqlx::query!(
            "INSERT INTO trip_items (trip_id, gear_id, quantity, packing_category) VALUES ($1, $2, $3, $4) ON CONFLICT (trip_id, gear_id) DO UPDATE SET quantity = EXCLUDED.quantity, packing_category = EXCLUDED.packing_category",
            trip_id,
            gear_id,
            quantity,
            cat_str
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    pub async fn remove_item(&self, trip_id: Uuid, gear_id: Uuid) -> anyhow::Result<()> {
        sqlx::query!(
            "DELETE FROM trip_items WHERE trip_id = $1 AND gear_id = $2",
            trip_id,
            gear_id
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }
}
