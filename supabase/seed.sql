-- Main seed file that imports all seed data files in the correct order

-- Disable triggers temporarily for faster inserts
-- Note: This will skip the automatic update of the updated_at column
SET session_replication_role = 'replica';

-- Import seed data in proper order to respect foreign key constraints
\i 'seed_data/01_budgets.sql'
\i 'seed_data/02_expenses.sql'
\i 'seed_data/03_savings_goals.sql'

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Verify data was inserted correctly
SELECT 
    'Categories' as table_name, 
    COUNT(*) as record_count 
FROM categories
UNION ALL
SELECT 
    'Budgets' as table_name, 
    COUNT(*) as record_count 
FROM budgets
UNION ALL
SELECT 
    'Expenses' as table_name, 
    COUNT(*) as record_count 
FROM expenses
UNION ALL
SELECT 
    'Savings Goals' as table_name, 
    COUNT(*) as record_count 
FROM savings_goals;