use sqlx::PgPool;
use uuid::Uuid;
use crate::domain::models::{Trip, TripDetails};
use crate::domain::pit_logic::PitLogic;
use crate::infrastructure::kit_repository::KitRepository;

pub struct TripRepository {
    pool: PgPool,
    kit_repo: KitRepository,
}

impl TripRepository {
    pub fn new(pool: PgPool) -> Self {
        let kit_repo = KitRepository::new(pool.clone());
        Self { pool, kit_repo }
    }

    pub async fn create(&self, user_id: Uuid, name: String, start_date: chrono::DateTime<chrono::Utc>, duration_hours: f64) -> anyhow::Result<Trip> {
        let trip = sqlx::query_as!(
            Trip,
            r#"
            INSERT INTO trips (user_id, name, start_date, duration_hours)
            VALUES ($1, $2, $3, $4)
            RETURNING id, user_id, name, start_date, duration_hours, base_altitude_m, max_altitude_m, created_at, updated_at
            "#,
            user_id,
            name,
            start_date,
            duration_hours
        )
        .fetch_one(&self.pool)
        .await?;
        Ok(trip)
    }

    pub async fn get_details(&self, trip_id: Uuid) -> anyhow::Result<TripDetails> {
        let trip = sqlx::query_as!(
            Trip,
            "SELECT id, user_id, name, start_date, duration_hours, base_altitude_m, max_altitude_m, created_at, updated_at FROM trips WHERE id = $1",
            trip_id
        )
        .fetch_one(&self.pool)
        .await?;

        // Get linked kits
        struct Row {
            kit_id: Uuid,
        }
        let rows = sqlx::query_as!(
            Row,
            "SELECT kit_id FROM trip_loadouts WHERE trip_id = $1",
            trip_id
        )
        .fetch_all(&self.pool)
        .await?;

        let mut kits = Vec::new();
        let mut total_trip_weight = 0;

        for row in rows {
            let kit_details = self.kit_repo.get_details(row.kit_id).await?;
            total_trip_weight += kit_details.total_weight_g;
            kits.push(kit_details);
        }

        // Domain Logic Calculations
        let total_weight_kg = total_trip_weight as f64 / 1000.0;
        let calories = PitLogic::calc_calories(total_weight_kg, trip.duration_hours);
        let elevation_gain = trip.max_altitude_m - trip.base_altitude_m; 
        let elevation_gain = if elevation_gain < 0 { 0 } else { elevation_gain };
        let water_ml = PitLogic::calc_water_ml(trip.duration_hours, elevation_gain);

        Ok(TripDetails {
            trip,
            kits,
            total_weight_g: total_trip_weight,
            total_calories: calories,
            water_ml,
        })
    }

    pub async fn add_kit(&self, trip_id: Uuid, kit_id: Uuid) -> anyhow::Result<()> {
        sqlx::query!(
            "INSERT INTO trip_loadouts (trip_id, kit_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            trip_id,
            kit_id
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }
}
