-- Create a colors table for system-wide color management
CREATE TABLE IF NOT EXISTS colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    hex_value TEXT NOT NULL,
    tailwind_key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX colors_name_idx ON colors(name);

-- Create updated_at trigger
CREATE TRIGGER update_colors_updated_at
BEFORE UPDATE ON colors
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;

-- Create policies for colors
CREATE POLICY "All users can view colors"
ON colors FOR SELECT
USING (true);

-- Only allow admins to modify colors
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