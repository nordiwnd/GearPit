-- Add migration script here
CREATE TABLE IF NOT EXISTS loadouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loadout_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loadout_id UUID NOT NULL REFERENCES loadouts(id) ON DELETE CASCADE,
    gear_id UUID NOT NULL REFERENCES gears(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    packing_category TEXT, -- 'Worn', 'InPack', 'External', 'SmallStuff' etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(loadout_id, gear_id)
);

ALTER TABLE gears ADD COLUMN IF NOT EXISTS default_packing_category TEXT;
