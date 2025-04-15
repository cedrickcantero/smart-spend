-- Seed data for expenses
-- This will create expenses that match the budget categories and amounts

-- Add seed expenses data for the current month to match budget spending
INSERT INTO expenses (
    id,
    user_id,
    category_id,
    amount,
    merchant,
    description,
    date,
    payment_method,
    is_tax_deductible
) VALUES
    -- Food & Dining expenses (total: 420.32)
    (
        'e1d15d72-05fb-4b4f-9650-1c7122183554',
        'auth-user-id-replace-me',
        'c1b15d72-05fb-4b4f-9650-1c7122183554',
        125.50,
        'Local Restaurant',
        'Dinner with family',
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '5 days')::DATE,
        'Credit Card',
        FALSE
    ),
    (
        'e2a25e82-16fc-5c5f-0761-2d8233294665',
        'auth-user-id-replace-me',
        'c1b15d72-05fb-4b4f-9650-1c7122183554',
        42.75,
        'Grocery Store',
        'Weekly groceries',
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '7 days')::DATE,
        'Debit Card',
        FALSE
    ),
    (
        'e3935f93-27fd-6d6f-1872-3e9344305776',
        'auth-user-id-replace-me',
        'c1b15d72-05fb-4b4f-9650-1c7122183554',
        86.42,
        'Supermarket',
        'Groceries and household items',
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '14 days')::DATE,
        'Credit Card',
        FALSE
    ),
    (
        'e4a46fa4-38fe-7e7f-2983-4fa455416887',
        'auth-user-id-replace-me',
        'c1b15d72-05fb-4b4f-9650-1c7122183554',
        165.65,
        'Party City',
        'Birthday party supplies and food',
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '20 days')::DATE,
        'Credit Card',
        FALSE
    ),
    
    -- Transportation expenses (total: 250.00)
    (
        'e5b57fb5-49ff-8f8f-3a94-5fb566527998',
        'auth-user-id-replace-me',
        'c2a25e82-16fc-5c5f-0761-2d8233294665',
        45.00,
        'Shell Gas Station',
        'Fuel',
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '3 days')::DATE,
        'Credit Card',
        FALSE
    ),
    (
        'e6c68fc6-50f0-9g9g-4ba5-6fc677638a09',
        'auth-user-id-replace-me',
        'c2a25e82-16fc-5c5f-0761-2d8233294665',
        120.00,
        'Auto Shop',
        'Oil change and maintenance',
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '10 days')::DATE,
        'Credit Card',
        FALSE
    ),
    (
        'e7d79fd7-61f1-1h1h-5cb6-7fd788749b10',
        'auth-user-id-replace-me',
        'c2a25e82-16fc-5c5f-0761-2d8233294665',
        85.00,
        'Chevron',
        'Fuel',
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '17 days')::DATE,
        'Debit Card',
        FALSE
    ),
    
    -- Entertainment expenses (total: 180.00)
    (
        'e8e80fe8-72f2-2i2i-6dc7-8fe899850c21',
        'auth-user-id-replace-me',
        'c3935f93-27fd-6d6f-1872-3e9344305776',
        65.00,
        'Cinema',
        'Movie tickets and snacks',
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '6 days')::DATE,
        'Credit Card',
        FALSE
    ),
    (
        'e9f91ff9-83f3-3j3j-7ed8-9fe900961d32',
        'auth-user-id-replace-me',
        'c3935f93-27fd-6d6f-1872-3e9344305776',
        115.00,
        'Concert Hall',
        'Concert tickets',
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '18 days')::DATE,
        'Credit Card',
        FALSE
    ),
    
    -- Shopping expenses (total: 154.00)
    (
        'e10a20f10-94f4-4k4k-8fe9-10fe101a72e43',
        'auth-user-id-replace-me',
        'c4a46fa4-38fe-7e7f-2983-4fa455416887',
        99.00,
        'Department Store',
        'Clothing',
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '9 days')::DATE,
        'Credit Card',
        FALSE
    ),
    (
        'e11b21f11-05f5-5l5l-9ff0-11ff212b83f54',
        'auth-user-id-replace-me',
        'c4a46fa4-38fe-7e7f-2983-4fa455416887',
        55.00,
        'Online Shop',
        'Home decor items',
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '15 days')::DATE,
        'PayPal',
        FALSE
    ),
    
    -- Utilities expenses (total: 210.50)
    (
        'e12c22f12-16f6-6m6m-10f01-12f0323c94g65',
        'auth-user-id-replace-me',
        'c5b57fb5-49ff-8f8f-3a94-5fb566527998',
        120.50,
        'Electric Company',
        'Monthly electricity bill',
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '8 days')::DATE,
        'Bank Transfer',
        FALSE
    ),
    (
        'e13d23f13-27f7-7n7n-11f12-13f1434d05h76',
        'auth-user-id-replace-me',
        'c5b57fb5-49ff-8f8f-3a94-5fb566527998',
        90.00,
        'Water Company',
        'Monthly water bill',
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '12 days')::DATE,
        'Bank Transfer',
        FALSE
    ),
    
    -- Health expenses (total: 132.50)
    (
        'e14e24f14-38f8-8o8o-12f23-14f2545e16i87',
        'auth-user-id-replace-me',
        'c6c68fc6-50f0-9g9g-4ba5-6fc677638a09',
        65.00,
        'Pharmacy',
        'Prescription medications',
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '4 days')::DATE,
        'Health Insurance',
        TRUE
    ),
    (
        'e15f25f15-49f9-9p9p-13f34-15f3656f27j98',
        'auth-user-id-replace-me',
        'c6c68fc6-50f0-9g9g-4ba5-6fc677638a09',
        67.50,
        'Dental Clinic',
        'Dental checkup',
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '19 days')::DATE,
        'Health Insurance',
        TRUE
    );

-- Update the user IDs in expenses to match the actual user
CREATE OR REPLACE FUNCTION update_expense_user_ids() 
RETURNS VOID AS $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Get the first user ID from auth.users
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        -- Update the user_id in expenses
        UPDATE expenses
        SET user_id = first_user_id
        WHERE user_id = 'auth-user-id-replace-me';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to update user IDs
SELECT update_expense_user_ids();

-- Clean up
DROP FUNCTION update_expense_user_ids(); 