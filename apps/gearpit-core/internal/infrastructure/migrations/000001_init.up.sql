-- Enable UUID extension if not already available (PostgreSQL 13+ includes gen_random_uuid() by default)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Items
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    manufacturer TEXT,
    weight_gram INT,
    weight_type TEXT NOT NULL DEFAULT 'base',
    unit TEXT,
    properties JSONB,
    usage_count INT DEFAULT 0,
    maintenance_interval INT DEFAULT 0,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_items_properties ON items USING GIN (properties);

-- Kits
CREATE TABLE IF NOT EXISTS kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- Loadouts
CREATE TABLE IF NOT EXISTS loadouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    activity_type TEXT,
    target_weight_gram INT,
    total_weight_gram INT DEFAULT 0,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- Maintenance Logs
CREATE TABLE IF NOT EXISTS maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    type TEXT,
    description TEXT,
    cost INT,
    performed_at TIMESTAMPTZ NOT NULL,
    snapshot_usage INT,
    created_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_item_id ON maintenance_logs(item_id);

-- User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    height_cm FLOAT8,
    weight_kg FLOAT8,
    age INT,
    gender TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- Trips
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    location TEXT,
    status TEXT DEFAULT 'planned',
    duration_days INT DEFAULT 1,
    user_profile_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- Join Tables

-- Kit <-> Items
CREATE TABLE IF NOT EXISTS kit_items (
    kit_id UUID NOT NULL REFERENCES kits(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    PRIMARY KEY (kit_id, item_id)
);

-- Loadout <-> Kits
CREATE TABLE IF NOT EXISTS loadout_kits (
    loadout_id UUID NOT NULL REFERENCES loadouts(id) ON DELETE CASCADE,
    kit_id UUID NOT NULL REFERENCES kits(id) ON DELETE CASCADE,
    PRIMARY KEY (loadout_id, kit_id)
);

-- Loadout <-> Items
CREATE TABLE IF NOT EXISTS loadout_items (
    loadout_id UUID NOT NULL REFERENCES loadouts(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    PRIMARY KEY (loadout_id, item_id)
);

-- Trip <-> Items (with quantity)
CREATE TABLE IF NOT EXISTS trip_items (
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    quantity INT DEFAULT 1,
    PRIMARY KEY (trip_id, item_id)
);
