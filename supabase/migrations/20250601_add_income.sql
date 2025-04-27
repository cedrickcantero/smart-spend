-- Create income table
CREATE TABLE income (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL,
    source TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT,
    is_taxable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX income_user_id_idx ON income(user_id);
CREATE INDEX income_category_id_idx ON income(category_id);
CREATE INDEX income_date_idx ON income(date);

-- Create updated_at trigger
CREATE TRIGGER update_income_updated_at
BEFORE UPDATE ON income
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS)
ALTER TABLE income ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own income"
ON income FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income"
ON income FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income"
ON income FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income"
ON income FOR DELETE
USING (auth.uid() = user_id); 