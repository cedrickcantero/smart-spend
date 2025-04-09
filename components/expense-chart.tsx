"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    total: 580,
  },
  {
    name: "Feb",
    total: 690,
  },
  {
    name: "Mar",
    total: 1100,
  },
  {
    name: "Apr",
    total: 1254,
  },
  {
    name: "May",
    total: 900,
  },
  {
    name: "Jun",
    total: 1200,
  },
]

export function ExpenseChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Month</span>
                      <span className="font-bold text-muted-foreground">{payload[0].payload.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Total</span>
                      <span className="font-bold">${payload[0].payload.total}</span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#0ea5e9"
          strokeWidth={2}
          activeDot={{
            r: 6,
            style: { fill: "#0ea5e9", opacity: 0.25 },
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
