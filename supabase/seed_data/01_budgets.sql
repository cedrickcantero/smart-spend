-- Seed data for budgets
-- Note: Replace the user_id values with actual user IDs from your auth.users table

-- Add some sample categories first
INSERT INTO categories (id, user_id, name, icon, color)
VALUES
    ('c1b15d72-05fb-4b4f-9650-1c7122183554', '09abb4e3-47af-45ba-b4ff-95e027d3989a', 'Food & Dining', '🍔', '#FF5733'),
    ('c2a25e82-16fc-5c5f-0761-2d8233294665', '09abb4e3-47af-45ba-b4ff-95e027d3989a', 'Transportation', '🚗', '#33A8FF'),
    ('c3935f93-27fd-6d6f-1872-3e9344305776', '09abb4e3-47af-45ba-b4ff-95e027d3989a', 'Entertainment', '🎬', '#9C33FF'),
    ('c4a46fa4-38fe-7e7f-2983-4fa455416887', '09abb4e3-47af-45ba-b4ff-95e027d3989a', 'Shopping', '🛍️', '#FF33E9'),
    ('c5b57fb5-49ff-8f8f-3a94-5fb566527998', '09abb4e3-47af-45ba-b4ff-95e027d3989a', 'Utilities', '💡', '#33FFC7'),
    ('c6c68fc6-50f0-9g9g-4ba5-6fc677638a09', '09abb4e3-47af-45ba-b4ff-95e027d3989a', 'Health', '💊', '#FF3352');

-- Add seed budget data
INSERT INTO budgets (
    id,
    user_id,
    category_id,
    amount,
    spent,
    period,
    icon,
    start_date,
    end_date
) VALUES
    (
        'b1d15d72-05fb-4b4f-9650-1c7122183554',
        '09abb4e3-47af-45ba-b4ff-95e027d3989a',
        'c1b15d72-05fb-4b4f-9650-1c7122183554',
        500.00,
        420.32,
        'monthly',
        '🍔',
        (DATE_TRUNC('month', CURRENT_DATE))::DATE,
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE
    ),
    (
        'b2a25e82-16fc-5c5f-0761-2d8233294665',
        '09abb4e3-47af-45ba-b4ff-95e027d3989a',
        'c2a25e82-16fc-5c5f-0761-2d8233294665',
        300.00,
        250.00,
        'monthly',
        '🚗',
        (DATE_TRUNC('month', CURRENT_DATE))::DATE,
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE
    ),
    (
        'b3935f93-27fd-6d6f-1872-3e9344305776',
        '09abb4e3-47af-45ba-b4ff-95e027d3989a',
        'c3935f93-27fd-6d6f-1872-3e9344305776',
        200.00,
        180.00,
        'monthly',
        '🎬',
        (DATE_TRUNC('month', CURRENT_DATE))::DATE,
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE
    ),
    (
        'b4a46fa4-38fe-7e7f-2983-4fa455416887',
        '09abb4e3-47af-45ba-b4ff-95e027d3989a',
        'c4a46fa4-38fe-7e7f-2983-4fa455416887',
        150.00,
        154.00,
        'monthly',
        '🛍️',
        (DATE_TRUNC('month', CURRENT_DATE))::DATE,
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE
    ),
    (
        'b5b57fb5-49ff-8f8f-3a94-5fb566527998',
        '09abb4e3-47af-45ba-b4ff-95e027d3989a',
        'c5b57fb5-49ff-8f8f-3a94-5fb566527998',
        250.00,
        210.50,
        'monthly',
        '💡',
        (DATE_TRUNC('month', CURRENT_DATE))::DATE,
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE
    ),
    (
        'b6c68fc6-50f0-9g9g-4ba5-6fc677638a09',
        '09abb4e3-47af-45ba-b4ff-95e027d3989a',
        'c6c68fc6-50f0-9g9g-4ba5-6fc677638a09',
        150.00,
        132.50,
        'monthly',
        '💊',
        (DATE_TRUNC('month', CURRENT_DATE))::DATE,
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE
    ),
    -- Add a quarterly budget
    (
        'b7d79fd7-61f1-1h1h-5cb6-7fd788749b10',
        '09abb4e3-47af-45ba-b4ff-95e027d3989a',
        'c3935f93-27fd-6d6f-1872-3e9344305776',
        600.00,
        200.00,
        'quarterly',
        '🎬',
        (DATE_TRUNC('quarter', CURRENT_DATE))::DATE,
        (DATE_TRUNC('quarter', CURRENT_DATE) + INTERVAL '3 months' - INTERVAL '1 day')::DATE
    ),
    -- Add an annual budget
    (
        'b8e80fe8-72f2-2i2i-6dc7-8fe899850c21',
        '09abb4e3-47af-45ba-b4ff-95e027d3989a',
        'c2a25e82-16fc-5c5f-0761-2d8233294665',
        3000.00,
        750.00,
        'yearly',
        '🚗',
        (DATE_TRUNC('year', CURRENT_DATE))::DATE,
        (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year' - INTERVAL '1 day')::DATE
    );

-- Add a function to replace 09abb4e3-47af-45ba-b4ff-95e027d3989a with the actual user ID
-- when the seed script is run
CREATE OR REPLACE FUNCTION replace_seed_user_ids() 
RETURNS VOID AS $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Get the first user ID from auth.users
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        -- Update the user_id in categories
        UPDATE categories
        SET user_id = first_user_id
        WHERE user_id = '09abb4e3-47af-45ba-b4ff-95e027d3989a';
        
        -- Update the user_id in budgets
        UPDATE budgets
        SET user_id = first_user_id
        WHERE user_id = '09abb4e3-47af-45ba-b4ff-95e027d3989a';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to replace user IDs
SELECT replace_seed_user_ids();

-- Clean up (drop the function)
DROP FUNCTION replace_seed_user_ids(); 