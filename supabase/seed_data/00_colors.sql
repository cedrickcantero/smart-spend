-- Seed data for the colors table with Tailwind default colors

-- Clear existing data
TRUNCATE TABLE colors;

-- Insert Tailwind default colors
INSERT INTO colors (name, hex_value, tailwind_key)
VALUES
  -- Reds
  ('Red', '#ef4444', 'red-500'),
  ('Light Red', '#f87171', 'red-400'),
  ('Dark Red', '#dc2626', 'red-600'),
  
  -- Oranges
  ('Orange', '#f97316', 'orange-500'),
  ('Light Orange', '#fb923c', 'orange-400'),
  ('Dark Orange', '#ea580c', 'orange-600'),
  
  -- Amber
  ('Amber', '#f59e0b', 'amber-500'),
  ('Light Amber', '#fbbf24', 'amber-400'),
  ('Dark Amber', '#d97706', 'amber-600'),
  
  -- Yellow
  ('Yellow', '#eab308', 'yellow-500'),
  ('Light Yellow', '#facc15', 'yellow-400'),
  ('Dark Yellow', '#ca8a04', 'yellow-600'),
  
  -- Lime
  ('Lime', '#84cc16', 'lime-500'),
  ('Light Lime', '#a3e635', 'lime-400'),
  ('Dark Lime', '#65a30d', 'lime-600'),
  
  -- Green
  ('Green', '#22c55e', 'green-500'),
  ('Light Green', '#4ade80', 'green-400'),
  ('Dark Green', '#16a34a', 'green-600'),
  
  -- Emerald
  ('Emerald', '#10b981', 'emerald-500'),
  ('Light Emerald', '#34d399', 'emerald-400'),
  ('Dark Emerald', '#059669', 'emerald-600'),
  
  -- Teal
  ('Teal', '#14b8a6', 'teal-500'),
  ('Light Teal', '#2dd4bf', 'teal-400'),
  ('Dark Teal', '#0d9488', 'teal-600'),
  
  -- Cyan
  ('Cyan', '#06b6d4', 'cyan-500'),
  ('Light Cyan', '#22d3ee', 'cyan-400'),
  ('Dark Cyan', '#0891b2', 'cyan-600'),
  
  -- Sky
  ('Sky', '#0ea5e9', 'sky-500'),
  ('Light Sky', '#38bdf8', 'sky-400'),
  ('Dark Sky', '#0284c7', 'sky-600'),
  
  -- Blue
  ('Blue', '#3b82f6', 'blue-500'),
  ('Light Blue', '#60a5fa', 'blue-400'),
  ('Dark Blue', '#2563eb', 'blue-600'),
  
  -- Indigo
  ('Indigo', '#6366f1', 'indigo-500'),
  ('Light Indigo', '#818cf8', 'indigo-400'),
  ('Dark Indigo', '#4f46e5', 'indigo-600'),
  
  -- Violet
  ('Violet', '#8b5cf6', 'violet-500'),
  ('Light Violet', '#a78bfa', 'violet-400'),
  ('Dark Violet', '#7c3aed', 'violet-600'),
  
  -- Purple
  ('Purple', '#a855f7', 'purple-500'),
  ('Light Purple', '#c084fc', 'purple-400'),
  ('Dark Purple', '#9333ea', 'purple-600'),
  
  -- Fuchsia
  ('Fuchsia', '#d946ef', 'fuchsia-500'),
  ('Light Fuchsia', '#e879f9', 'fuchsia-400'),
  ('Dark Fuchsia', '#c026d3', 'fuchsia-600'),
  
  -- Pink
  ('Pink', '#ec4899', 'pink-500'),
  ('Light Pink', '#f472b6', 'pink-400'),
  ('Dark Pink', '#db2777', 'pink-600'),
  
  -- Rose
  ('Rose', '#f43f5e', 'rose-500'),
  ('Light Rose', '#fb7185', 'rose-400'),
  ('Dark Rose', '#e11d48', 'rose-600'),
  
  -- Grays
  ('Slate', '#64748b', 'slate-500'),
  ('Gray', '#6b7280', 'gray-500'),
  ('Zinc', '#71717a', 'zinc-500'),
  ('Neutral', '#737373', 'neutral-500'),
  ('Stone', '#78716c', 'stone-500'),
  
  -- Monochrome
  ('Black', '#000000', 'black'),
  ('White', '#ffffff', 'white'); 