import { Database } from './supabase/schema'

export type DBColor = Database['public']['Tables']['colors']['Row']
export type DBColorInsert = Database['public']['Tables']['colors']['Insert']
export type DBColorUpdate = Database['public']['Tables']['colors']['Update']

export interface TailwindColor {
  name: string;
  hex: string;
  tailwindKey: string;
}

// Helper function to convert from DB color to app color
export const dbColorToTailwindColor = (dbColor: DBColor): TailwindColor => {
  return {
    name: dbColor.name,
    hex: dbColor.hex_value,
    tailwindKey: dbColor.tailwind_key
  }
}

// Default Tailwind colors with their hex values for use in the app
export const TAILWIND_COLORS = {
  red: '#ef4444',
  orange: '#f97316',
  amber: '#f59e0b',
  yellow: '#eab308',
  lime: '#84cc16',
  green: '#22c55e',
  emerald: '#10b981',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  sky: '#0ea5e9',
  blue: '#3b82f6',
  indigo: '#6366f1',
  violet: '#8b5cf6',
  purple: '#a855f7',
  fuchsia: '#d946ef',
  pink: '#ec4899',
  rose: '#f43f5e',
  slate: '#64748b',
  gray: '#6b7280',
  zinc: '#71717a',
  neutral: '#737373',
  stone: '#78716c',
  black: '#000000',
  white: '#ffffff',
}

// Named color map for display
export const COLOR_NAMES: Record<string, string> = {
  '#ef4444': 'Red',
  '#f97316': 'Orange',
  '#f59e0b': 'Amber',
  '#eab308': 'Yellow',
  '#84cc16': 'Lime',
  '#22c55e': 'Green',
  '#10b981': 'Emerald',
  '#14b8a6': 'Teal',
  '#06b6d4': 'Cyan',
  '#0ea5e9': 'Sky',
  '#3b82f6': 'Blue',
  '#6366f1': 'Indigo',
  '#8b5cf6': 'Violet',
  '#a855f7': 'Purple',
  '#d946ef': 'Fuchsia',
  '#ec4899': 'Pink',
  '#f43f5e': 'Rose',
  '#64748b': 'Slate',
  '#6b7280': 'Gray',
  '#71717a': 'Zinc',
  '#737373': 'Neutral',
  '#78716c': 'Stone',
  '#000000': 'Black',
  '#ffffff': 'White',
}; 