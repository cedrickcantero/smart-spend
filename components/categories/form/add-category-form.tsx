"use client"

import React, { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DBCategory, DBColor } from "@/types/supabase"

const CATEGORY_ICONS = [
  "🍔",
  "🏠",
  "🚗",
  "🎬",
  "🛍️",
  "💡",
  "💊",
  "✈️",
  "📚",
  "👤",
  "📦",
  "💰",
  "💳",
  "🏋️",
  "🎮",
  "🎵",
  "👶",
  "🐶",
  "🎁",
  "🧾",
  "💸",
  "💵",
]

// Default colors in case API fetch fails
const DEFAULT_COLORS = [
  { id: "1", name: "Red", hex_value: "#ef4444", tailwind_key: "red-500", created_at: "", updated_at: "" },
  { id: "2", name: "Blue", hex_value: "#3b82f6", tailwind_key: "blue-500", created_at: "", updated_at: "" },
  { id: "3", name: "Green", hex_value: "#22c55e", tailwind_key: "green-500", created_at: "", updated_at: "" },
  { id: "4", name: "Yellow", hex_value: "#eab308", tailwind_key: "yellow-500", created_at: "", updated_at: "" },
  { id: "5", name: "Purple", hex_value: "#a855f7", tailwind_key: "purple-500", created_at: "", updated_at: "" },
];

interface AddCategoryFormProps {
  category?: DBCategory
  onSubmit: (category: DBCategory) => void
  onCancel: () => void
}

export function AddCategoryForm({ category, onSubmit, onCancel }: AddCategoryFormProps) {
  const [name, setName] = useState(category?.name || "")
  const [icon, setIcon] = useState<string | null>(category?.icon || "🍔")
  const [colorId, setColorId] = useState<string | null>(category?.color || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [colors, setColors] = useState<DBColor[]>(DEFAULT_COLORS)
  const [isLoadingColors, setIsLoadingColors] = useState(true)

  // Fetch colors from the API
  useEffect(() => {
    const fetchColors = async () => {
      try {
        setIsLoadingColors(true)
        const response = await fetch('/api/color');
        
        if (!response.ok) {
          throw new Error('Failed to fetch colors');
        }
        
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          setColors(data);
          
          // If we don't have a color selected yet, set the first one
          if (!colorId && data.length > 0) {
            setColorId(data[0].id);
          }
          
          // If category has a hex value instead of an ID, find the matching color
          if (category?.color && !category.color.startsWith('-')) {
            const matchingColor = data.find(c => c.hex_value === category.color);
            if (matchingColor) {
              setColorId(matchingColor.id);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching colors:', error);
      } finally {
        setIsLoadingColors(false);
      }
    };
    
    fetchColors();
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      return // Don't submit if name is empty
    }

    setIsSubmitting(true)

    try {
      // Find the selected color's hex value for display purposes
      
      if (category) {
        // Update existing category
        await onSubmit({
          ...category,
          name,
          icon,
          color: colorId, // Store color ID for reference
        })
      } else {
        // Add new category
        await onSubmit({
          name,
          icon,
          color: colorId, // Store color ID for reference
        } as DBCategory)
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Groceries, Rent, Transportation"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Icon</Label>
        <div className="grid grid-cols-10 gap-2">
          {CATEGORY_ICONS.map((emoji) => (
            <Button
              key={emoji}
              type="button"
              variant={icon === emoji ? "default" : "outline"}
              className="h-10 w-10 p-0 text-lg"
              onClick={() => setIcon(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        {isLoadingColors ? (
          <div className="text-sm text-muted-foreground">Loading colors...</div>
        ) : (
          <RadioGroup 
            value={colorId || ""} 
            onValueChange={setColorId} 
            className="grid grid-cols-3 gap-2"
          >
            {colors.map((colorOption) => (
              <div key={colorOption.id} className="flex items-center space-x-2">
                <RadioGroupItem value={colorOption.id} id={colorOption.id} className="sr-only" />
                <Label
                  htmlFor={colorOption.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-muted p-2 hover:bg-muted"
                >
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: colorOption.hex_value }} />
                  <span className="text-sm">{colorOption.name}</span>
                  {colorId === colorOption.id && <Check className="ml-auto h-4 w-4 text-primary" />}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !name.trim()}>
          {isSubmitting ? "Saving..." : category ? "Update Category" : "Add Category"}
        </Button>
      </div>
    </form>
  )
}
