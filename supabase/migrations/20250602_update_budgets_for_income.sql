-- Add is_income column to budgets table to distinguish between income and expense budgets
ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS is_income BOOLEAN DEFAULT FALSE;

-- Update the status calculation to handle income budgets appropriately
DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;

-- We need to recreate the status column with income consideration
ALTER TABLE budgets DROP COLUMN IF EXISTS status;

ALTER TABLE budgets
ADD COLUMN status TEXT GENERATED ALWAYS AS (
    CASE 
        WHEN is_income = TRUE THEN
            CASE
                WHEN spent >= amount THEN 'exceeded'
                WHEN spent >= (amount * 0.8) THEN 'approaching'
                ELSE 'on-track'
            END
        ELSE
            CASE 
                WHEN spent >= amount THEN 'exceeded'
                WHEN spent >= (amount * 0.8) THEN 'warning'
                ELSE 'on-track'
            END
    END
) STORED;

-- Recreate updated_at trigger
CREATE TRIGGER update_budgets_updated_at
BEFORE UPDATE ON budgets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 