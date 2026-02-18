-- Add manufacturer column and index
ALTER TABLE gears ADD COLUMN manufacturer TEXT NOT NULL DEFAULT '';
CREATE INDEX idx_gears_manufacturer ON gears(manufacturer);

-- Add GIN index for properties (JSONB)
-- This allows efficient querying like: properties @> '{"length_mm": 1780}'
CREATE INDEX idx_gears_properties_gin ON gears USING GIN (properties);
