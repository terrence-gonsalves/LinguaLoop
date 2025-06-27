-- Check the current schema of the languages table
-- Run this in your Supabase SQL Editor

-- Check if proficiency_level column exists and its type
SELECT 
    column_name, 
    data_type, 
    udt_name,
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'languages' 
AND column_name = 'proficiency_level';

-- Check if there are any enum types
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%proficiency%' OR t.typname LIKE '%level%';

-- Check for any check constraints on the proficiency_level column
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'languages'::regclass 
AND contype = 'c';

-- Show the full table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'languages' 
ORDER BY ordinal_position; 