-- Create user settings table for storing user preferences and configurations
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Allow users to manage only their own settings
CREATE POLICY "Allow users to manage own settings"
  ON user_settings
  FOR ALL
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON user_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 