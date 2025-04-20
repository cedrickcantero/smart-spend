"use client"

import React, { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DBCategory } from "@/types/supabase"
import { useColors } from "@/app/contexts/ColorsContext"

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

// Default colors in case context isn't loaded yet
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
  
  // Use colors from the context
  const { colors, loading: isLoadingColors } = useColors()
  
  // Set initial color when colors are loaded
  useEffect(() => {
    if (colors.length > 0) {
      // If we don't have a color selected yet, set the first one
      if (!colorId) {
        setColorId(colors[0].id);
      }
          
      // If category has a hex value instead of an ID, find the matching color
      if (category?.color && !category.color.startsWith('-')) {
        const matchingColor = colors.find(c => c.hex_value === category.color);
        if (matchingColor) {
          setColorId(matchingColor.id);
        }
      }
    }
  }, [colors, category, colorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      return // Don't submit if name is empty
    }

    setIsSubmitting(true)

    try {      
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
  
  // Use the colors from context, falling back to defaults if not loaded yet
  const colorOptions = colors.length > 0 ? colors : DEFAULT_COLORS;
  
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
            {colorOptions.map((colorOption) => (
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
