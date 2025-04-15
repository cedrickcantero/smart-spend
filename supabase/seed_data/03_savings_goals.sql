-- Seed data for savings goals

-- Add sample savings goals
INSERT INTO savings_goals (
    id,
    user_id,
    name,
    target_amount,
    current_amount,
    deadline,
    color
) VALUES
    (
        's1d15d72-05fb-4b4f-9650-1c7122183554',
        'auth-user-id-replace-me',
        'Vacation Fund',
        5000.00,
        2340.00,
        (CURRENT_DATE + INTERVAL '6 months')::DATE,
        '#4CAF50'  -- Green
    ),
    (
        's2a25e82-16fc-5c5f-0761-2d8233294665',
        'auth-user-id-replace-me',
        'Emergency Fund',
        10000.00,
        4200.00,
        (CURRENT_DATE + INTERVAL '12 months')::DATE,
        '#2196F3'  -- Blue
    ),
    (
        's3935f93-27fd-6d6f-1872-3e9344305776',
        'auth-user-id-replace-me',
        'New Car Fund',
        15000.00,
        1800.00,
        (CURRENT_DATE + INTERVAL '24 months')::DATE,
        '#FFC107'  -- Yellow/Amber
    );

-- Update the user IDs in savings_goals to match the actual user
CREATE OR REPLACE FUNCTION update_savings_goals_user_ids() 
RETURNS VOID AS $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Get the first user ID from auth.users
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        -- Update the user_id in savings_goals
        UPDATE savings_goals
        SET user_id = first_user_id
        WHERE user_id = 'auth-user-id-replace-me';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to update user IDs
SELECT update_savings_goals_user_ids();

-- Clean up
DROP FUNCTION update_savings_goals_user_ids(); 