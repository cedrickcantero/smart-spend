-- Main seed file that imports all seed data files in the correct order

-- Disable triggers temporarily for faster inserts
-- Note: This will skip the automatic update of the updated_at column
SET session_replication_role = 'replica';

-- Import seed data in proper order to respect foreign key constraints
\i 'seed_data/00_colors.sql'

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Verify data was inserted correctly
SELECT 
    'Colors' as table_name, 
    COUNT(*) as record_count 
FROM colors
UNION ALL