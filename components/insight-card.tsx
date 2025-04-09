import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface InsightCardProps {
  title: string
  description: string
  icon: LucideIcon
  actionText: string
}

export function InsightCard({ title, description, icon: Icon, actionText }: InsightCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="grid gap-1">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          {actionText}
        </Button>
      </CardFooter>
    </Card>
  )
}
