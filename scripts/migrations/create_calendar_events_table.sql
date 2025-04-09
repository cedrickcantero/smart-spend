-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  color TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_period TEXT,
  notes TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select only their own events
CREATE POLICY "Users can view their own calendar events"
  ON calendar_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own events
CREATE POLICY "Users can create their own calendar events"
  ON calendar_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own events
CREATE POLICY "Users can update their own calendar events"
  ON calendar_events
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy to allow users to delete their own events
CREATE POLICY "Users can delete their own calendar events"
  ON calendar_events
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS calendar_events_date_idx ON calendar_events(date);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS calendar_events_user_id_idx ON calendar_events(user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row update
CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON calendar_events
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 