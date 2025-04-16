-- Initialize the first user as an admin
DO $$ 
DECLARE
  first_user_id UUID;
BEGIN
  -- Get the first user ID (oldest user by creation date)
  SELECT id INTO first_user_id 
  FROM auth.users 
  ORDER BY created_at 
  LIMIT 1;
  
  -- Make sure user_settings record exists for this user
  INSERT INTO user_settings (user_id, settings)
  VALUES (first_user_id, '{"role": "admin"}')
  ON CONFLICT (user_id) 
  DO UPDATE SET settings = user_settings.settings || '{"role": "admin"}'::jsonb;
  
  RAISE NOTICE 'User with ID % has been set as admin', first_user_id;
END $$; 