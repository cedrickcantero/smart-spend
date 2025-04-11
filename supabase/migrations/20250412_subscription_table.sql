-- Create function to update the updated_at column
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create subscription table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'annually', 'weekly', 'daily')),
  next_billing_date DATE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  payment_method TEXT,
  website TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own subscriptions
CREATE POLICY "Users can view their own subscriptions" 
  ON subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own subscriptions
CREATE POLICY "Users can insert their own subscriptions" 
  ON subscriptions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own subscriptions
CREATE POLICY "Users can update their own subscriptions" 
  ON subscriptions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy to allow users to delete their own subscriptions
CREATE POLICY "Users can delete their own subscriptions" 
  ON subscriptions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger to update the updated_at column
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at(); 