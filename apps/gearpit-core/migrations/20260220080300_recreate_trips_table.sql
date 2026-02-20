-- Drop existing tables to recreate them with new schema
DROP TABLE IF EXISTS trip_loadouts CASCADE;
DROP TABLE IF EXISTS trip_items CASCADE;
DROP TABLE IF EXISTS trips CASCADE;

-- Recreate trips table based on Issue #38 specifications
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    target_date TIMESTAMPTZ NOT NULL,
    description TEXT,
    base_loadout_id UUID REFERENCES loadouts(id) ON DELETE SET NULL,
    planned_duration_minutes INTEGER NOT NULL DEFAULT 0 CHECK (planned_duration_minutes >= 0),
    elevation_gain_m INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_target_date ON trips(target_date);

-- Create trip_items table
CREATE TABLE trip_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    gear_id UUID NOT NULL REFERENCES gears(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    packing_category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(trip_id, gear_id)
);

CREATE INDEX idx_trip_items_trip_id ON trip_items(trip_id);
