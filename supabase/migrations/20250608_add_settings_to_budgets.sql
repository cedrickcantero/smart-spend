-- Add settings column to budgets table for storing budget-specific settings
ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Default settings structure example
COMMENT ON COLUMN budgets.settings IS 'JSON column for budget-specific settings like:
{
  "tracking": {
    "reoccurring": boolean,
    "resetDay": number,
    "customPeriodDays": number,
  },
}';

-- Ensure indexes exist for performance with JSON data
CREATE INDEX IF NOT EXISTS budgets_settings_gin_idx ON budgets USING gin(settings jsonb_path_ops); 