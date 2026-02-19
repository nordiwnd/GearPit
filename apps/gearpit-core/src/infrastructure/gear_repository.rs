use sqlx::PgPool;
use uuid::Uuid;
use crate::domain::models::{Gear, GearProperties, PackingCategory};

pub struct GearRepository {
    pool: PgPool,
}

impl GearRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, user_id: Uuid, name: String, weight_g: i32, price: i32, manufacturer: String, category: String, default_packing_category: Option<crate::domain::models::PackingCategory>, properties: crate::domain::models::GearProperties) -> anyhow::Result<Gear> {
        let gear = sqlx::query_as!(
            Gear,
            r#"
            INSERT INTO gears (user_id, name, weight_g, price, manufacturer, category, default_packing_category, properties)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, user_id, name, weight_g, price, manufacturer, category, default_packing_category as "default_packing_category: PackingCategory", properties as "properties: sqlx::types::Json<GearProperties>", created_at, updated_at
            "#,
            user_id,
            name,
            weight_g,
            price,
            manufacturer,
            category,
            default_packing_category as Option<PackingCategory>,
            sqlx::types::Json(properties) as sqlx::types::Json<GearProperties>
        )
        .fetch_one(&self.pool)
        .await?;
        Ok(gear)
    }

    pub async fn get(&self, id: Uuid) -> anyhow::Result<Gear> {
        let gear = sqlx::query_as!(
            Gear,
            r#"SELECT id, user_id, name, weight_g, price, manufacturer, category, default_packing_category as "default_packing_category: PackingCategory", properties as "properties: sqlx::types::Json<GearProperties>", created_at, updated_at FROM gears WHERE id = $1 "#,
            id
        )
        .fetch_one(&self.pool)
        .await?;
        Ok(gear)
    }

    pub async fn list_by_user(&self, user_id: Uuid) -> anyhow::Result<Vec<Gear>> {
        let gears = sqlx::query_as!(
            Gear,
            r#"SELECT id, user_id, name, weight_g, price, manufacturer, category, default_packing_category as "default_packing_category: PackingCategory", properties as "properties: sqlx::types::Json<GearProperties>", created_at, updated_at FROM gears WHERE user_id = $1 ORDER BY created_at DESC "#,
            user_id
        )
        .fetch_all(&self.pool)
        .await?;
        Ok(gears)
    }
}
