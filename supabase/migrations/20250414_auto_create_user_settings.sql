-- Auto-create user settings for new users

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user_settings()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert default settings for the new user
    INSERT INTO public.user_settings (user_id, settings)
    VALUES (NEW.id, '{
        "email": {
            "productUpdates": true,
            "marketingEmails": false,
            "tipsAndTutorials": true
        },
        "profile": {
            "bio": ""
        },
        "security": {
            "aiFeatures": true,
            "dataCollection": true,
            "twoFactorEnabled": false
        },
        "dashboard": {
            "showAIInsights": true,
            "showUpcomingBills": true,
            "showBudgetProgress": true,
            "showRecentTransactions": true
        },
        "preferences": {
            "theme": "system",
            "currency": "USD",
            "language": "en",
            "animations": true,
            "dateFormat": "MM/DD/YYYY",
            "accentColor": "blue",
            "compactMode": false
        },
        "notifications": {
            "types": {
                "budgetAlerts": true,
                "billReminders": true,
                "weeklyReports": true,
                "unusualActivity": true
            },
            "channels": {
                "pushNotifications": true,
                "emailNotifications": true
            }
        },
        "payment": {
            "paymentMethods": [],
            "billingAddress": {
                "address": "",
                "city": "",
                "state": "",
                "zipCode": "",
                "country": ""
            },
            "subscription": "free"
        }
    }');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after a new user is created
DROP TRIGGER IF EXISTS create_user_settings_trigger ON auth.users;
CREATE TRIGGER create_user_settings_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user_settings();

-- Log message that this migration has been run
DO $$
BEGIN
    RAISE NOTICE 'Migration 20250414: Added trigger to auto-create user settings for new users';
END;
$$; 