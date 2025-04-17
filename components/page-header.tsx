import React from "react"

interface PageHeaderProps {
  heading: string
  subheading?: string
  icon?: React.ReactNode
  children?: React.ReactNode
}

export function PageHeader({ heading, subheading, icon, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
          {subheading && (
            <p className="text-muted-foreground">{subheading}</p>
          )}
        </div>
      </div>
      {children && <div className="mt-2 flex items-center gap-2 md:mt-0">{children}</div>}
    </div>
  )
} 