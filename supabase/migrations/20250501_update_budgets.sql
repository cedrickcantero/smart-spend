-- Update the budgets table with additional columns and computed values

-- Add remaining column if it doesn't exist
ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS remaining DECIMAL(12, 2) GENERATED ALWAYS AS (amount - spent) STORED;
ADD COLUMN IF NOT EXISTS budget_name TEXT;

-- Add status column based on budget usage
ALTER TABLE budgets
ADD COLUMN IF NOT EXISTS status TEXT GENERATED ALWAYS AS (
    CASE 
        WHEN spent >= amount THEN 'exceeded'
        WHEN spent >= (amount * 0.8) THEN 'warning'
        ELSE 'on-track'
    END
) STORED;

-- Add icon column for visual representation
ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS icon TEXT;

-- Add period column for budget time period (default monthly)
ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS period TEXT NOT NULL DEFAULT 'monthly';

-- Add start_date and end_date columns
ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS start_date DATE NOT NULL DEFAULT CURRENT_DATE;

ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS budgets_user_id_idx ON budgets(user_id);
CREATE INDEX IF NOT EXISTS budgets_category_id_idx ON budgets(category_id); 