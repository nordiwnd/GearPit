use crate::domain::models::Grams;

pub struct PitLogic;

impl PitLogic {
    pub fn calc_total_weight(items: &[(Grams, i32)]) -> Grams {
        let total = items
            .iter()
            .map(|(weight, quantity)| weight.0 * quantity)
            .sum();
        Grams(total)
    }

    /// Calculate calories burned based on hiking metrics.
    /// Formula: 1.8 * duration + 10.0 * elevation (km) for course constant.
    /// course constant * Total weight (Body + Pack)
    pub fn calc_calories(
        total_weight_kg: f64,
        body_weight_kg: f64,
        duration_hours: f64,
        elevation_gain_m: i32,
    ) -> i32 {
        let total_load_kg = body_weight_kg + total_weight_kg;
        let course_constant = 1.8 * duration_hours + 10.0 * (elevation_gain_m as f64 / 1000.0);
        (course_constant * total_load_kg) as i32
    }

    /// Calculate water need: Total weight * 5 * duration_hours * water_ratio
    /// Note: water_ratio defaults to 0.75 in the DB.
    pub fn calc_water_ml(
        total_weight_kg: f64,
        body_weight_kg: f64,
        duration_hours: f64,
        water_ratio: f32,
    ) -> i32 {
        let total_load_kg = body_weight_kg + total_weight_kg;
        let water_loss_ml = total_load_kg * 5.0 * duration_hours;
        (water_loss_ml * water_ratio as f64) as i32
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calc_calories() {
        assert_eq!(PitLogic::calc_calories(10.0, 70.0, 5.0, 1000), 1520);
    }

    #[test]
    fn test_calc_water_ml() {
        assert_eq!(PitLogic::calc_water_ml(10.0, 70.0, 5.0, 0.75), 1500);
    }
}
