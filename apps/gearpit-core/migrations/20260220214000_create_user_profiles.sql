CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY,
    height_cm INT,
    weight_g INT,
    water_ratio REAL DEFAULT 0.75,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
