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
    /// Formula: 1.55 * (Body Weight + Pack Weight) * Hiking Hours
    /// Body weight is assumed to be roughly 70kg for now if not provided,
    /// but ideally should be user profile data.
    /// For this version we'll just take total weight in kg.
    /// NOTE: This is a simplified version.
    pub fn calc_calories(total_weight_kg: f64, duration_hours: f64) -> i32 {
        let body_weight_kg = 70.0; // Default placeholder
        let total_load_kg = body_weight_kg + total_weight_kg;
        let _met = 1.55; // Hiking coefficient? Actually 1.55 is a multiplier in the user provided formula.
                         // Standard MET for backpacking is ~7.0.
                         // But we strictly follow user instruction:
                         // "1.55 * (Body Weight + Pack Weight) * Hiking Hours"

        (1.55 * total_load_kg * duration_hours) as i32
    }

    /// Calculate water need: 5ml per kg of body weight + load per hour?
    /// Or standard 500ml/hr + adjustments?
    /// User didn't specify formula for water in 06-logic, so we use a standard estimation.
    /// "Water Need = (Body Weight + Load Weight) * Duration * 5ml" (Hypothetical)
    /// Let's use a safe fallback: 250ml per hour + 50ml per 500m elevation gain.
    pub fn calc_water_ml(duration_hours: f64, elevation_gain_m: i32) -> i32 {
        let base_water = duration_hours * 350.0; // 350ml/hr base
        let elevation_water = (elevation_gain_m as f64 / 500.0) * 200.0; // 200ml per 500m gain
        (base_water + elevation_water) as i32
    }
}
