-- Feedback table schema
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  feedback_text TEXT NOT NULL,
  feedback_type TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'new',
  is_resolved BOOLEAN DEFAULT false
);

-- Set up Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to insert their own feedback
CREATE POLICY "Users can insert their own feedback"
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to view their own feedback
CREATE POLICY "Users can view their own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);