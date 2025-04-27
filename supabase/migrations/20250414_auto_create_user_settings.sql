-- Create a trigger to automatically create a user_settings record when a new user signs up

-- Step 1: Create the function that will be called by the trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a default user_settings record for the new user with comprehensive settings
  INSERT INTO public.user_settings (user_id, settings)
  VALUES (new.id, '{
    "role": "user",
    "email": {
      "productUpdates": false,
      "marketingEmails": false,
      "tipsAndTutorials": false
    },
    "profile": {
      "bio": ""
    },
    "security": {
      "aiFeatures": false,
      "dataCollection": false,
      "twoFactorEnabled": false
    },
    "dashboard": {
      "showAIInsights": false,
      "showUpcomingBills": false,
      "showBudgetProgress": false,
      "showRecentTransactions": false
    },
    "preferences": {
      "theme": "system",
      "currency": "USD",
      "language": "en",
      "animations": false,
      "dateFormat": "MM/DD/YYYY",
      "accentColor": "blue",
      "compactMode": false
    },
    "notifications": {
      "types": {
        "budgetAlerts": false,
        "billReminders": false,
        "weeklyReports": false,
        "unusualActivity": false
      },
      "channels": {
        "pushNotifications": false,
        "emailNotifications": false
      }
    }
  }');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create the trigger to call the function when new users are created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 