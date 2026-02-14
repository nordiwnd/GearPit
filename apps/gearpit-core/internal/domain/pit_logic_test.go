package domain

import (
	"testing"
)

func TestCalculateHydration(t *testing.T) {
	tests := []struct {
		name         string
		bodyWeightKg float64
		packWeightKg float64
		hours        float64
		expected     int
	}{
		{"Normal Case", 70.0, 10.0, 5.0, 2000}, // (70+10)*5*5 = 2000
		{"Zero Hours", 70.0, 10.0, 0, 0},       // 0 hours
		{"Heavy Pack", 60.0, 20.0, 10.0, 4000}, // (60+20)*5*10 = 4000
		{"Light Pack", 80.0, 5.0, 2.0, 850},    // (80+5)*5*2 = 850
		{"No Pack", 70.0, 0.0, 1.0, 350},       // (70+0)*5*1 = 350
		{"Zero Weight", 0.0, 0.0, 5.0, 0},      // Edge case
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := CalculateHydration(tt.bodyWeightKg, tt.packWeightKg, tt.hours)
			if got != tt.expected {
				t.Errorf("CalculateHydration() = %v, want %v", got, tt.expected)
			}
		})
	}
}

func TestCalculateCalories(t *testing.T) {
	tests := []struct {
		name         string
		bodyWeightKg float64
		packWeightKg float64
		hours        float64
		expected     int
	}{
		{"Normal Case", 70.0, 10.0, 5.0, 2400}, // 6*(70+10)*5 = 2400
		{"Zero Hours", 70.0, 10.0, 0, 0},       // 0 hours
		{"Heavy Pack", 60.0, 20.0, 10.0, 4800}, // 6*(60+20)*10 = 4800
		{"Light Pack", 80.0, 5.0, 2.0, 1020},   // 6*(85)*2 = 1020
		{"No Pack", 70.0, 0.0, 1.0, 420},       // 6*70*1 = 420
		{"Zero Weight", 0.0, 0.0, 5.0, 0},      // Edge case
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := CalculateCalories(tt.bodyWeightKg, tt.packWeightKg, tt.hours)
			if got != tt.expected {
				t.Errorf("CalculateCalories() = %v, want %v", got, tt.expected)
			}
		})
	}
}
