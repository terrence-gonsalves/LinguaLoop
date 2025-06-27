-- Migration script for notification_settings table
-- Run this in your Supabase SQL editor

-- Add new columns if they don't exist
DO $$ 
BEGIN
    -- Add user_notifications column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notification_settings' 
                   AND column_name = 'user_notifications') THEN
        ALTER TABLE notification_settings ADD COLUMN user_notifications BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add goal_notifications column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notification_settings' 
                   AND column_name = 'goal_notifications') THEN
        ALTER TABLE notification_settings ADD COLUMN goal_notifications BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add expo_push_token column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notification_settings' 
                   AND column_name = 'expo_push_token') THEN
        ALTER TABLE notification_settings ADD COLUMN expo_push_token TEXT;
    END IF;

    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notification_settings' 
                   AND column_name = 'user_id') THEN
        ALTER TABLE notification_settings ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Add proficiency_level column to languages table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'languages' 
                   AND column_name = 'proficiency_level') THEN
        ALTER TABLE languages ADD COLUMN proficiency_level TEXT;
    END IF;
END $$;

-- Create index for user_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'unique_user_notification_settings') THEN
        ALTER TABLE notification_settings 
        ADD CONSTRAINT unique_user_notification_settings UNIQUE (user_id);
    END IF;
END $$;

-- Update existing records to have user_id if they don't have one
-- This assumes you have a way to identify which user each record belongs to
-- You may need to adjust this based on your existing data structure
-- UPDATE notification_settings 
-- SET user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com' LIMIT 1)
-- WHERE user_id IS NULL;

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'notification_settings' 
ORDER BY ordinal_position;

-- Verify the languages table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'languages' 
ORDER BY ordinal_position; 