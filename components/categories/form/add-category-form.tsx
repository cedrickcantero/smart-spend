"use client"

import type React from "react"
import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DBCategory } from "@/types/supabase"


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
  "💰",
  "💳",
]

// Color options for categories
const COLOR_OPTIONS = [
  { value: "#0ea5e9", label: "Blue" },
  { value: "#22c55e", label: "Green" },
  { value: "#ef4444", label: "Red" },
  { value: "#eab308", label: "Yellow" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#f97316", label: "Orange" },
  { value: "#6366f1", label: "Indigo" },
  { value: "#94a3b8", label: "Gray" },
  { value: "#000000", label: "Black" },
  { value: "#ffffff", label: "White" },
]

interface AddCategoryFormProps {
  category?: DBCategory
  onSubmit: (category: DBCategory) => void
  onCancel: () => void
}

export function AddCategoryForm({ category, onSubmit, onCancel }: AddCategoryFormProps) {
  const [name, setName] = useState(category?.name || "")
  const [icon, setIcon] = useState<string | null>(category?.icon || "🍔")
  const [color, setColor] = useState<string | null>(category?.color || "#0ea5e9")
  const [isSubmitting, setIsSubmitting] = useState(false)

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
          color,
        })
      } else {
        // Add new category
        await onSubmit({
          name,
          icon,
          color,
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
        <RadioGroup value={color || ""} onValueChange={setColor} className="grid grid-cols-3 gap-2">
          {COLOR_OPTIONS.map((colorOption) => (
            <div key={colorOption.value} className="flex items-center space-x-2">
              <RadioGroupItem value={colorOption.value} id={colorOption.value} className="sr-only" />
              <Label
                htmlFor={colorOption.value}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-muted p-2 hover:bg-muted"
              >
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: colorOption.value }} />
                <span className="text-sm">{colorOption.label}</span>
                {color === colorOption.value && <Check className="ml-auto h-4 w-4 text-primary" />}
              </Label>
            </div>
          ))}
        </RadioGroup>
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
