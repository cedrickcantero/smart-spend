"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { DBColor } from "@/types/supabase"
import { ColorsService } from "@/app/api/colors/service"
import { useToast } from "@/hooks/use-toast"

interface ColorsContextType {
  colors: DBColor[]
  loading: boolean
  error: string | null
  refreshColors: () => Promise<void>
  getColorById: (id: string) => DBColor | undefined
}

const ColorsContext = createContext<ColorsContextType | undefined>(undefined)

export function ColorsProvider({ children }: { children: ReactNode }) {
  const [colors, setColors] = useState<DBColor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const refreshColors = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ColorsService.getColors()
      setColors(data)
    } catch (err) {
      console.error("Failed to fetch colors:", err)
      setError("Failed to load colors")
      toast({
        title: "Error",
        description: "Failed to load colors",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getColorById = (id: string): DBColor | undefined => {
    return colors.find(color => color.id === id)
  }

  useEffect(() => {
    refreshColors()
  }, [])

  const value = {
    colors,
    loading,
    error,
    refreshColors,
    getColorById
  }

  return (
    <ColorsContext.Provider value={value}>
      {children}
    </ColorsContext.Provider>
  )
}

export const useColors = () => {
  const context = useContext(ColorsContext)
  if (context === undefined) {
    throw new Error("useColors must be used within a ColorsProvider")
  }
  return context
} 