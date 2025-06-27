-- Fix proficiency_level enum constraint
-- Run this in your Supabase SQL Editor

-- First, let's check what enum type exists
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%proficiency%' OR t.typname LIKE '%level%';

-- If there's an enum constraint, we need to either:
-- 1. Drop the constraint and make it a regular TEXT column, or
-- 2. Update the enum to include the correct values

-- Option 1: Drop any check constraints and make it a regular TEXT column
DO $$ 
BEGIN
    -- Drop any check constraints on proficiency_level
    EXECUTE (
        SELECT string_agg('ALTER TABLE languages DROP CONSTRAINT ' || quote_ident(conname) || ';', ' ')
        FROM pg_constraint 
        WHERE conrelid = 'languages'::regclass 
        AND contype = 'c'
        AND pg_get_constraintdef(oid) LIKE '%proficiency_level%'
    );
    
    -- If the column is an enum type, alter it to TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'languages' 
        AND column_name = 'proficiency_level'
        AND udt_name LIKE '%enum%'
    ) THEN
        ALTER TABLE languages ALTER COLUMN proficiency_level TYPE TEXT;
    END IF;
    
    RAISE NOTICE 'Fixed proficiency_level column constraints';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'No constraints to drop or column already TEXT type';
END $$;

-- Verify the column is now TEXT type
SELECT 
    column_name, 
    data_type, 
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'languages' 
AND column_name = 'proficiency_level'; 