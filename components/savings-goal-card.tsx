export function SavingsGoalCard() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-medium">Vacation Fund</div>
          <div className="text-sm text-muted-foreground">$2,340 / $5,000</div>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div className="h-full w-[47%] rounded-full bg-green-500" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-medium">Emergency Fund</div>
          <div className="text-sm text-muted-foreground">$4,200 / $10,000</div>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div className="h-full w-[42%] rounded-full bg-blue-500" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-medium">New Car Fund</div>
          <div className="text-sm text-muted-foreground">$1,800 / $15,000</div>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div className="h-full w-[12%] rounded-full bg-yellow-500" />
        </div>
      </div>
    </div>
  )
}
