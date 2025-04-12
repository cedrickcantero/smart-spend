-- Seed data for user settings

DO $$
DECLARE
    test_user_id UUID := '09abb4e3-47af-45ba-b4ff-95e027d3989a'; -- Same test user as in other seed files
BEGIN
    -- Insert user settings with a JSON object containing all application-specific settings
    INSERT INTO user_settings (user_id, settings) VALUES
    (test_user_id, '{
        "email": {
            "productUpdates": true,
            "marketingEmails": false,
            "tipsAndTutorials": true
        },
        "profile": {
            "bio": "I am a test user for the Smart Spend application."
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
            "currency": "PHP",
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
            "paymentMethods": [
                {
                    "type": "visa",
                    "lastFour": "4242",
                    "expiryDate": "12/2025",
                    "isDefault": true
                }
            ],
            "billingAddress": {
                "address": "123 Main St",
                "city": "San Francisco",
                "state": "CA",
                "zipCode": "94103",
                "country": "US"
            },
            "subscription": "free"
        }
    }');
END $$; 