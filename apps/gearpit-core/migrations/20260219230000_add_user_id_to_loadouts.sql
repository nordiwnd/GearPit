-- Add user_id to loadouts table
ALTER TABLE loadouts ADD COLUMN user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001';
-- Set default to mimic existing user UUID for dev
