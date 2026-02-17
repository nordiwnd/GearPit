-- Add migration script here
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE gears (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- Logical link to a user, auth not implemented yet
    name TEXT NOT NULL,
    weight_g INTEGER NOT NULL CHECK (weight_g >= 0),
    price INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gears_user_id ON gears(user_id);
CREATE INDEX idx_gears_category ON gears(category);
CREATE INDEX idx_gears_properties ON gears USING GIN (properties);

CREATE TABLE kits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kits_user_id ON kits(user_id);

CREATE TABLE kit_items (
    kit_id UUID NOT NULL REFERENCES kits(id) ON DELETE CASCADE,
    gear_id UUID NOT NULL REFERENCES gears(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    PRIMARY KEY (kit_id, gear_id)
);

CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    duration_hours FLOAT NOT NULL CHECK (duration_hours >= 0),
    base_altitude_m INTEGER NOT NULL DEFAULT 0,
    max_altitude_m INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_start_date ON trips(start_date);

CREATE TABLE trip_loadouts (
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    kit_id UUID NOT NULL REFERENCES kits(id) ON DELETE RESTRICT,
    PRIMARY KEY (trip_id, kit_id)
);
