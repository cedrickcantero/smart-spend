-- Add role management to user settings

-- Function to check if user is an admin
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (settings->>'role') = 'admin', 
      FALSE
    )
    FROM user_settings 
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a user's role
CREATE OR REPLACE FUNCTION update_user_role(target_user_id UUID, new_role TEXT) 
RETURNS VOID AS $$
BEGIN
  UPDATE user_settings
  SET settings = settings || jsonb_build_object('role', new_role)
  WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update color table RLS policies to use the is_admin function
DROP POLICY IF EXISTS "Only service_role can insert colors" ON colors;
DROP POLICY IF EXISTS "Only service_role can update colors" ON colors;
DROP POLICY IF EXISTS "Only service_role can delete colors" ON colors;

-- Create new policies using the is_admin function
CREATE POLICY "Only admins can insert colors"
ON colors FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update colors"
ON colors FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete colors"
ON colors FOR DELETE
USING (is_admin()); 