-- Add user metadata for the test user

DO $$
DECLARE
    test_user_id UUID := '09abb4e3-47af-45ba-b4ff-95e027d3989a'; -- Same test user as in other seed files
BEGIN
    -- Update the user metadata in the auth.users table to include name fields
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_build_object(
        'first_name', 'John',
        'last_name', 'Doe',
        'name', 'John Doe', -- Keep full name for backward compatibility
        'avatar_url', '/placeholder.svg?height=96&width=96'
    )
    WHERE id = test_user_id;
END $$; 