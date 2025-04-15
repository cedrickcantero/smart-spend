-- Update budgets table to match mock data structure
ALTER TABLE IF EXISTS budgets
    ADD COLUMN IF NOT EXISTS budget_name TEXT,
    ADD COLUMN IF NOT EXISTS spent DECIMAL(12, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS remaining DECIMAL(12, 2) GENERATED ALWAYS AS (amount - spent) STORED,
    ADD COLUMN IF NOT EXISTS status TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN spent >= amount THEN 'exceeded'
            WHEN spent >= (amount * 0.8) THEN 'warning'
            ELSE 'on-track'
        END
    ) STORED,
    ADD COLUMN IF NOT EXISTS icon TEXT;

-- Update function to automatically calculate budget spent amounts
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the spent amount in budgets for the corresponding category when expenses change
    WITH category_expenses AS (
        SELECT 
            category_id, 
            SUM(amount) as total_spent
        FROM expenses
        WHERE 
            category_id IS NOT NULL 
            AND date BETWEEN 
                (SELECT start_date FROM budgets WHERE category_id = NEW.category_id)
                AND COALESCE(
                    (SELECT end_date FROM budgets WHERE category_id = NEW.category_id),
                    (SELECT start_date + INTERVAL '1 month' FROM budgets WHERE category_id = NEW.category_id)
                )
        GROUP BY category_id
    )
    UPDATE budgets b
    SET spent = COALESCE(ce.total_spent, 0)
    FROM category_expenses ce
    WHERE b.category_id = ce.category_id
    AND b.category_id = NEW.category_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update budget spent amounts when expenses change
DROP TRIGGER IF EXISTS expenses_update_budget_spent ON expenses;
CREATE TRIGGER expenses_update_budget_spent
AFTER INSERT OR UPDATE OR DELETE ON expenses
FOR EACH ROW EXECUTE FUNCTION update_budget_spent();

-- Add default icons for existing budgets based on category
UPDATE budgets SET icon = c.icon
FROM categories c
WHERE budgets.category_id = c.id
AND budgets.icon IS NULL;

-- Initialize spent values from existing expenses
WITH category_expenses AS (
    SELECT 
        category_id, 
        SUM(amount) as total_spent
    FROM expenses
    WHERE category_id IS NOT NULL
    GROUP BY category_id
)
UPDATE budgets b
SET spent = COALESCE(ce.total_spent, 0)
FROM category_expenses ce
WHERE b.category_id = ce.category_id; 