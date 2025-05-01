-- Apply default settings to all existing budgets that don't have settings yet
UPDATE budgets
SET settings = '{
  "notifications": {
    "reminderEnabled": false,
    "reminderDays": 3,
    "emailNotifications": false
  },
  "display": {
    "color": "#0ea5e9",
    "showInDashboard": true,
    "priority": 1
  },
  "tracking": {
    "reoccurring": false,
    "resetDay": 1,
    "customPeriodDays": 30,
    "rollover": false,
    "rolloverLimit": 0
  },
  "spending": {
    "dailyLimit": 0,
    "warningThreshold": 80
  }
}'::jsonb
WHERE settings IS NULL OR settings = '{}'::jsonb;

-- Update all budget settings to include tracking.reoccurring for monthly reset behavior
-- This sets monthly budgets to reoccur automatically
UPDATE budgets
SET settings = jsonb_set(
  CASE 
    WHEN settings IS NULL OR settings = '{}'::jsonb 
    THEN '{
      "notifications": {
        "reminderEnabled": false,
        "reminderDays": 3,
        "emailNotifications": false
      },
      "display": {
        "color": "#0ea5e9",
        "showInDashboard": true,
        "priority": 1
      },
      "tracking": {
        "reoccurring": true,
        "resetDay": 1,
        "customPeriodDays": 30,
        "rollover": false,
        "rolloverLimit": 0
      },
      "spending": {
        "dailyLimit": 0,
        "warningThreshold": 80
      }
    }'::jsonb
    ELSE settings
  END,
  '{tracking,reoccurring}', 
  'true'::jsonb
)
WHERE period = 'monthly'; 