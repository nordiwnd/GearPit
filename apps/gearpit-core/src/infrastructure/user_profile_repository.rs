use sqlx::PgPool;
use uuid::Uuid;
use crate::domain::models::UserProfile;

pub struct UserProfileRepository {
    pool: PgPool,
}

impl UserProfileRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn get(&self, user_id: Uuid) -> anyhow::Result<Option<UserProfile>> {
        let profile = sqlx::query_as!(
            UserProfile,
            "SELECT user_id, height_cm, weight_g, water_ratio, created_at, updated_at FROM user_profiles WHERE user_id = $1",
            user_id
        )
        .fetch_optional(&self.pool)
        .await?;

        Ok(profile)
    }

    pub async fn upsert(&self, user_id: Uuid, height_cm: Option<i32>, weight_g: Option<i32>, water_ratio: f32) -> anyhow::Result<UserProfile> {
        let profile = sqlx::query_as!(
            UserProfile,
            r#"
            INSERT INTO user_profiles (user_id, height_cm, weight_g, water_ratio)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id) DO UPDATE SET
                height_cm = EXCLUDED.height_cm,
                weight_g = EXCLUDED.weight_g,
                water_ratio = EXCLUDED.water_ratio,
                updated_at = NOW()
            RETURNING user_id, height_cm, weight_g, water_ratio, created_at, updated_at
            "#,
            user_id,
            height_cm,
            weight_g,
            water_ratio
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(profile)
    }
}
