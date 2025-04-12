import * as React from "react"
import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner"

type ToastProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "destructive" | "success"
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

function toast(props: ToastProps) {
  const { title, description, variant = "default", duration, action } = props

  const actionConfig = action
    ? {
        label: action.label,
        onClick: action.onClick,
      }
    : undefined

  if (variant === "destructive") {
    return sonnerToast.error(title as string, {
      description,
      duration,
      action: actionConfig,
    })
  }

  if (variant === "success") {
    return sonnerToast.success(title as string, {
      description,
      duration,
      action: actionConfig,
    })
  }

  // Default case - use the standard toast
  return sonnerToast(title as string, {
    description,
    duration,
    action: actionConfig,
  })
}

function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  }
}

export { useToast, toast, SonnerToaster }