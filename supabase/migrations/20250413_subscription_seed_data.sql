-- Seed data for subscriptions table

DO $$
DECLARE
    test_user_id UUID := '09abb4e3-47af-45ba-b4ff-95e027d3989a';
    entertainment_cat_id UUID;
    utilities_cat_id UUID;
    health_cat_id UUID;
    housing_cat_id UUID;
    transport_cat_id UUID;
    shopping_cat_id UUID;
BEGIN
    -- Get category IDs for reference
    SELECT id INTO entertainment_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Entertainment' LIMIT 1;
    SELECT id INTO utilities_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Utilities' LIMIT 1;
    SELECT id INTO health_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Health' LIMIT 1;
    SELECT id INTO housing_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Housing' LIMIT 1;
    SELECT id INTO transport_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Transportation' LIMIT 1;
    SELECT id INTO shopping_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Shopping' LIMIT 1;

    -- Insert sample subscriptions
    INSERT INTO subscriptions (
        user_id, 
        name, 
        description, 
        amount, 
        billing_cycle, 
        next_billing_date, 
        category_id, 
        is_active, 
        payment_method, 
        website, 
        notes
    ) VALUES
    -- Streaming services
    (test_user_id, 'Netflix', 'Streaming movies and TV shows', 14.99, 'monthly', '2023-05-15', entertainment_cat_id, true, 'Credit Card', 'netflix.com', 'Premium plan'),
    (test_user_id, 'Spotify', 'Music streaming service', 9.99, 'monthly', '2023-05-20', entertainment_cat_id, true, 'Credit Card', 'spotify.com', 'Student plan'),
    (test_user_id, 'Disney+', 'Disney, Pixar, Marvel, and Star Wars content', 7.99, 'monthly', '2023-05-10', entertainment_cat_id, true, 'Credit Card', 'disneyplus.com', NULL),
    
    -- Utilities
    (test_user_id, 'Electricity', 'Monthly electricity bill', 85.42, 'monthly', '2023-05-05', utilities_cat_id, true, 'Bank Transfer', NULL, 'Average monthly usage'),
    (test_user_id, 'Internet', 'High-speed internet service', 59.99, 'monthly', '2023-05-01', utilities_cat_id, true, 'Credit Card', NULL, '300 Mbps plan'),
    
    -- Health and fitness
    (test_user_id, 'Gym Membership', 'Local fitness center membership', 50.00, 'monthly', '2023-05-08', health_cat_id, true, 'Credit Card', NULL, 'All-access membership'),
    (test_user_id, 'Health Insurance', 'Medical insurance coverage', 350.00, 'monthly', '2023-05-01', health_cat_id, true, 'Bank Transfer', NULL, 'Family plan'),
    
    -- Housing
    (test_user_id, 'Rent', 'Monthly apartment rent', 1200.00, 'monthly', '2023-05-01', housing_cat_id, true, 'Bank Transfer', NULL, '2-bedroom apartment'),
    
    -- Transportation
    (test_user_id, 'Car Insurance', 'Auto insurance policy', 125.00, 'monthly', '2023-05-10', transport_cat_id, true, 'Bank Transfer', NULL, 'Full coverage'),
    (test_user_id, 'Public Transit Pass', 'Monthly transit pass', 75.00, 'monthly', '2023-05-01', transport_cat_id, true, 'Credit Card', NULL, 'Unlimited rides'),
    
    -- Shopping
    (test_user_id, 'Amazon Prime', 'Prime membership with free shipping', 14.99, 'monthly', '2023-05-15', shopping_cat_id, true, 'Credit Card', 'amazon.com', 'Student discount'),
    
    -- Annual subscriptions
    (test_user_id, 'Adobe Creative Cloud', 'Design software suite', 599.88, 'annually', '2024-04-15', NULL, true, 'Credit Card', 'adobe.com', 'All apps plan'),
    (test_user_id, 'Domain Registration', 'Personal website domain', 14.99, 'annually', '2024-04-10', NULL, true, 'Credit Card', NULL, 'Domain renewal'),
    
    -- Quarterly subscriptions
    (test_user_id, 'Magazine Subscription', 'Digital and print magazine', 29.97, 'quarterly', '2023-07-01', entertainment_cat_id, true, 'Credit Card', NULL, 'Digital + print'),
    
    -- Weekly subscriptions
    (test_user_id, 'Meal Kit Service', 'Weekly meal delivery', 89.99, 'weekly', '2023-04-28', NULL, true, 'Credit Card', NULL, '3 meals for 2 people'),
    
    -- Daily subscriptions
    (test_user_id, 'Newspaper', 'Digital newspaper subscription', 0.99, 'daily', '2023-04-24', NULL, true, 'Credit Card', NULL, 'Digital access');
END $$; 