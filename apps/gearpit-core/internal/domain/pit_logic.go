package domain

// CalculateHydration estimates required water intake in milliliters.
// Formula: (BodyWeight + PackWeight) * 5 * Hours
// bodyWeightKg: Body weight in kg
// packWeightKg: Pack weight in kg
// hours: Duration in hours
func CalculateHydration(bodyWeightKg, packWeightKg float64, hours float64) int {
	if hours <= 0 {
		return 0
	}
	totalWeight := bodyWeightKg + packWeightKg
	return int(totalWeight * 5 * hours)
}

// CalculateCalories estimates calories burned in kcal.
// Formula: 6 * (BodyWeight + PackWeight) * Hours (METs approximation)
// bodyWeightKg: Body weight in kg
// packWeightKg: Pack weight in kg
// hours: Duration in hours
func CalculateCalories(bodyWeightKg, packWeightKg float64, hours float64) int {
	if hours <= 0 {
		return 0
	}
	totalWeight := bodyWeightKg + packWeightKg
	return int(6 * totalWeight * hours)
}
