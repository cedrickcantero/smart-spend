-- Seed data for testing

-- Insert default categories for a test user
-- Replace 'YOUR_TEST_USER_ID' with an actual user ID from your Supabase auth.users table
DO $$
DECLARE
    test_user_id UUID := '09abb4e3-47af-45ba-b4ff-95e027d3989a'; -- Replace with actual user ID
BEGIN
    -- Insert categories
    INSERT INTO categories (user_id, name, icon, color) VALUES
    (test_user_id, 'Food & Dining', '🍔', '#0ea5e9'),
    (test_user_id, 'Housing', '🏠', '#3b82f6'),
    (test_user_id, 'Transportation', '🚗', '#22c55e'),
    (test_user_id, 'Entertainment', '🎬', '#eab308'),
    (test_user_id, 'Shopping', '🛍️', '#ef4444'),
    (test_user_id, 'Utilities', '💡', '#8b5cf6'),
    (test_user_id, 'Health', '💊', '#ec4899'),
    (test_user_id, 'Travel', '✈️', '#0284c7'),
    (test_user_id, 'Education', '📚', '#f97316'),
    (test_user_id, 'Personal', '👤', '#6366f1'),
    (test_user_id, 'Other', '📦', '#94a3b8');

    -- Get category IDs for reference
    DECLARE
        food_cat_id UUID;
        housing_cat_id UUID;
        transport_cat_id UUID;
        entertainment_cat_id UUID;
        shopping_cat_id UUID;
        utilities_cat_id UUID;
    BEGIN
        SELECT id INTO food_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Food & Dining' LIMIT 1;
        SELECT id INTO housing_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Housing' LIMIT 1;
        SELECT id INTO transport_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Transportation' LIMIT 1;
        SELECT id INTO entertainment_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Entertainment' LIMIT 1;
        SELECT id INTO shopping_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Shopping' LIMIT 1;
        SELECT id INTO utilities_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Utilities' LIMIT 1;

        -- Insert sample expenses
        INSERT INTO expenses (user_id, category_id, amount, merchant, description, date, payment_method) VALUES
        (test_user_id, food_cat_id, 4.50, 'Starbucks Coffee', 'Morning coffee', '2023-04-23', 'Credit Card'),
        (test_user_id, shopping_cat_id, 29.99, 'Amazon.com', 'Phone case', '2023-04-22', 'Credit Card'),
        (test_user_id, housing_cat_id, 1200.00, 'Rent Payment', 'Monthly rent', '2023-04-20', 'Bank Transfer'),
        (test_user_id, food_cat_id, 12.48, 'Chipotle', 'Lunch', '2023-04-19', 'Debit Card'),
        (test_user_id, transport_cat_id, 45.23, 'Gas Station', 'Fill up tank', '2023-04-18', 'Credit Card'),
        (test_user_id, entertainment_cat_id, 14.99, 'Netflix Subscription', 'Monthly subscription', '2023-04-15', 'Credit Card');

        -- Insert sample budgets
        INSERT INTO budgets (user_id, category_id, amount, period) VALUES
        (test_user_id, food_cat_id, 500.00, 'monthly'),
        (test_user_id, transport_cat_id, 300.00, 'monthly'),
        (test_user_id, entertainment_cat_id, 200.00, 'monthly'),
        (test_user_id, shopping_cat_id, 150.00, 'monthly'),
        (test_user_id, utilities_cat_id, 250.00, 'monthly');

        -- Insert sample savings goals
        INSERT INTO savings_goals (user_id, name, target_amount, current_amount, deadline, color) VALUES
        (test_user_id, 'Vacation Fund', 5000.00, 2340.00, '2023-12-31', '#22c55e'),
        (test_user_id, 'Emergency Fund', 10000.00, 4200.00, '2023-12-31', '#3b82f6'),
        (test_user_id, 'New Car Fund', 15000.00, 1800.00, '2024-06-30', '#eab308');

        -- Insert sample calendar events
        INSERT INTO calendar_events (user_id, title, amount, category, date, is_recurring, recurring_period) VALUES
        (test_user_id, 'Rent Payment', 1200.00, 'Housing', '2023-05-01', true, 'monthly'),
        (test_user_id, 'Electric Bill', 85.42, 'Utilities', '2023-05-05', true, 'monthly'),
        (test_user_id, 'Gym Membership', 50.00, 'Health', '2023-05-08', true, 'monthly'),
        (test_user_id, 'Netflix Subscription', 14.99, 'Entertainment', '2023-05-15', true, 'monthly');

        -- Insert sample recurring bills
        INSERT INTO recurring_bills (user_id, name, amount, category_id, due_day, frequency, next_due_date, payment_method) VALUES
        (test_user_id, 'Rent', 1200.00, housing_cat_id, 1, 'monthly', '2023-05-01', 'Bank Transfer'),
        (test_user_id, 'Electric Bill', 85.42, utilities_cat_id, 5, 'monthly', '2023-05-05', 'Credit Card'),
        (test_user_id, 'Gym Membership', 50.00, NULL, 8, 'monthly', '2023-05-08', 'Credit Card'),
        (test_user_id, 'Netflix', 14.99, entertainment_cat_id, 15, 'monthly', '2023-05-15', 'Credit Card');
    END;
END $$;


DO $$
DECLARE
  user_id UUID := '09abb4e3-47af-45ba-b4ff-95e027d3989a';
BEGIN
  INSERT INTO calendar_events (user_id, date, title, amount, category, color)
  VALUES
    (user_id, '2023-04-05', 'Electric Bill', 85.42, 'Utilities', 'bg-purple-500'),
    (user_id, '2023-04-08', 'Gym Membership', 50.0, 'Health', 'bg-pink-500'),
    (user_id, '2023-04-10', 'Pharmacy', 32.5, 'Health', 'bg-pink-500'),
    (user_id, '2023-04-14', 'Grocery Store', 87.32, 'Groceries', 'bg-green-500'),
    (user_id, '2023-04-15', 'Netflix Subscription', 14.99, 'Entertainment', 'bg-yellow-500'),
    (user_id, '2023-04-18', 'Gas Station', 45.23, 'Transportation', 'bg-blue-500'),
    (user_id, '2023-04-19', 'Chipotle', 12.48, 'Food & Dining', 'bg-primary'),
    (user_id, '2023-04-20', 'Rent Payment', 1200.0, 'Housing', 'bg-blue-500'),
    (user_id, '2023-04-22', 'Amazon.com', 29.99, 'Shopping', 'bg-red-500'),
    (user_id, '2023-04-23', 'Starbucks Coffee', 4.5, 'Food & Dining', 'bg-primary'),
    (user_id, '2023-05-01', 'Rent Payment', 1200.0, 'Housing', 'bg-blue-500'),
    (user_id, '2023-05-05', 'Electric Bill', 85.42, 'Utilities', 'bg-purple-500'),
    (user_id, '2023-05-08', 'Gym Membership', 50.0, 'Health', 'bg-pink-500'),
    (user_id, '2023-05-15', 'Netflix Subscription', 14.99, 'Entertainment', 'bg-yellow-500');
END;
$$;
