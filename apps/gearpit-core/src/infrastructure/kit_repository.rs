use sqlx::PgPool;
use uuid::Uuid;
use crate::domain::models::{Kit, KitDetails, KitItem, Gear, Grams};
use crate::domain::pit_logic::PitLogic;

pub struct KitRepository {
    pool: PgPool,
}

impl KitRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, user_id: Uuid, name: String) -> anyhow::Result<Kit> {
        let kit = sqlx::query_as!(
            Kit,
            r#"
            INSERT INTO kits (user_id, name)
            VALUES ($1, $2)
            RETURNING id, user_id, name, created_at, updated_at
            "#,
            user_id,
            name
        )
        .fetch_one(&self.pool)
        .await?;
        Ok(kit)
    }

    pub async fn get_details(&self, kit_id: Uuid) -> anyhow::Result<KitDetails> {
        let kit = sqlx::query_as!(
            Kit,
            "SELECT id, user_id, name, created_at, updated_at FROM kits WHERE id = $1",
            kit_id
        )
        .fetch_one(&self.pool)
        .await?;

        // Join gear items
        // Note: In a real app we might want to do this in a single query with JSON_AGG,
        // but for clarity and type safety with sqlx macros, fetching separately is often cleaner initially.
        struct Row {
            gear_id: Uuid,
            gear_name: String,
            gear_weight: i32,
            gear_category: String,
            gear_price: i32,
            gear_properties: serde_json::Value,
            quantity: i32,
        }

        let rows = sqlx::query_as!(
            Row,
            r#"
            SELECT 
                g.id as gear_id, g.name as gear_name, g.weight_g as gear_weight, 
                g.category as gear_category, g.price as gear_price, g.properties as gear_properties,
                ki.quantity
            FROM kit_items ki
            JOIN gears g ON g.id = ki.gear_id
            WHERE ki.kit_id = $1
            "#,
            kit_id
        )
        .fetch_all(&self.pool)
        .await?;

        let items: Vec<KitItem> = rows.into_iter().map(|r| KitItem {
            gear: Gear {
                id: r.gear_id,
                user_id: kit.user_id, // Assuming gear belongs to same user or is global
                name: r.gear_name,
                weight_g: Grams(r.gear_weight),
                price: r.gear_price,
                category: r.gear_category,
                properties: sqlx::types::Json(r.gear_properties),
                created_at: chrono::Utc::now(), // Placeholder, not fetched to save query complexity
                updated_at: chrono::Utc::now(),
            },
            quantity: r.quantity,
        }).collect();

        // Calculate total weight using domain logic
        let weight_tuples: Vec<(Grams, i32)> = items.iter().map(|ki| (ki.gear.weight_g, ki.quantity)).collect();
        let total_weight = PitLogic::calc_total_weight(&weight_tuples);

        Ok(KitDetails {
            kit,
            items,
            total_weight_g: total_weight.0,
        })
    }

    pub async fn add_item(&self, kit_id: Uuid, gear_id: Uuid, quantity: i32) -> anyhow::Result<()> {
        sqlx::query!(
            r#"
            INSERT INTO kit_items (kit_id, gear_id, quantity)
            VALUES ($1, $2, $3)
            ON CONFLICT (kit_id, gear_id) DO UPDATE SET quantity = $3
            "#,
            kit_id,
            gear_id,
            quantity
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }
}
