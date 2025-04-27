-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean up existing tables if needed (for development)
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS savings_goals CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS recurring_bills CASCADE;

-- Create tables

-- Users table is already handled by Supabase Auth

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL,
    merchant TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT,
    is_tax_deductible BOOLEAN DEFAULT FALSE,
    receipt_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Budgets table
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    spent DECIMAL(12, 2) DEFAULT 0,
    budget_name TEXT NOT NULL,
    remaining DECIMAL(12, 2) GENERATED ALWAYS AS (amount - spent) STORED,
    period TEXT NOT NULL DEFAULT 'monthly', -- 'weekly', 'monthly', 'quarterly', 'yearly'
    status TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN spent >= amount THEN 'exceeded'
            WHEN spent >= (amount * 0.8) THEN 'warning'
            ELSE 'on-track'
        END
    ) STORED,
    icon TEXT,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Savings Goals table
CREATE TABLE savings_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount DECIMAL(12, 2) NOT NULL,
    current_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    deadline DATE,
    color TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Calendar Events table
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount DECIMAL(12, 2),
    category TEXT,
    date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_period TEXT, -- 'daily', 'weekly', 'monthly', 'yearly'
    notes TEXT,
    color TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recurring Bills table
CREATE TABLE recurring_bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    due_day INTEGER, -- Day of month (1-31)
    frequency TEXT NOT NULL, -- 'weekly', 'monthly', 'quarterly', 'yearly'
    next_due_date DATE NOT NULL,
    payment_method TEXT,
    is_automatic BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX expenses_user_id_idx ON expenses(user_id);
CREATE INDEX expenses_category_id_idx ON expenses(category_id);
CREATE INDEX expenses_date_idx ON expenses(date);
CREATE INDEX budgets_user_id_idx ON budgets(user_id);
CREATE INDEX budgets_category_id_idx ON budgets(category_id);
CREATE INDEX savings_goals_user_id_idx ON savings_goals(user_id);
CREATE INDEX calendar_events_user_id_idx ON calendar_events(user_id);
CREATE INDEX calendar_events_date_idx ON calendar_events(date);
CREATE INDEX recurring_bills_user_id_idx ON recurring_bills(user_id);
CREATE INDEX recurring_bills_next_due_date_idx ON recurring_bills(next_due_date);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON expenses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
BEFORE UPDATE ON budgets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at
BEFORE UPDATE ON savings_goals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON calendar_events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_bills_updated_at
BEFORE UPDATE ON recurring_bills
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS)
-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_bills ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Categories policies
CREATE POLICY "Users can view their own categories"
ON categories FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
ON categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
ON categories FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
ON categories FOR DELETE
USING (auth.uid() = user_id);

-- Expenses policies
CREATE POLICY "Users can view their own expenses"
ON expenses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses"
ON expenses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
ON expenses FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
ON expenses FOR DELETE
USING (auth.uid() = user_id);

-- Budgets policies
CREATE POLICY "Users can view their own budgets"
ON budgets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets"
ON budgets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets"
ON budgets FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets"
ON budgets FOR DELETE
USING (auth.uid() = user_id);

-- Savings Goals policies
CREATE POLICY "Users can view their own savings goals"
ON savings_goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings goals"
ON savings_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings goals"
ON savings_goals FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings goals"
ON savings_goals FOR DELETE
USING (auth.uid() = user_id);

-- Calendar Events policies
CREATE POLICY "Users can view their own calendar events"
ON calendar_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar events"
ON calendar_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events"
ON calendar_events FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events"
ON calendar_events FOR DELETE
USING (auth.uid() = user_id);

-- Recurring Bills policies
CREATE POLICY "Users can view their own recurring bills"
ON recurring_bills FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring bills"
ON recurring_bills FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring bills"
ON recurring_bills FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring bills"
ON recurring_bills FOR DELETE
USING (auth.uid() = user_id); 